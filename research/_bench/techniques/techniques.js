// Smoke test for every technique in research/threejs-techniques.md (three r187).
// One scene, every feature a pure function of t.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { solidify, createOutlineMaterial } from '/outline-shader/src/solidify.js';
import { makeGradientMap, createToonMaterial } from '/outline-shader/src/toon.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---- hand-painted texture: seeded brush strokes on a canvas -------------------
function paintedTexture({ base = '#7a8f5a', strokes = ['#8fa868', '#6a7d4c', '#a3b77a'], size = 512, count = 900, seed = 7 }) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const r = mulberry32(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  g.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = r() * size, y = r() * size, a = r() * Math.PI, len = 20 + r() * 60;
    g.strokeStyle = strokes[(r() * strokes.length) | 0]; g.globalAlpha = 0.35 + r() * 0.4; g.lineWidth = 6 + r() * 18;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 20, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

// ---- 2D cartoon character drawn to a canvas, used on a billboard ---------------
function characterTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 768;
  const g = c.getContext('2d'); g.lineJoin = g.lineCap = 'round'; g.lineWidth = 22; g.strokeStyle = '#1a1020';
  g.fillStyle = '#ff9f6b'; g.beginPath(); g.ellipse(256, 470, 150, 230, 0, 0, Math.PI * 2); g.fill(); g.stroke();   // body
  g.fillStyle = '#ffd9b8'; g.beginPath(); g.arc(256, 190, 140, 0, Math.PI * 2); g.fill(); g.stroke();               // head
  g.fillStyle = '#1a1020'; g.beginPath(); g.arc(205, 175, 18, 0, 7); g.arc(307, 175, 18, 0, 7); g.fill();           // eyes
  g.lineWidth = 14; g.beginPath(); g.arc(256, 215, 46, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();                 // smile
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---- screen-space god rays (occlusion prepass + radial blur toward the sun) -----
class GodRaysPass extends Pass {
  constructor(scene, camera, sunPosition, width, height, o = {}) {
    super();
    this.scene = scene; this.camera = camera; this.sunPosition = sunPosition;
    this.occlusion = new THREE.WebGLRenderTarget(width >> 1, height >> 1);
    this.black = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false });
    this.sunScene = new THREE.Scene();
    this.sunMesh = new THREE.Mesh(new THREE.SphereGeometry(o.sunRadius ?? 2.2, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
    this.sunScene.add(this.sunMesh);
    this.material = new THREE.ShaderMaterial({
      defines: { SAMPLES: o.samples ?? 64 },
      uniforms: {
        tDiffuse: { value: null }, tOcclusion: { value: this.occlusion.texture }, uSunUv: { value: new THREE.Vector2(0.5, 0.5) },
        uDensity: { value: o.density ?? 0.95 }, uDecay: { value: o.decay ?? 0.965 }, uWeight: { value: o.weight ?? 0.045 },
        uExposure: { value: o.exposure ?? 1.0 }, uColor: { value: new THREE.Color(o.color ?? 0xfff0c4) }, uVisible: { value: 1 },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform sampler2D tOcclusion; uniform vec2 uSunUv;
        uniform float uDensity, uDecay, uWeight, uExposure, uVisible; uniform vec3 uColor; varying vec2 vUv;
        void main() {
          vec2 delta = (vUv - uSunUv) * (uDensity / float(SAMPLES));
          // interleaved gradient noise: hides banding, fixed per pixel so it is deterministic
          float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
          vec2 uv = vUv - delta * jitter; float illum = 1.0; float acc = 0.0;
          for (int i = 0; i < SAMPLES; i++) { uv -= delta; acc += texture2D(tOcclusion, uv).r * illum * uWeight; illum *= uDecay; }
          vec4 base = texture2D(tDiffuse, vUv);
          gl_FragColor = vec4(base.rgb + uColor * acc * uExposure * uVisible, base.a);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.fsQuad = new FullScreenQuad(this.material);
    this._v = new THREE.Vector3(); this._hidden = []; this._clear = new THREE.Color();
  }
  render(renderer, writeBuffer, readBuffer) {
    const { scene, camera } = this;
    this._hidden.length = 0;
    scene.traverse((o) => { if (o.visible && (o.isPoints || o.isSprite || o.isLine || o.isLine2 || o.userData.noOcclude)) { o.visible = false; this._hidden.push(o); } });
    const prev = { override: scene.overrideMaterial, bg: scene.background, fog: scene.fog, target: renderer.getRenderTarget(), auto: renderer.autoClear, shadow: renderer.shadowMap.autoUpdate, alpha: renderer.getClearAlpha() };
    renderer.getClearColor(this._clear);
    scene.overrideMaterial = this.black; scene.background = null; scene.fog = null; renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(this.occlusion); renderer.setClearColor(0x000000, 1); renderer.clear();
    renderer.render(scene, camera);                 // occluders, black
    renderer.autoClear = false;
    this.sunMesh.position.copy(this.sunPosition);
    renderer.render(this.sunScene, camera);         // sun disc, depth-tested against the occluders
    renderer.autoClear = prev.auto;
    scene.overrideMaterial = prev.override; scene.background = prev.bg; scene.fog = prev.fog; renderer.shadowMap.autoUpdate = prev.shadow;
    renderer.setClearColor(this._clear, prev.alpha);
    for (const o of this._hidden) o.visible = true;

    this._v.copy(this.sunPosition).project(camera);
    const u = this.material.uniforms;
    u.uSunUv.value.set(this._v.x * 0.5 + 0.5, this._v.y * 0.5 + 0.5);
    u.uVisible.value = this._v.z < 1 ? 1 : 0;       // sun behind the camera: no rays
    u.tDiffuse.value = readBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this.fsQuad.render(renderer);
    renderer.setRenderTarget(prev.target);
  }
}

export function createTechniques({ canvas, width = 1080, height = 1920, fps = 30, motionBlur = false, dof = true }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fd6ff);
  scene.fog = new THREE.FogExp2(0x9fd6ff, 0.028);                         // FOG
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.3, 120);

  const sunPos = new THREE.Vector3(-9, 22, -26);
  scene.add(new THREE.HemisphereLight(0xdff2ff, 0x5d6b3c, 1.0));
  const sun = new THREE.DirectionalLight(0xfff0d0, 2.6);
  sun.position.copy(sunPos).normalize().multiplyScalar(30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 70 }); sun.shadow.normalBias = 0.08;
  scene.add(sun);

  const ramp = makeGradientMap(3);
  const rnd = mulberry32(42);

  // HAND-PAINTED texture on a toon material
  const groundTex = paintedTexture({}); groundTex.repeat.set(10, 10);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshToonMaterial({ map: groundTex, gradientMap: ramp }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // toon props + inverted hull outlines (world-space width)
  const outlineMat = createOutlineMaterial({ mode: 'world', thickness: 0.05, color: 0x1a1020, useOutlineNormal: true });
  const rockTex = paintedTexture({ base: '#8b8fa3', strokes: ['#a3a7ba', '#73778b', '#b9bccb'], seed: 3 });
  const trees = [];
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1.08 + 0.84 * (i / 6)), r = 7 + rnd() * 4;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 2.4, 10), createToonMaterial({ color: 0x8a5a3c, gradientMap: ramp }));
    trunk.position.set(Math.cos(a) * r, 1.2, Math.sin(a) * r - 4); trunk.castShadow = true;
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 + rnd() * 0.6, 1), createToonMaterial({ color: [0x3fa56b, 0x58b368, 0x2f8f5b][i % 3], gradientMap: ramp }));
    crown.position.y = 2.4; crown.castShadow = true; trunk.add(crown);
    solidify(trunk, { material: outlineMat, smoothNormals: true }); solidify(crown, { material: outlineMat, smoothNormals: true });
    scene.add(trunk); trees.push(trunk);
  }
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), new THREE.MeshToonMaterial({ map: rockTex, gradientMap: ramp }));
  rock.position.set(2.6, 0.7, 1.5); rock.castShadow = true; rock.receiveShadow = true; solidify(rock, { material: outlineMat, smoothNormals: true }); scene.add(rock);

  // SELECTIVE BLOOM: only HDR-bright pixels (emissiveIntensity > 1) pass threshold 1.0
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 16), new THREE.MeshToonMaterial({ color: 0xffe08a, emissive: 0xffc24a, emissiveIntensity: 6, gradientMap: ramp }));
  scene.add(orb);

  // INSTANCED GRASS with shader wind
  const uTime = { value: 0 };
  const bladeH = 0.55;
  const blade = new THREE.PlaneGeometry(0.09, bladeH, 1, 4); blade.translate(0, bladeH / 2, 0);
  { const p = blade.attributes.position, n = blade.attributes.normal;
    for (let i = 0; i < p.count; i++) { p.setX(i, p.getX(i) * (1 - (p.getY(i) / bladeH) * 0.9)); n.setXYZ(i, 0, 1, 0); } }   // taper; up-facing normals = flat toon shading
  const grassMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: ramp, side: THREE.DoubleSide });
  grassMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float h = position.y / ${bladeH.toFixed(3)};
        vec3 root = instanceMatrix[3].xyz;
        float sway = sin(uTime * 1.8 + root.x * 0.9 + root.z * 1.3) * 0.16 + sin(uTime * 3.1 + root.x * 2.1) * 0.05;
        transformed.x += sway * h * h;`);
  };
  const GRASS = 30000;
  const grass = new THREE.InstancedMesh(blade, grassMat, GRASS); grass.receiveShadow = true; grass.userData.noOutline = true;
  { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
    for (let i = 0; i < GRASS; i++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 16;
      p.set(Math.cos(a) * r, 0, Math.sin(a) * r - 2); q.setFromAxisAngle(up, rnd() * Math.PI); s.set(1, 0.6 + rnd() * 0.9, 1);
      grass.setMatrixAt(i, m.compose(p, q, s)); grass.setColorAt(i, col.setHSL(0.27 + rnd() * 0.06, 0.55, 0.38 + rnd() * 0.16));
    } }
  scene.add(grass);

  // GPU PARTICLES: stateless, position = f(seed, time)
  const PARTICLES = 1500;
  const pg = new THREE.BufferGeometry(); const pp = new Float32Array(PARTICLES * 3), ps = new Float32Array(PARTICLES * 4);
  for (let i = 0; i < PARTICLES; i++) { pp.set([(rnd() - 0.5) * 22, rnd() * 0.5, (rnd() - 0.5) * 22 - 2], i * 3); ps.set([rnd(), rnd(), rnd(), rnd()], i * 4); }
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('aSeed', new THREE.BufferAttribute(ps, 4));
  pg.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 3, -2), 30);
  const particles = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms: { uTime, uSize: { value: 0.07 }, uScale: { value: height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) }, uColor: { value: new THREE.Color(0xfff2a8) } },
    vertexShader: `attribute vec4 aSeed; uniform float uTime, uSize, uScale; varying float vAlpha;
      void main() {
        float life = fract(aSeed.w + uTime * (0.05 + 0.08 * aSeed.x));
        vec3 p = position + vec3(sin(uTime * 0.7 + aSeed.y * 6.2832) * 0.5, life * 6.0, cos(uTime * 0.5 + aSeed.z * 6.2832) * 0.5);
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (0.5 + aSeed.x) * uScale / -mv.z;
        vAlpha = sin(life * 3.14159);
      }`,
    fragmentShader: `uniform vec3 uColor; varying float vAlpha;
      void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.1, d) * vAlpha; gl_FragColor = vec4(uColor * 2.5, a); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(particles);

  // 2D CHARACTER on a Y-locked billboard, alpha-tested, with a matching shadow
  const charTex = characterTexture();
  const billboard = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), new THREE.MeshBasicMaterial({ map: charTex, alphaTest: 0.5, side: THREE.DoubleSide }));
  billboard.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: charTex, alphaTest: 0.5 });
  billboard.castShadow = true; billboard.position.set(-2.6, 1.5, 0.5); scene.add(billboard);

  // STICK FIGURE: unit capsules stretched between joints (no per-frame geometry), sphere head, hull outline
  const limbGeo = new THREE.CapsuleGeometry(0.11, 1, 6, 12); const limbMat = createToonMaterial({ color: 0xf7f7ff, gradientMap: ramp });
  const stick = new THREE.Group(); stick.position.set(0.3, 0, 2.2); scene.add(stick);
  const makeLimb = () => { const m = new THREE.Mesh(limbGeo, limbMat); m.castShadow = true; solidify(m, { material: outlineMat, smoothNormals: true }); stick.add(m); return m; };
  const limbs = Array.from({ length: 9 }, makeLimb);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 16), limbMat); head.castShadow = true; solidify(head, { material: outlineMat, smoothNormals: true }); stick.add(head);
  const UP = new THREE.Vector3(0, 1, 0), _d = new THREE.Vector3();
  const setLimb = (m, a, b) => { _d.subVectors(b, a); const len = _d.length(); m.position.addVectors(a, b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(UP, _d.normalize()); m.scale.set(1, len, 1); };
  const J = (x, y, z = 0) => new THREE.Vector3(x, y, z);
  function poseStick(t) {
    const s = Math.sin(t * 6), c = Math.cos(t * 6), bob = Math.abs(s) * 0.06;
    const hip = J(0, 1.0 + bob), neck = J(0, 1.9 + bob), headP = J(0, 2.32 + bob);
    const kneeL = J(-0.14, 0.52 + bob * 0.5, 0.28 * s), footL = J(-0.16, 0.06, 0.5 * s - 0.1 * Math.max(0, c));
    const kneeR = J(0.14, 0.52 + bob * 0.5, -0.28 * s), footR = J(0.16, 0.06, -0.5 * s - 0.1 * Math.max(0, -c));
    const elbL = J(-0.38, 1.5 + bob, -0.22 * s), handL = J(-0.5, 1.12 + bob, -0.45 * s + 0.12);
    const elbR = J(0.38, 1.5 + bob, 0.22 * s), handR = J(0.5, 1.12 + bob, 0.45 * s + 0.12);
    [[hip, neck], [hip, kneeL], [kneeL, footL], [hip, kneeR], [kneeR, footR], [neck, elbL], [elbL, handL], [neck, elbR], [elbR, handR]].forEach(([a, b], i) => setLimb(limbs[i], a, b));
    head.position.copy(headP);
  }

  // FAT LINE alternative for limbs / speed lines (width in world units)
  const lineGeo = new LineGeometry();
  const line = new Line2(lineGeo, new LineMaterial({ color: 0x1a1020, linewidth: 0.07, worldUnits: true }));
  line.material.resolution.set(width, height); scene.add(line);

  // post chain: render -> god rays -> DOF -> bloom -> output
  const target = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target); composer.setPixelRatio(1); composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const godrays = new GodRaysPass(scene, camera, sunPos, width, height); composer.addPass(godrays);
  const bokeh = new BokehPass(scene, camera, { focus: 10, aperture: 0.0012, maxblur: 0.008 });
  if (dof) composer.addPass(bokeh);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.5, 1.0));
  const output = new OutputPass(); composer.addPass(output);

  // MOTION BLUR by sub-frame accumulation (deterministic; costs `samples` renders per frame)
  const accum = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType });
  const addQuad = new FullScreenQuad(new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, uWeight: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uWeight; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tDiffuse, vUv).rgb * uWeight, uWeight); }`,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, depthTest: false, depthWrite: false, toneMapped: false,
  }));
  const outQuad = new FullScreenQuad(output.material);

  function update(t) {
    uTime.value = t;
    const ca = 0.25 + Math.sin(t * 0.4) * 0.35;
    camera.position.set(Math.sin(ca) * 11, 2.6 + Math.sin(t * 0.5) * 0.4, Math.cos(ca) * 11 + 1.5); camera.lookAt(0, 1.7, 0);
    camera.updateMatrixWorld();
    orb.position.set(Math.sin(t * 5.0) * 1.8 - 0.4, 3.3 + Math.sin(t * 7.0) * 0.5, 1.2 + Math.cos(t * 5.0) * 1.2);
    billboard.rotation.y = Math.atan2(camera.position.x - billboard.position.x, camera.position.z - billboard.position.z); // Y-locked billboard
    billboard.position.y = 1.5 + Math.abs(Math.sin(t * 4)) * 0.25;
    poseStick(t);
    stick.position.x = 0.3 + Math.sin(t * 0.8) * 0.4;
    const pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push(-3.6 + u * 2.2, 3.6 + Math.sin(u * 9 + t * 5) * 0.18, 0.5); }
    lineGeo.setPositions(pts);
    bokeh.uniforms.focus.value = camera.position.distanceTo(stick.position);  // keep the hero in focus
  }

  function renderAt(t, { samples = 8, shutter = 0.5 } = {}) {
    if (!motionBlur) { update(t); output.enabled = true; composer.renderToScreen = true; composer.render(1 / fps); return; }
    output.enabled = false; composer.renderToScreen = false;      // keep the chain linear/HDR; tone-map once at the end
    renderer.setRenderTarget(accum); renderer.setClearColor(0x000000, 0); renderer.clear();
    for (let k = 0; k < samples; k++) {
      update(t + ((k + 0.5) / samples - 0.5) * shutter / fps);  // spread samples across the open shutter
      composer.render(1 / fps);
      addQuad.material.uniforms.tDiffuse.value = composer.readBuffer.texture;
      addQuad.material.uniforms.uWeight.value = 1 / samples;
      const ac = renderer.autoClear; renderer.autoClear = false;
      renderer.setRenderTarget(accum); addQuad.render(renderer); renderer.autoClear = ac;
    }
    output.uniforms.tDiffuse.value = accum.texture;
    output.render(renderer, null, accum);                        // OutputPass: tone mapping + sRGB to the canvas
  }

  const ready = renderer.compileAsync(scene, camera);
  return { ready, renderAt, renderer, scene, camera, composer };
}
