// Effects. Everything is stateless: a pure function of video time t, so frames
// can be rendered in any order. Each factory returns { object, update(t, frame) }
// -- hand it to set.add().
import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { mulberry32 } from './rng.js';

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false };
const mark = (o) => { o.userData.noDepth = true; o.userData.noOcclude = true; o.userData.noOutline = true; o.frustumCulled = false; return o; };

// ------------------------------------------------------------------ light shafts

/**
 * Volumetric shaft from a barred window: one additive prism per gap between
 * bars, so the shaft is striped by the bars like the references.
 * lightShaft({ window, dir:[x,y,z], length: 5, color: '#fff2d6', opacity: 0.22, spread: 1.25, falloff: 1.4 })
 *   window  the group from world.barredWindow(), ALREADY positioned / rotated in its set
 *           (or pass rect: { center:[x,y,z], right:[x,y,z], up:[x,y,z], w, h, bars })
 *   dir     world direction the light travels (need not be normalised)
 * Pulse / flicker: the returned object has .opacity (multiplier you may set in an update hook).
 */
export function lightShaft({ window: win, rect, dir = [0.3, -0.8, 1], length = 5, color = '#fff2d6', opacity = 0.22, spread = 1.25, falloff = 1.4, intensity = 1.0 } = {}) {
  let center, right, up, w, h, bars;
  if (win) {
    win.updateWorldMatrix(true, false);
    center = new THREE.Vector3().setFromMatrixPosition(win.matrixWorld);
    const q = win.getWorldQuaternion(new THREE.Quaternion());
    right = new THREE.Vector3(1, 0, 0).applyQuaternion(q); up = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    ({ w, h, bars } = win.userData);
  } else {
    center = new THREE.Vector3(...rect.center); right = new THREE.Vector3(...rect.right).normalize(); up = new THREE.Vector3(...rect.up).normalize();
    ({ w, h, bars = 0 } = rect);
  }
  const d = new THREE.Vector3(...dir).normalize().multiplyScalar(length);
  const pos = [], uv = [], idx = [];
  const gaps = bars + 1, gw = w / gaps, pad = gw * 0.16;
  const P = (x, y, far) => {
    const k = far ? spread : 1;
    return new THREE.Vector3().copy(center).addScaledVector(right, x * k).addScaledVector(up, y * k).addScaledVector(d, far ? 1 : 0);
  };
  for (let i = 0; i < gaps; i++) {
    const x0 = -w / 2 + i * gw + pad, x1 = -w / 2 + (i + 1) * gw - pad, y0 = -h / 2, y1 = h / 2;
    const ring = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (let s = 0; s < 4; s++) {
      const a = ring[s], b = ring[(s + 1) % 4];
      const base = pos.length / 3;
      for (const [pt, u, far] of [[a, 0, 0], [b, 1, 0], [b, 1, 1], [a, 0, 1]]) {
        const v = P(pt[0], pt[1], far); pos.push(v.x, v.y, v.z); uv.push(u, far);
      }
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  // a view ray crosses 2 faces of one prism head-on and up to 2 * gaps faces along the row: normalise so `opacity` is the typical total
  const layer = 1 / (2 + 0.6 * (gaps - 1));
  const uniforms = { uColor: { value: new THREE.Color(color).multiplyScalar(intensity) }, uOpacity: { value: opacity * layer }, uFalloff: { value: falloff } };
  const mat = new THREE.ShaderMaterial({
    uniforms, side: THREE.DoubleSide, ...additive,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity, uFalloff; varying vec2 vUv;
      void main(){ float v = clamp(vUv.y, 0.0, 1.0);
        float a = pow(1.0 - v, uFalloff) * smoothstep(0.0, 0.07, v) * (0.55 + 0.45 * sin(clamp(vUv.x, 0.0, 1.0) * 3.14159));
        gl_FragColor = vec4(uColor * a * uOpacity, 1.0); }`,
  });
  const mesh = mark(new THREE.Mesh(geo, mat)); mesh.name = 'lightShaft'; mesh.renderOrder = 3;
  const fx = { object: mesh, opacity: 1, update: () => { uniforms.uOpacity.value = opacity * layer * fx.opacity; } };
  return fx;
}

/**
 * Additive cone under a lamp. lightCone({ at:[x,y,z], dir:[0,-1,0], length: 3, radius: 1.4, color: '#9e8a67', opacity: 0.4 })
 */
export function lightCone({ at = [0, 3, 0], dir = [0, -1, 0], length = 3, radius = 1.4, color = '#9e8a67', opacity = 0.4, intensity = 1.5 } = {}) {
  const geo = new THREE.ConeGeometry(radius, length, 40, 1, true); geo.translate(0, -length / 2, 0); // apex at origin, opening down -Y
  const uniforms = { uColor: { value: new THREE.Color(color).multiplyScalar(intensity) }, uOpacity: { value: opacity }, uLen: { value: length } };
  const mat = new THREE.ShaderMaterial({
    uniforms, side: THREE.DoubleSide, ...additive,
    vertexShader: `varying float vH; varying vec3 vN; varying vec3 vV;
      void main(){ vH = -position.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity, uLen; varying float vH; varying vec3 vN; varying vec3 vV;
      void main(){ float along = 1.0 - vH / uLen; float rim = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
        gl_FragColor = vec4(uColor * uOpacity * 0.5 * rim * (0.25 + 0.75 * along), 1.0); }`,
  });
  const mesh = mark(new THREE.Mesh(geo, mat)); mesh.name = 'lightCone'; mesh.renderOrder = 3;
  mesh.position.set(...at);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(...dir).normalize());
  const fx = { object: mesh, opacity: 1, update: () => { uniforms.uOpacity.value = opacity * fx.opacity; } };
  return fx;
}

// ------------------------------------------------------------------ particles

const pointVert = (body, extra = '') => `
  attribute vec4 aSeed; uniform float uTime, uSize, uViewH; varying float vAlpha; ${extra}
  void main() {
    vec3 p = position; float size = uSize; float alpha = 1.0;
    ${body}
    vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
    gl_PointSize = max(0.0, size * projectionMatrix[1][1] * uViewH * 0.5 / max(0.05, -mv.z));
    vAlpha = alpha;
  }`;
const pointFrag = `uniform vec3 uColor; varying float vAlpha;
  void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.12, d) * vAlpha; gl_FragColor = vec4(uColor * a, 1.0); }`;

function points(positions, seeds, uniforms, vert, sphere) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  g.boundingSphere = sphere;
  return mark(new THREE.Points(g, new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: pointFrag, ...additive })));
}

/**
 * Drifting dust motes inside a box (always on in interiors; 20-60 is right).
 * dust({ center:[x,y,z], size:[sx,sy,sz], count: 40, color: '#fff4dc', mote: 0.035, intensity: 1.3, speed: 1, seed, viewHeight: 1920 })
 */
export function dust({ center = [0, 1.5, 0], size = [3, 3, 3], count = 40, color = '#fff4dc', mote = 0.035, intensity = 1.3, speed = 1, seed = 17, viewHeight = 1920 } = {}) {
  const r = mulberry32(seed);
  const pos = new Float32Array(count * 3), sd = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos.set([center[0] + (r() - 0.5) * size[0], center[1] + (r() - 0.5) * size[1], center[2] + (r() - 0.5) * size[2]], i * 3);
    sd.set([r(), r(), r(), r()], i * 4);
  }
  const uniforms = { uTime: { value: 0 }, uSize: { value: mote }, uViewH: { value: viewHeight }, uColor: { value: new THREE.Color(color).multiplyScalar(intensity) }, uSpeed: { value: speed } };
  const obj = points(pos, sd, uniforms, pointVert(`
    float tt = uTime * uSpeed;
    p += vec3(sin(tt * 0.31 + aSeed.x * 6.2832) * 0.22, sin(tt * 0.23 + aSeed.y * 6.2832) * 0.16 + sin(tt * 0.9 + aSeed.w * 40.0) * 0.02, cos(tt * 0.27 + aSeed.z * 6.2832) * 0.22);
    size *= 0.5 + aSeed.w;
    alpha = 0.45 + 0.55 * sin(tt * (0.5 + aSeed.x) + aSeed.y * 6.2832);`, 'uniform float uSpeed;'),
  new THREE.Sphere(new THREE.Vector3(...center), Math.hypot(...size)));
  obj.name = 'dust';
  return { object: obj, update: (t) => { uniforms.uTime.value = t; } };
}

/**
 * One-shot ballistic burst (impact chips, sparks, confetti pop). Invisible before t0 and after t0 + life.
 * burst({ at:[x,y,z], t0, count: 40, speed: 3, gravity: 6, life: 0.9, color: '#ffd27a', mote: 0.06, intensity: 2.5, dir:[0,1,0], cone: 1, seed })
 *   cone 0 = all along dir, 1 = full sphere
 */
export function burst({ at = [0, 1, 0], t0 = 0, count = 40, speed = 3, gravity = 6, life = 0.9, color = '#ffd27a', mote = 0.06, intensity = 2.5, dir = [0, 1, 0], cone = 1, seed = 29, viewHeight = 1920 } = {}) {
  const r = mulberry32(seed);
  const pos = new Float32Array(count * 3), sd = new Float32Array(count * 4);
  const D = new THREE.Vector3(...dir).normalize(), v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    // random direction, pulled toward `dir` as cone -> 0
    v.set(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize().multiplyScalar(cone).add(D).normalize().multiplyScalar(speed * (0.35 + 0.65 * r()));
    pos.set([v.x, v.y, v.z], i * 3);          // `position` carries the velocity
    sd.set([r(), r(), r(), r()], i * 4);
  }
  const uniforms = { uTime: { value: 0 }, uSize: { value: mote }, uViewH: { value: viewHeight }, uColor: { value: new THREE.Color(color).multiplyScalar(intensity) },
    uT0: { value: t0 }, uLife: { value: life }, uG: { value: gravity }, uAt: { value: new THREE.Vector3(...at) } };
  const obj = points(pos, sd, uniforms, pointVert(`
    float age = uTime - uT0; float lifeI = uLife * (0.6 + 0.4 * aSeed.x); float u = age / lifeI;
    p = uAt + position * age * (1.0 - 0.25 * u) + vec3(0.0, -0.5 * uG * age * age, 0.0);
    size *= (0.5 + aSeed.w) * (age < 0.0 || u > 1.0 ? 0.0 : 1.0);
    alpha = clamp(1.0 - u * u, 0.0, 1.0);`, 'uniform float uT0, uLife, uG; uniform vec3 uAt;'),
  new THREE.Sphere(new THREE.Vector3(...at), speed * life * 2 + gravity * life * life));
  obj.name = 'burst';
  return { object: obj, update: (t) => { uniforms.uTime.value = t; } };
}

// ------------------------------------------------------------------ decals

/**
 * Crack decal that grows radially over `frames` frames (stepped, like the references).
 * cracks({ at:[x,y,z], rot:[rx,ry,rz], size: 1.6, t0, frames: 8, fps: 30, color: '#1c0f14', branches: 9, seed, glow: 0 })
 *   glow > 0 makes the lines emissive (red veins with bloom: color '#a3102e', glow 3)
 */
export function cracks({ at = [0, 1, 0], rot = [0, 0, 0], size = 1.6, t0 = 0, frames = 8, fps = 30, color = '#1c0f14', branches = 9, seed = 31, glow = 0, width = 7 } = {}) {
  const S = 512; const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); const r = mulberry32(seed);
  g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round';
  const walk = (x, y, a, len, w, depth) => {
    g.lineWidth = w; g.beginPath(); g.moveTo(x, y);
    const steps = 3 + ((r() * 4) | 0);
    for (let i = 0; i < steps; i++) {
      a += (r() - 0.5) * 1.1; x += Math.cos(a) * (len / steps); y += Math.sin(a) * (len / steps); g.lineTo(x, y);
      if (depth < 2 && r() < 0.35) { g.stroke(); walk(x, y, a + (r() < 0.5 ? 0.8 : -0.8), len * 0.5, w * 0.6, depth + 1); g.lineWidth = w; g.beginPath(); g.moveTo(x, y); }
    }
    g.stroke();
  };
  for (let i = 0; i < branches; i++) walk(S / 2, S / 2, (i / branches) * 6.2832 + r() * 0.5, S * (0.28 + r() * 0.18), width, 0);
  const tex = new THREE.CanvasTexture(c);
  const uniforms = { map: { value: tex }, uGrow: { value: 0 }, uColor: { value: new THREE.Color(color).multiplyScalar(glow > 0 ? glow : 1) } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D map; uniform float uGrow; uniform vec3 uColor; varying vec2 vUv;
      void main(){ float a = texture2D(map, vUv).r; float rr = length(vUv - 0.5) * 2.0; if (rr > uGrow || a < 0.02) discard; gl_FragColor = vec4(uColor, a); }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  mesh.position.set(...at); mesh.rotation.set(...rot); mesh.name = 'cracks'; mesh.userData.noOutline = true; mesh.userData.noDepth = true; mesh.renderOrder = 2;
  return { object: mesh, update: (t) => { const f = Math.floor((t - t0) * fps + 1e-4); uniforms.uGrow.value = f < 0 ? 0 : Math.min(1, (f + 1) / frames); } };
}

/**
 * Thin expanding ring (impact accent), stepped per frame.
 * ring({ at, rot:[-Math.PI/2,0,0], t0, frames: 4, fps: 30, r0: 0.2, r1: 1.6, color: '#ffffff', width: 0.06, intensity: 2 })
 */
export function ring({ at = [0, 0.02, 0], rot = [-Math.PI / 2, 0, 0], t0 = 0, frames = 4, fps = 30, r0 = 0.2, r1 = 1.6, color = '#ffffff', width = 0.06, intensity = 2 } = {}) {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide, ...additive });
  const mesh = mark(new THREE.Mesh(new THREE.RingGeometry(1 - width, 1, 64), mat));
  mesh.position.set(...at); mesh.rotation.set(...rot); mesh.name = 'ring'; mesh.visible = false;
  return { object: mesh, update: (t) => {
    const f = Math.floor((t - t0) * fps + 1e-4);
    mesh.visible = f >= 0 && f < frames;
    if (mesh.visible) { const u = (f + 1) / frames; mesh.scale.setScalar(r0 + (r1 - r0) * u); mat.opacity = 1 - u * 0.7; mat.color.set(color).multiplyScalar(intensity * (1 - u * 0.6)); }
  } };
}

/**
 * Full-frame flash cue for video.fx (handled by the stage: an even lift after bloom, plus a bloom spike).
 * flash({ t, frames: 4, color: '#ffffff', strength: 0.9, bloom: 1.6 })
 *   strength  additive white on frame 0, decaying to 0 over `frames`
 *   bloom     extra bloom strength on the first 2 frames (the measured 2-frame spike)
 */
export const flash = (o) => ({ type: 'flash', frames: 4, color: '#ffffff', strength: 0.9, bloom: 1.6, ...o });

/** Evaluate all flash cues at frame f -> { add: Color(linear), bloom: number } */
export function flashAt(cues, frame, fps, out = { add: new THREE.Color(0, 0, 0), bloom: 0 }) {
  out.add.setRGB(0, 0, 0); out.bloom = 0;
  const c = new THREE.Color();
  for (const q of cues) {
    if (q.type !== 'flash') continue;
    const f = frame - Math.round(q.t * fps);
    if (f < 0 || f >= q.frames) continue;
    const k = Math.pow(1 - f / q.frames, 1.6);
    out.add.add(c.set(q.color).multiplyScalar(q.strength * k));
    if (f < 2) out.bloom += q.bloom * (f === 0 ? 1 : 0.55);
  }
  return out;
}

// ------------------------------------------------------------------ screen-space god rays

/**
 * Screen-space sun shafts (occlusion pre-pass + radial blur). Used by the stage
 * when a set declares `godrays: { sun:[x,y,z], color, exposure, radius }`.
 * Ported from research/_bench/techniques/techniques.js (verified on r187).
 */
export class GodRaysPass extends Pass {
  constructor(width, height, o = {}) {
    super();
    this.occlusion = new THREE.WebGLRenderTarget(width >> 1, height >> 1);
    this.black = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false });
    this.sunScene = new THREE.Scene();
    this.sunMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
    this.sunScene.add(this.sunMesh);
    this.material = new THREE.ShaderMaterial({
      defines: { SAMPLES: o.samples ?? 64 },
      uniforms: {
        tDiffuse: { value: null }, tOcclusion: { value: this.occlusion.texture }, uSunUv: { value: new THREE.Vector2(0.5, 0.5) },
        uDensity: { value: 0.95 }, uDecay: { value: 0.965 }, uWeight: { value: 0.045 },
        uExposure: { value: 1.0 }, uColor: { value: new THREE.Color(0xfff0c4) }, uVisible: { value: 1 },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform sampler2D tOcclusion; uniform vec2 uSunUv;
        uniform float uDensity, uDecay, uWeight, uExposure, uVisible; uniform vec3 uColor; varying vec2 vUv;
        void main() {
          vec2 delta = (vUv - uSunUv) * (uDensity / float(SAMPLES));
          float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          vec2 uv = vUv - delta * jitter; float illum = 1.0; float acc = 0.0;
          for (int i = 0; i < SAMPLES; i++) { uv -= delta; acc += texture2D(tOcclusion, uv).r * illum * uWeight; illum *= uDecay; }
          vec4 base = texture2D(tDiffuse, vUv);
          gl_FragColor = vec4(base.rgb + uColor * acc * uExposure * uVisible, base.a);
        }`,
      depthTest: false, depthWrite: false, toneMapped: false,
    });
    this.fsQuad = new FullScreenQuad(this.material);
    this._v = new THREE.Vector3(); this._hidden = []; this._clear = new THREE.Color(); this._sun = new THREE.Vector3();
  }

  /** cfg = set.godrays */
  renderRays(renderer, scene, camera, cfg, writeBuffer, readBuffer) {
    const u = this.material.uniforms;
    this._sun.set(...cfg.sun);
    u.uColor.value.set(cfg.color ?? '#fff0c4'); u.uExposure.value = cfg.exposure ?? 0.8;
    u.uDecay.value = cfg.decay ?? 0.965; u.uWeight.value = cfg.weight ?? 0.045; u.uDensity.value = cfg.density ?? 0.95;
    this.sunMesh.scale.setScalar(cfg.radius ?? 6);
    this._hidden.length = 0;
    scene.traverse((o) => { if (o.visible && (o.isPoints || o.isSprite || o.isLine || o.userData.noOcclude)) { o.visible = false; this._hidden.push(o); } });
    const prev = { override: scene.overrideMaterial, bg: scene.background, fog: scene.fog, auto: renderer.autoClear, shadow: renderer.shadowMap.autoUpdate, alpha: renderer.getClearAlpha() };
    renderer.getClearColor(this._clear);
    scene.overrideMaterial = this.black; scene.background = null; scene.fog = null; renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(this.occlusion); renderer.setClearColor(0x000000, 1); renderer.clear();
    renderer.render(scene, camera);
    renderer.autoClear = false;
    this.sunMesh.position.copy(this._sun);
    renderer.render(this.sunScene, camera);
    renderer.autoClear = prev.auto;
    scene.overrideMaterial = prev.override; scene.background = prev.bg; scene.fog = prev.fog; renderer.shadowMap.autoUpdate = prev.shadow;
    renderer.setClearColor(this._clear, prev.alpha);
    for (const o of this._hidden) o.visible = true;
    this._v.copy(this._sun).project(camera);
    u.uSunUv.value.set(this._v.x * 0.5 + 0.5, this._v.y * 0.5 + 0.5);
    u.uVisible.value = this._v.z < 1 ? 1 : 0;
    u.tDiffuse.value = readBuffer.texture;
    renderer.setRenderTarget(writeBuffer);
    this.fsQuad.render(renderer);
  }
}
