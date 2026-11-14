// Demo scene for the outline shader. Everything is a function of `t`.
//   variant=video  : exactly the video (object-space hull 0.02, 3-tone toon torus knot)
//   variant=hull   : production settings (world-space hull, smoothed normals, skinned glTF)
//   variant=edges  : hull + screen-space depth/normal edge pass for interior lines
//   variant=wobble : pixel-width hull with hand-drawn wobble stepped on twos
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { solidify, addOutlines, createOutlineMaterial, setOutlineSeed } from '../src/solidify.js';
import { makeGradientMap, createToonMaterial, toonify } from '../src/toon.js';
import { EdgeOutlinePass } from '../src/edge-pass.js';

export function createDemo({ canvas, width = 1080, height = 1920, fps = 30, variant = 'hull', modelUrl }) {
  modelUrl ??= new URL('../assets/RobotExpressive.glb', import.meta.url).href;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffe3c2);
  const camera = new THREE.PerspectiveCamera(35, width / height, 0.5, 60);
  camera.position.set(0, 4.6, 21);
  camera.lookAt(0, 4.3, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb08a7a, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(5, 10, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 12, bottom: -2, near: 1, far: 30 });
  sun.shadow.normalBias = 0.08;
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(30, 48), createToonMaterial({ color: 0xf2b880, steps: 3 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.userData.noOutline = true;
  scene.add(ground);

  const res = new THREE.Vector2(width, height);
  const outlineOpts =
    variant === 'video' ? { mode: 'object', thickness: 0.02, color: 0x000000 }
    : variant === 'wobble' ? { mode: 'screen', thickness: 5, color: 0x1a1020, resolution: res, wobble: 0.6, wobbleScale: 3, smoothNormals: true }
    : { mode: 'world', thickness: 0.045, color: 0x1a1020, smoothNormals: true };
  const sharedOutline = createOutlineMaterial({ ...outlineOpts, useOutlineNormal: !!outlineOpts.smoothNormals });

  // 1. The video's first object: TorusKnotGeometry(1, 0.4, 100, 100) + MeshToonMaterial + 3-tone ramp + solidify()
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.4, 100, 100), createToonMaterial({ color: 0x4e62f9, steps: 3 }));
  knot.position.set(-2.1, 8.2, 0);
  knot.castShadow = true;
  solidify(knot, { ...outlineOpts, material: sharedOutline });
  scene.add(knot);

  // 2. Hard-edged mesh: top cube uses smoothed outline normals, bottom cube uses raw face normals (splits at corners)
  const cubeGeoA = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const cubeA = new THREE.Mesh(cubeGeoA, createToonMaterial({ color: 0xff6b6b, steps: 4 }));
  cubeA.position.set(2.2, 9.2, 0);
  cubeA.castShadow = true;
  solidify(cubeA, { ...outlineOpts, smoothNormals: true, material: undefined });
  scene.add(cubeA);
  const cubeB = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), createToonMaterial({ color: 0x4ecdc4, steps: 4 }));
  cubeB.position.set(2.2, 6.9, 0);
  cubeB.castShadow = true;
  solidify(cubeB, { ...outlineOpts, smoothNormals: false, material: undefined });
  scene.add(cubeB);

  // 3. Skinned glTF character: toonify + one shared outline material for all its meshes
  let mixer = null;
  let robot = null;
  const ready = new GLTFLoader().loadAsync(modelUrl).then(async (gltf) => {
    robot = gltf.scene;
    toonify(robot, { steps: 3 });
    robot.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
    addOutlines(robot, { ...outlineOpts, material: sharedOutline });
    scene.add(robot);
    mixer = new THREE.AnimationMixer(robot);
    const clip = THREE.AnimationClip.findByName(gltf.animations, 'Dance') ?? gltf.animations[0];
    mixer.clipAction(clip).play();
    await renderer.compileAsync(scene, camera); // no shader compile hitch inside a captured frame
  });

  const target = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(1);
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  if (variant === 'edges') composer.addPass(new EdgeOutlinePass(scene, camera, width, height, { thickness: 1.5, color: 0x1a1020 }));
  composer.addPass(new OutputPass());

  function renderAt(t) {
    knot.rotation.set(t * 0.7, t * 0.9, 0);
    cubeA.rotation.set(0.5 + t * 0.5, 0.6 + t * 0.8, 0);
    cubeB.rotation.set(0.5 + t * 0.5, 0.6 + t * 0.8, 0);
    if (mixer) mixer.setTime(t); // absolute seek: safe for out-of-order frames
    if (robot) robot.rotation.y = Math.sin(t * 0.8) * 0.5;
    setOutlineSeed(sharedOutline, Math.floor((t * fps) / 2)); // line boil "on twos"
    composer.render(1 / fps);
  }

  return { ready, renderAt, renderer, scene, camera, composer };
}
