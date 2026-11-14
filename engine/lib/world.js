// World building: sets are real 3D with toon / flat materials and tiling
// hand-painted textures. NO outlines on the environment (outline is opt-in via
// outlineProp()).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makeGradientMap, toonify } from './toon.js';
import { addOutlines } from './outline.js';
import { mulberry32 } from './rng.js';

const RAMP = makeGradientMap([0.42, 0.72, 1.0]);
export const defaultRamp = () => RAMP;

// ------------------------------------------------------------------ Set3D

/**
 * A set = one scene plus everything the stage needs to render it.
 * @param {object} o
 * @param {string|number} [o.background]  clear colour (also the default fog colour)
 * @param {object} [o.fog]     { color, density }  -> FogExp2, or { color, near, far } -> Fog
 * @param {object} [o.grade]   { tint:'#fff', lift:0, gain:1, saturation:1, contrast:1, vignette:0.2, vignetteColor:'#000', edgeBlur:0 }
 * @param {object} [o.bloom]   { strength:0.6, radius:0.5, threshold:1.0 }
 * @param {string} [o.charTint]  colour every character is multiplied by in this set
 * @param {object} [o.godrays] { sun:[x,y,z], color, exposure, radius }  screen-space sun shafts (exteriors)
 */
export class Set3D {
  constructor(o = {}) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(o.background ?? '#202428');
    if (o.fog) {
      const c = new THREE.Color(o.fog.color ?? o.background ?? '#202428');
      this.scene.fog = o.fog.density != null ? new THREE.FogExp2(c, o.fog.density) : new THREE.Fog(c, o.fog.near ?? 5, o.fog.far ?? 60);
    }
    this.grade = { tint: '#ffffff', lift: 0, gain: 1, saturation: 1, contrast: 1, vignette: 0.2, vignetteColor: '#000000', edgeBlur: 0, ...(o.grade ?? {}) };
    this.bloom = { strength: 0.6, radius: 0.5, threshold: 1.0, ...(o.bloom ?? {}) };
    this.charTint = o.charTint ?? '#ffffff';
    this.godrays = o.godrays ?? null;
    this.updaters = [];
    this.named = {};
    this.loading = [];
  }

  /**
   * Add an Object3D, or an fx object ({ object, update(t) }), or an array of either.
   * Optional name: retrieve later with set.get(name) (e.g. inside a shot's update hook).
   */
  add(thing, name) {
    if (Array.isArray(thing)) { thing.forEach((t) => this.add(t)); return thing; }
    if (thing && thing.isObject3D) this.scene.add(thing);
    else if (thing && thing.object) { this.scene.add(thing.object); if (thing.update) this.updaters.push(thing.update); }
    else throw new Error('Set3D.add: expected an Object3D or an fx object');
    if (name) this.named[name] = thing;
    return thing;
  }

  get(name) { return this.named[name]; }

  /** Register a per-frame function of video time: fn(t, frame). Runs every frame (the "world clock"). */
  onUpdate(fn) { this.updaters.push(fn); return this; }

  /** Register a promise the render must wait for (texture / GLB loads). */
  wait(promise) { this.loading.push(promise); return promise; }

  update(t, frame) { for (const fn of this.updaters) fn(t, frame); }
}

// ------------------------------------------------------------------ lights

// Light intensities here are in ALBEDO UNITS: a toon surface shows
//   albedo * (ambient + sun * ramp * shadow)      ramp = 1.0 lit / 0.72 mid / 0.42 facing away
// so ambient 0.45 + sun 0.55 puts a fully lit surface exactly at its albedo and
// a cast shadow at 45 % of it. Keep ambient + sun <= 1.0 or pale walls cross
// the bloom threshold (1.0) and start to glow. (Internally multiplied by pi,
// because three divides diffuse light by pi.)

/**
 * Directional key light with a shadow map.
 * sun({ from:[x,y,z], to:[0,0,0], color, intensity: 0.55, area: 8, mapSize: 2048 })
 *   area  half-size of the square the shadow map covers around `to`
 */
export function sun({ from = [4, 8, 5], to = [0, 0, 0], color = '#fff3dc', intensity = 0.55, area = 8, mapSize = 2048, far = 60, shadow = true } = {}) {
  const l = new THREE.DirectionalLight(color, intensity * Math.PI);
  l.position.set(...from); l.target.position.set(...to);
  l.castShadow = shadow;
  l.shadow.mapSize.set(mapSize, mapSize);
  Object.assign(l.shadow.camera, { left: -area, right: area, top: area, bottom: -area, near: 0.5, far });
  l.shadow.normalBias = 0.04; l.shadow.bias = -0.0004; l.shadow.radius = 2.5;
  const g = new THREE.Group(); g.add(l, l.target); g.userData.light = l;
  return g;
}

/** Spot light (ceiling lamp, window key), no distance falloff by default. spot({ from, to, color, intensity: 0.8, angle: 35, penumbra: 0.5 }) */
export function spot({ from = [0, 4, 0], to = [0, 0, 0], color = '#ffe2b0', intensity = 0.8, angle = 35, penumbra = 0.5, distance = 0, decay = 0, mapSize = 2048, shadow = true } = {}) {
  const l = new THREE.SpotLight(color, intensity * Math.PI, distance, THREE.MathUtils.degToRad(angle), penumbra, decay);
  l.position.set(...from); l.target.position.set(...to);
  l.castShadow = shadow; l.shadow.mapSize.set(mapSize, mapSize); l.shadow.normalBias = 0.04; l.shadow.bias = -0.0006; l.shadow.radius = 3;
  const g = new THREE.Group(); g.add(l, l.target); g.userData.light = l;
  return g;
}

/**
 * Unbanded fill = the colour of every shadow. Tint `ground` toward the set colour so shadows are never black.
 * ambient({ sky: '#ffffff', ground: '#8a8fa8', intensity: 0.45 })
 */
export function ambient({ sky = '#ffffff', ground = '#8a8fa8', intensity = 0.45 } = {}) {
  return new THREE.HemisphereLight(sky, ground, intensity * Math.PI);
}

// ------------------------------------------------------------------ materials

/** Toon material with the shared 3-step ramp. toon({ color, map, emissive, emissiveIntensity, side }) */
export function toon({ color = '#ffffff', map = null, ...rest } = {}) {
  return new THREE.MeshToonMaterial({ color, map, gradientMap: RAMP, ...rest });
}

/** Flat unlit material (signs, paper, screens, sky cards). */
export function flat({ color = '#ffffff', map = null, ...rest } = {}) {
  return new THREE.MeshBasicMaterial({ color, map, toneMapped: false, ...rest });
}

/** A surface that glows through bloom: colour * intensity lands above the bloom threshold (1.0). */
export function glow({ color = '#fff6d8', intensity = 2.5, ...rest } = {}) {
  const c = new THREE.Color(color).multiplyScalar(intensity);
  return new THREE.MeshBasicMaterial({ color: c, toneMapped: false, fog: false, ...rest });
}

// ------------------------------------------------------------------ painted textures

function canvasTexture(c, repeat) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}

const shade = (hex, k) => {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, k);
  return `#${c.getHexString()}`;
};

/** Seeded brush strokes: grass, dirt, plaster, rock. paintedTexture({ base, strokes:[...], count, seed, size, repeat:[u,v] }) */
export function paintedTexture({ base = '#7a8f5a', strokes, size = 512, count = 700, seed = 7, repeat, minW = 6, maxW = 24, len = 70 } = {}) {
  const cols = strokes ?? [shade(base, 0.05), shade(base, -0.05), shade(base, 0.09)];
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const r = mulberry32(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size); g.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = r() * size, y = r() * size, a = r() * Math.PI, l = 20 + r() * len;
    g.strokeStyle = cols[(r() * cols.length) | 0]; g.globalAlpha = 0.3 + r() * 0.4; g.lineWidth = minW + r() * (maxW - minW);
    // draw wrapped so the texture tiles
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
      if (x + ox < -100 || x + ox > size + 100 || y + oy < -100 || y + oy > size + 100) continue;
      g.beginPath(); g.moveTo(x + ox, y + oy); g.lineTo(x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke();
    }
  }
  return canvasTexture(c, repeat);
}

/**
 * Running-bond blocks with a hand-inked mortar line and per-block value jitter
 * (the prison / castle wall look). One tile = `cols` x `rows` blocks.
 * brickTexture({ base, mortar, cols: 2, rows: 4, jitter: 0.03, line: 6, seed, repeat })
 */
export function brickTexture({ base = '#e926a1', mortar, cols = 2, rows = 4, jitter = 0.03, line = 6, size = 512, seed = 3, repeat } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const r = mulberry32(seed);
  const m = mortar ?? shade(base, -0.09);
  g.fillStyle = m; g.fillRect(0, 0, size, size);
  const bw = size / cols, bh = size / rows;
  for (let j = 0; j < rows; j++) {
    const off = j % 2 ? bw / 2 : 0;
    for (let i = -1; i <= cols; i++) {
      const k = (r() - 0.5) * 2 * jitter;
      const wob = () => (r() - 0.5) * line * 0.5;
      const draw = (x) => {
        g.fillStyle = shade(base, k);
        g.beginPath();
        const x0 = x + line / 2 + wob(), y0 = j * bh + line / 2 + wob(), x1 = x + bw - line / 2 + wob(), y1 = (j + 1) * bh - line / 2 + wob();
        g.moveTo(x0, y0); g.lineTo(x1, y0 + wob()); g.lineTo(x1 + wob(), y1); g.lineTo(x0 + wob(), y1 + wob()); g.closePath(); g.fill();
      };
      const x = i * bw + off;
      draw(x);
      if (x + bw > size) draw(x - size); // wrap
    }
  }
  return canvasTexture(c, repeat);
}

/** Wood planks with grain lines. plankTexture({ base, planks: 4, seed, repeat, vertical: false }) */
export function plankTexture({ base = '#8c4e1d', planks = 4, size = 512, seed = 5, repeat, vertical = false } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const r = mulberry32(seed);
  const ph = size / planks;
  for (let j = 0; j < planks; j++) {
    g.fillStyle = shade(base, (r() - 0.5) * 0.07); g.fillRect(0, j * ph, size, ph);
    g.strokeStyle = shade(base, -0.08); g.globalAlpha = 0.5; g.lineWidth = 2;
    for (let k = 0; k < 5; k++) { const y = j * ph + 8 + r() * (ph - 16); const wv = r() * 6; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(size * 0.3, y + wv, size * 0.7, y - wv, size, y); g.stroke(); }
    g.globalAlpha = 1; g.fillStyle = shade(base, -0.16); g.fillRect(0, j * ph, size, 4);
    const sx = r() * size; g.fillRect(sx, j * ph, 4, ph);
  }
  const t = canvasTexture(c, repeat);
  if (vertical) { t.rotation = Math.PI / 2; }
  return t;
}

/** Square tiles with grout. tileTexture({ base, grout, n: 4, jitter, repeat }) */
export function tileTexture({ base = '#78d5e8', grout, n = 4, jitter = 0.02, line = 5, size = 512, seed = 9, repeat } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const r = mulberry32(seed);
  g.fillStyle = grout ?? shade(base, -0.1); g.fillRect(0, 0, size, size);
  const s = size / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = shade(base, (r() - 0.5) * 2 * jitter); g.fillRect(i * s + line / 2, j * s + line / 2, s - line, s - line); }
  return canvasTexture(c, repeat);
}

/** Speckled stone / sand with thin dark crack lines. rockTexture({ base, cracks: 10, speckle: 1400, seed, repeat }) */
export function rockTexture({ base = '#92571f', cracks = 10, speckle = 1400, size = 512, seed = 11, repeat } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const r = mulberry32(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 60; i++) { g.fillStyle = shade(base, (r() - 0.5) * 0.08); g.globalAlpha = 0.35; g.beginPath(); g.ellipse(r() * size, r() * size, 30 + r() * 80, 20 + r() * 50, r() * 3, 0, 7); g.fill(); }
  g.globalAlpha = 0.5;
  for (let i = 0; i < speckle; i++) { g.fillStyle = shade(base, r() < 0.5 ? 0.12 : -0.1); g.fillRect(r() * size, r() * size, 2, 2); }
  g.globalAlpha = 0.7; g.strokeStyle = shade(base, -0.2); g.lineWidth = 2; g.lineCap = 'round';
  for (let i = 0; i < cracks; i++) {
    let x = r() * size, y = r() * size, a = r() * 6.28; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 6; k++) { a += (r() - 0.5) * 1.2; x += Math.cos(a) * 30; y += Math.sin(a) * 30; g.lineTo(x, y); }
    g.stroke();
  }
  g.globalAlpha = 1;
  return canvasTexture(c, repeat);
}

/**
 * Draw anything on a canvas and get a texture: signs, paper notes, labels, screens.
 * drawnTexture(512, 256, (g, w, h) => { g.fillStyle = '#fff'; ... })
 */
export function drawnTexture(w, h, draw, { repeat } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = canvasTexture(c, repeat);
  if (!repeat) t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** Load an image file as a tiling colour texture. Returns the texture now; pass set.wait so the render waits for it. */
export function loadTexture(url, { repeat, set } = {}) {
  const tex = new THREE.Texture();
  tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 8;
  if (repeat) tex.repeat.set(repeat[0], repeat[1]);
  const p = new THREE.ImageLoader().loadAsync(url).then((img) => { tex.image = img; tex.needsUpdate = true; return tex; });
  if (set) set.wait(p);
  tex.userData.ready = p;
  return tex;
}

/**
 * Load a GLB / glTF into a holder group (returned immediately; filled when loaded).
 * By default materials are converted to toon and NO outline is added.
 * loadGLB('assets/barrel.glb', { set, scale: 1, toon: true, outline: false, outlineWidth: 0.02, shadows: true })
 * The promise is at holder.userData.ready and resolves to { scene, animations, mixer }.
 * Animate with mixer.setTime(t) inside set.onUpdate; never mixer.update(dt).
 */
export function loadGLB(url, { set, scale = 1, toon: toToon = true, outline = false, outlineWidth = 0.02, outlineColor = '#2c1821', shadows = true } = {}) {
  const holder = new THREE.Group(); holder.name = `glb:${url}`;
  const p = new GLTFLoader().loadAsync(url).then((gltf) => {
    if (toToon) toonify(gltf.scene, { gradientMap: RAMP });
    gltf.scene.traverse((o) => { if (o.isMesh) { o.castShadow = shadows; o.receiveShadow = shadows; } });
    if (outline) addOutlines(gltf.scene, { mode: 'world', thickness: outlineWidth, color: outlineColor, smoothNormals: true });
    gltf.scene.scale.setScalar(scale);
    holder.add(gltf.scene);
    const mixer = gltf.animations.length ? new THREE.AnimationMixer(gltf.scene) : null;
    return { scene: gltf.scene, animations: gltf.animations, mixer };
  });
  if (set) set.wait(p);
  holder.userData.ready = p;
  return holder;
}

/** Opt a prop in to the ink outline (characters' props, hero objects). World-space width. */
export function outlineProp(root, { width = 0.022, color = '#2c1821' } = {}) {
  addOutlines(root, { mode: 'world', thickness: width, color, smoothNormals: true });
  return root;
}

// ------------------------------------------------------------------ geometry helpers

/** Box mesh. box({ size:[w,h,d], at:[x,y,z], material | color, shadow: true }) */
export function box({ size = [1, 1, 1], at = [0, 0, 0], rot, material, color = '#ffffff', shadow = true } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), material ?? toon({ color }));
  m.position.set(...at); if (rot) m.rotation.set(...rot);
  m.castShadow = shadow; m.receiveShadow = true;
  return m;
}

/** Flat quad. quad({ size:[w,h], at, rot, material }) faces +Z before `rot`. */
export function quad({ size = [1, 1], at = [0, 0, 0], rot, material, color = '#ffffff', shadow = false } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(...size), material ?? flat({ color }));
  m.position.set(...at); if (rot) m.rotation.set(...rot);
  m.castShadow = shadow; m.receiveShadow = false;
  return m;
}

function texFor(map, w, h, tile) {
  if (!map) return null;
  const t = map.clone(); t.needsUpdate = true;
  t.repeat.set(w / tile, h / tile);
  return t;
}

/**
 * A room: floor, ceiling and walls as inward-facing toon planes that receive
 * shadows. Origin is the centre of the floor.
 * room({ w: 6, h: 4, d: 6, wall: { color, map, tile: 2 }, floor: {...}, ceiling: {...} | false, open: ['front'] })
 * Walls: back (-Z), front (+Z), left (-X), right (+X). `tile` = world size of one texture repeat.
 * Returns a Group with .userData.walls = { back, front, left, right, floor, ceiling }.
 */
export function room({ w = 6, h = 4, d = 6, wall = {}, floor = {}, ceiling = {}, open = ['front'] } = {}) {
  const g = new THREE.Group(); g.name = 'room';
  const walls = {};
  const plane = (name, pw, ph, spec, pos, rot) => {
    if (spec === false || open.includes(name)) return;
    const s = { tile: 2, ...spec };
    const mat = s.material ?? toon({ color: s.color ?? '#ffffff', map: texFor(s.map, pw, ph, s.tile) });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), mat);
    m.position.set(...pos); m.rotation.set(...rot); m.receiveShadow = true; m.name = name;
    g.add(m); walls[name] = m;
  };
  plane('floor', w, d, floor, [0, 0, 0], [-Math.PI / 2, 0, 0]);
  plane('ceiling', w, d, ceiling, [0, h, 0], [Math.PI / 2, 0, 0]);
  plane('back', w, h, wall, [0, h / 2, -d / 2], [0, 0, 0]);
  plane('front', w, h, wall, [0, h / 2, d / 2], [0, Math.PI, 0]);
  plane('left', d, h, wall, [-w / 2, h / 2, 0], [0, Math.PI / 2, 0]);
  plane('right', d, h, wall, [w / 2, h / 2, 0], [0, -Math.PI / 2, 0]);
  g.userData.walls = walls;
  return g;
}

/**
 * A barred window: a glowing pane (blooms), a frame and vertical / horizontal bars.
 * Built in the XY plane facing +Z; position / rotate the returned group onto a wall,
 * 0.07 or more in front of the wall plane (the pane sits 0.03 behind the group origin).
 * barredWindow({ w: 1.6, h: 1.0, bars: 5, cross: 1, frame: '#a9b8c9', bar: '#8497ad', glowColor: '#f4f9ff', intensity: 1.0, halo: 0.55, haloSize: 0.9 })
 *   intensity  pane brightness. Keep it at 1.0: a pane this large above the bloom threshold whites out its own bars.
 *   halo       strength of the soft additive glow drawn around the opening, behind the bars (0 = none)
 * The window does not cast shadows itself: pair it with windowLight() for the barred light patch and fx.lightShaft() for the beam.
 * userData: { w, h, bars, cross }.
 */
export function barredWindow({ w = 1.6, h = 1.0, bars = 5, cross = 1, frame = '#a9b8c9', bar = '#8497ad', glowColor = '#f4f9ff', intensity = 1.0, halo = 0.55, haloSize = 0.9, depth = 0.12, barR = 0.028 } = {}) {
  const g = new THREE.Group(); g.name = 'window';
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glow({ color: glowColor, intensity }));
  pane.position.z = -0.03; g.add(pane);
  if (halo > 0) {
    // soft additive glow around the opening, BEHIND the bars so they stay crisp
    const N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N;
    const c2 = cv.getContext('2d');
    const W2 = w + haloSize * 2, H2 = h + haloSize * 2;
    c2.fillStyle = '#000'; c2.fillRect(0, 0, N, N);
    c2.filter = `blur(${Math.round((haloSize / Math.max(W2, H2)) * N * 0.55)}px)`;
    c2.fillStyle = '#fff'; c2.fillRect((haloSize / W2) * N * 0.8, (haloSize / H2) * N * 0.8, N - (haloSize / W2) * N * 1.6, N - (haloSize / H2) * N * 1.6);
    // no glow over the pane itself: the pane stays just under the bloom threshold so the bars read
    c2.filter = 'blur(2px)'; c2.fillStyle = '#000'; c2.fillRect((haloSize / W2) * N, (haloSize / H2) * N, (w / W2) * N, (h / H2) * N);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const hm = new THREE.Mesh(new THREE.PlaneGeometry(W2, H2), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(glowColor).multiplyScalar(halo), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false }));
    hm.position.z = 0.012; hm.renderOrder = 1; hm.userData.noDepth = true; hm.userData.noOcclude = true;
    g.add(hm);
  }
  const fm = toon({ color: frame });
  const t = 0.09;
  for (const [sw, sh, x, y] of [[w + t * 2, t, 0, h / 2 + t / 2], [w + t * 2, t, 0, -h / 2 - t / 2], [t, h, -w / 2 - t / 2, 0], [t, h, w / 2 + t / 2, 0]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, depth), fm); m.position.set(x, y, 0); g.add(m);
  }
  const bm = toon({ color: bar });
  for (let i = 1; i <= bars; i++) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(barR, barR, h, 8), bm); m.position.set(-w / 2 + (w * i) / (bars + 1), 0, 0); g.add(m);
  }
  for (let j = 1; j <= cross; j++) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(barR, barR, w, 8), bm); m.rotation.z = Math.PI / 2; m.position.set(0, -h / 2 + (h * j) / (cross + 1), 0); g.add(m);
  }
  g.userData = { w, h, bars, cross };
  return g;
}

/**
 * The key light of an interior: a spot shining in through a barred window. It
 * projects the window (panes bright, bars and wall dark) as a light patch on
 * the floor / walls and casts character shadows inside that patch. Everything
 * outside the patch is lit by ambient() only.
 * windowLight({ window, dir:[x,y,z], color: '#fff0dc', intensity: 0.5, back: 5, soft: 6, mapSize: 2048 })
 *   window  group from barredWindow(), ALREADY positioned in the set
 *   dir     world direction the light travels (same as the lightShaft)
 *   back    how far behind the window the light sits (larger = more parallel beam)
 */
export function windowLight({ window: win, dir = [0.2, -0.6, 0.77], color = '#fff0dc', intensity = 0.5, back = 5, soft = 6, mapSize = 2048, reach = 14 } = {}) {
  win.updateWorldMatrix(true, false);
  const { w, h, bars = 0, cross = 0 } = win.userData;
  const c = new THREE.Vector3().setFromMatrixPosition(win.matrixWorld);
  const d = new THREE.Vector3(...dir).normalize();
  const S = Math.max(w, h) * 1.3;                       // world size the cookie covers at the window
  const N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N;
  const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, N, N);
  g.filter = `blur(${soft}px)`;
  const px = N / S, x0 = N / 2 - (w / 2) * px, y0 = N / 2 - (h / 2) * px;
  g.fillStyle = '#fff'; g.fillRect(x0, y0, w * px, h * px);
  g.fillStyle = '#000';
  const bw = Math.max(3, 0.07 * px);
  for (let i = 1; i <= bars; i++) g.fillRect(x0 + (w * px * i) / (bars + 1) - bw / 2, y0, bw, h * px);
  for (let j = 1; j <= cross; j++) g.fillRect(x0, y0 + (h * px * j) / (cross + 1) - bw / 2, w * px, bw);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const angle = Math.atan(S / 2 / back);
  const l = new THREE.SpotLight(color, intensity * Math.PI, 0, angle, 0, 0);
  l.position.copy(c).addScaledVector(d, -back);
  l.target.position.copy(c).addScaledVector(d, 4);
  l.map = tex;
  l.castShadow = true; l.shadow.mapSize.set(mapSize, mapSize); l.shadow.normalBias = 0.03; l.shadow.bias = -0.0006; l.shadow.radius = 3;
  l.shadow.camera.near = 0.5; l.shadow.camera.far = back + reach;  // near must stay in front of everything in the cone, or the cookie is not applied there
  const grp = new THREE.Group(); grp.add(l, l.target); grp.userData.light = l; grp.name = 'windowLight';
  return grp;
}

/** Ground disc that receives shadows. ground({ radius: 60, color, map, tile: 4 }) */
export function ground({ radius = 60, color = '#ffffff', map = null, tile = 4, material } = {}) {
  let tex = null;
  if (map) { tex = map.clone(); tex.needsUpdate = true; tex.repeat.set((radius * 2) / tile, (radius * 2) / tile); }
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 64), material ?? toon({ color, map: tex }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.name = 'ground';
  return m;
}

/**
 * Painted sky dome: vertical gradient plus soft cloud blobs. Unlit, ignores fog.
 * sky({ top: '#458de2', bottom: '#bfe0ff', clouds: 36, cloudColor: '#ffffff', seed, radius: 200 })
 * Returns an fx object: clouds drift slowly with t (pass it to set.add).
 */
export function sky({ top = '#458de2', bottom = '#cfe6ff', clouds = 36, cloudColor = '#ffffff', seed = 21, radius = 200, drift = 0.004 } = {}) {
  const W = 2048, H = 1024;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); const r = mulberry32(seed);
  const gr = g.createLinearGradient(0, 0, 0, H * 0.5);
  gr.addColorStop(0, top); gr.addColorStop(1, bottom);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = bottom; g.fillRect(0, H * 0.5, W, H * 0.5);
  // equirect: y = H/2 is the horizon, y = 0 the zenith. Clouds sit 6-40 degrees up.
  for (let i = 0; i < clouds; i++) {
    const x = r() * W, y = H * (0.3 + r() * 0.16), s = 12 + r() * 20;
    const puffs = 5 + ((r() * 4) | 0);
    for (let k = 0; k < puffs; k++) {
      const bx = x + (k - puffs / 2) * s * 0.9 + (r() - 0.5) * s * 0.5, by = y - Math.sin((k / (puffs - 1)) * Math.PI) * s * 0.55 + (r() - 0.5) * s * 0.2, br = s * (0.7 + r() * 0.5);
      for (const ox of [-W, 0, W]) {
        const rg = g.createRadialGradient(bx + ox, by, br * 0.55, bx + ox, by, br);
        rg.addColorStop(0, cloudColor); rg.addColorStop(1, cloudColor + '00');
        g.fillStyle = rg; g.beginPath(); g.arc(bx + ox, by, br, 0, 7); g.fill();
      }
    }
    // flat base
    g.globalCompositeOperation = 'source-over';
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping;
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, toneMapped: false, depthWrite: false }));
  m.renderOrder = -10; m.name = 'sky'; m.userData.noDepth = true;
  return { object: m, update: (t) => { tex.offset.x = t * drift; } };
}

/** Low toon hills ring for the horizon. hills({ count: 9, radius: 45, color, height: 6, seed }) */
export function hills({ count = 9, radius = 45, color = '#3ed449', height = 6, seed = 4, spread = 14 } = {}) {
  const g = new THREE.Group(); g.name = 'hills'; const r = mulberry32(seed);
  const mat = toon({ color });
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + r() * 0.4, d = radius + r() * spread;
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    m.scale.set(10 + r() * 12, height * (0.5 + r()), 10 + r() * 12);
    m.position.set(Math.sin(a) * d, -0.2, Math.cos(a) * d);
    g.add(m);
  }
  return g;
}

/**
 * Instanced grass with shader wind (world clock: sways every frame).
 * grass({ count: 30000, area: [20, 20], center: [0, 0], height: 0.5, tip: '#97c255', base: '#2b5520', seed, keepOut: [{x,z,r}], where: (x,z) => bool })
 * Returns an fx object ({ object, update }).
 */
export function grass({ count = 30000, area = [20, 20], center = [0, 0], height = 0.5, width = 0.08, tip = '#97c255', base = '#2b5520', seed = 42, keepOut = [], where = null, wind = 1 } = {}) {
  const H = height;
  const blade = new THREE.PlaneGeometry(width, H, 1, 4); blade.translate(0, H / 2, 0);
  const p = blade.attributes.position, n = blade.attributes.normal;
  for (let i = 0; i < p.count; i++) { p.setX(i, p.getX(i) * (1 - (p.getY(i) / H) * 0.9)); n.setXYZ(i, 0, 1, 0); }
  const uTime = { value: 0 };
  const mat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: RAMP, side: THREE.DoubleSide });
  const cb = new THREE.Color(base), ct = new THREE.Color(tip);
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.uniforms.uBase = { value: cb }; shader.uniforms.uTip = { value: ct };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime; varying float vBladeH;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float h = position.y / ${H.toFixed(3)};
        vBladeH = h;
        vec3 root = instanceMatrix[3].xyz;
        float sway = sin(uTime * 1.8 + root.x * 0.9 + root.z * 1.3) * 0.16 + sin(uTime * 3.1 + root.x * 2.1) * 0.05;
        transformed.x += sway * h * h * ${wind.toFixed(3)};`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uBase; uniform vec3 uTip; varying float vBladeH;')
      .replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb *= mix(uBase, uTip, smoothstep(0.0, 1.0, vBladeH));');
  };
  const mesh = new THREE.InstancedMesh(blade, mat, count);
  mesh.receiveShadow = true; mesh.frustumCulled = false; mesh.userData.noOutline = true; mesh.name = 'grass';
  const r = mulberry32(seed);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  let placed = 0, guard = 0;
  while (placed < count && guard++ < count * 4) {
    const x = center[0] + (r() - 0.5) * area[0], z = center[1] + (r() - 0.5) * area[1];
    const rot = r() * Math.PI, sc = 0.6 + r() * 0.9, tintv = 0.85 + r() * 0.3;
    if (keepOut.some((k) => (x - k.x) ** 2 + (z - k.z) ** 2 < k.r * k.r)) continue;
    if (where && !where(x, z)) continue;
    pos.set(x, 0, z); q.setFromAxisAngle(up, rot); s.set(1, sc, 1);
    mesh.setMatrixAt(placed, m.compose(pos, q, s)); mesh.setColorAt(placed, col.setScalar(tintv));
    placed++;
  }
  mesh.count = placed;
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return { object: mesh, update: (t) => { uTime.value = t; } };
}
