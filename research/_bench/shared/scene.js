// Shared benchmark scene: identical in every render stack.
// 1080x1920, toon materials, inverted-hull outlines, one shadow-casting
// directional light, UnrealBloom, moving camera. Everything is a pure
// function of `t` (seconds) -- no clock, no rAF, no Math.random().
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 5;
export const MESH_COUNT = 50;

// --- deterministic helpers -------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGradientMap(steps) {
  const data = new Uint8Array(steps.length);
  steps.forEach((v, i) => (data[i] = Math.round(v * 255)));
  const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

// Inverted hull: back faces pushed out along the normal, constant-ish width.
function makeOutlineMaterial(thickness, color = 0x15101c) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { uThickness: { value: thickness }, uColor: { value: new THREE.Color(color) } },
    vertexShader: /* glsl */ `
      uniform float uThickness;
      void main() {
        vec3 p = position + normalize(normal) * uThickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      void main() { gl_FragColor = vec4(uColor, 1.0); }`,
  });
}

export const CAPTION_WORDS = ['EVERY', 'FRAME', 'IS', 'A', 'PURE', 'FUNCTION', 'OF', 'TIME'];
export function captionAt(t) {
  const per = DURATION / CAPTION_WORDS.length;
  const active = Math.min(CAPTION_WORDS.length - 1, Math.floor(t / per));
  const group = Math.floor(active / 4);
  return { words: CAPTION_WORDS.slice(group * 4, group * 4 + 4), active: active - group * 4, pop: (t - active * per) / per };
}

/**
 * @param {{canvas?: HTMLCanvasElement, renderer?: THREE.WebGLRenderer, width?: number, height?: number}} opts
 */
export function createBenchScene(opts = {}) {
  const width = opts.width ?? WIDTH;
  const height = opts.height ?? HEIGHT;
  const renderer =
    opts.renderer ??
    new THREE.WebGLRenderer({
      canvas: opts.canvas,
      antialias: false, // MSAA is done on the composer target instead
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: opts.preserveDrawingBuffer ?? false,
    });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fd3ff);
  scene.fog = new THREE.Fog(0x8fd3ff, 18, 46);

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xcfe9ff, 0x6b5a7a, 1.1));
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.6);
  sun.position.set(7, 12, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 40;
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.12;
  scene.add(sun);

  const ramp3 = makeGradientMap([0.35, 0.7, 1.0]);
  const ramp4 = makeGradientMap([0.25, 0.5, 0.8, 1.0]);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(40, 64),
    new THREE.MeshToonMaterial({ color: 0x7ccf6a, gradientMap: ramp3 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const geos = [
    new THREE.SphereGeometry(0.6, 32, 20),
    new THREE.BoxGeometry(0.95, 0.95, 0.95, 1, 1, 1),
    new THREE.ConeGeometry(0.6, 1.3, 24),
    new THREE.TorusKnotGeometry(0.42, 0.16, 96, 14),
    new THREE.CapsuleGeometry(0.4, 0.8, 6, 20),
    new THREE.IcosahedronGeometry(0.65, 1),
  ];
  const palette = [0xff6b6b, 0xffd166, 0x4ecdc4, 0x5b8cff, 0xc77dff, 0xff9f1c, 0xf7f7ff];
  const outlineMat = makeOutlineMaterial(0.035);
  const rnd = mulberry32(1337);
  const items = [];
  for (let i = 0; i < MESH_COUNT; i++) {
    const geo = geos[i % geos.length];
    const glow = i % 7 === 3; // a few emissive meshes so bloom has something to grab
    const mat = new THREE.MeshToonMaterial({
      color: palette[i % palette.length],
      gradientMap: i % 2 ? ramp3 : ramp4,
      emissive: glow ? palette[i % palette.length] : 0x000000,
      emissiveIntensity: glow ? 5.0 : 0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const outline = new THREE.Mesh(geo, outlineMat);
    outline.castShadow = false;
    mesh.add(outline);
    const ring = i % 3;
    const item = {
      mesh,
      angle: rnd() * Math.PI * 2,
      radius: 2.2 + ring * 2.6 + rnd() * 1.2,
      baseY: 0.9 + rnd() * 3.6,
      bobAmp: 0.25 + rnd() * 0.5,
      bobHz: 0.3 + rnd() * 0.5,
      phase: rnd() * Math.PI * 2,
      spin: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(2.4),
      orbit: (ring % 2 ? -1 : 1) * (0.12 + rnd() * 0.18),
      scale: 0.7 + rnd() * 0.8,
    };
    mesh.scale.setScalar(item.scale);
    items.push(item);
    scene.add(mesh);
  }

  const target = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(1);
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.9, 0.6, 1.0);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function update(t) {
    for (const it of items) {
      const a = it.angle + t * it.orbit;
      it.mesh.position.set(
        Math.cos(a) * it.radius,
        it.baseY + Math.sin(t * it.bobHz * Math.PI * 2 + it.phase) * it.bobAmp,
        Math.sin(a) * it.radius,
      );
      it.mesh.rotation.set(it.spin.x * t + it.phase, it.spin.y * t, it.spin.z * t);
    }
    const u = t / DURATION;
    const ca = -0.6 + u * 1.5;
    const dist = 17 - 5 * (0.5 - 0.5 * Math.cos(u * Math.PI));
    camera.position.set(Math.sin(ca) * dist, 4.2 + 2.2 * u, Math.cos(ca) * dist);
    camera.lookAt(0, 2.6, 0);
    camera.updateMatrixWorld();
  }

  function renderAt(t) {
    update(t);
    composer.render(1 / FPS);
  }

  return { renderer, scene, camera, composer, bloom, update, renderAt };
}
