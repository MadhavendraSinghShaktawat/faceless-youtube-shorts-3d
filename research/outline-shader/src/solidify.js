// Inverted-hull ("solidify") outline for three.js -- verified on three r187.
//
// This is the technique taught in "Stylized Cartoon Shader In THREE.JS (Full
// Explanation)" (youtu.be/V5UllFImvoE): draw the mesh a second time with
//   1. a flat black unlit material,
//   2. side = BackSide (front faces culled, so only the "shell" behind shows),
//   3. every vertex pushed out along its normal by a constant `thickness`
//      in the vertex shader  ->  newPosition = position + normal * thickness
//
// The video's version is `mode: 'object'` below. On top of that this module
// adds what a production scene needs and the video does not cover:
//   - skinned meshes, morph targets, InstancedMesh/BatchedMesh, fog, clipping
//   - `world` (constant world-unit width) and `screen` (constant pixel width)
//   - smoothed outline normals so hard-edged meshes (cubes) do not split
//   - optional hand-drawn wobble, driven by a seed you step from the frame
import * as THREE from 'three';

const MODES = { object: 0, world: 1, screen: 2 };

const vertexShader = /* glsl */ `
#include <common>
#include <batching_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float uThickness;
uniform vec2 uResolution;
uniform float uWobble;
uniform float uWobbleScale;
uniform float uSeed;

#ifdef USE_OUTLINE_NORMAL
  attribute vec3 outlineNormal;
#endif

float olHash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float olNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(olHash(i), olHash(i + vec3(1, 0, 0)), f.x), mix(olHash(i + vec3(0, 1, 0)), olHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(olHash(i + vec3(0, 0, 1)), olHash(i + vec3(1, 0, 1)), f.x), mix(olHash(i + vec3(0, 1, 1)), olHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

void main() {
  #include <morphinstance_vertex>
  #include <batching_vertex>

  #ifdef USE_OUTLINE_NORMAL
    vec3 objectNormal = outlineNormal;
  #else
    vec3 objectNormal = normal;
  #endif
  vec3 hullNormal = normalize(objectNormal); // bind-pose normal, used by 'object' mode

  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>

  #include <begin_vertex>
  #include <morphtarget_vertex>

  float width = uThickness * (1.0 + uWobble * (olNoise(position * uWobbleScale + uSeed * 17.31) * 2.0 - 1.0));

  #if OUTLINE_MODE == 0
    // The video: newPosition = position + normal * thickness (object space,
    // before skinning so the offset is carried along by the bones).
    transformed += hullNormal * width;
  #endif

  #include <skinning_vertex>
  #include <project_vertex>

  #if OUTLINE_MODE != 0
    vec3 viewNormal = normalize(transformedNormal);
    #ifdef FLIP_SIDED
      viewNormal = -viewNormal; // defaultnormal_vertex flips for BackSide; undo it
    #endif
    #if OUTLINE_MODE == 1
      // constant width in world units, independent of object scale
      mvPosition.xyz += viewNormal * width;
      gl_Position = projectionMatrix * mvPosition;
    #else
      // constant width in output pixels, independent of distance
      vec4 clipNormal = projectionMatrix * vec4(viewNormal, 0.0);
      vec2 dir = clipNormal.xy * uResolution;
      float len = length(dir);
      dir = len > 1e-6 ? dir / len : vec2(0.0);
      gl_Position.xy += dir * (2.0 * width / uResolution) * gl_Position.w;
    #endif
  #endif

  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
#include <common>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
  gl_FragColor = vec4(uColor, uOpacity);
  #include <colorspace_fragment>
  #include <fog_fragment>
}
`;

/**
 * @param {object} [o]
 * @param {THREE.ColorRepresentation} [o.color=0x000000]
 * @param {number} [o.thickness=0.02]  object units ('object'), world units ('world') or pixels ('screen')
 * @param {'object'|'world'|'screen'} [o.mode='object']  'object' is exactly the video's shader
 * @param {THREE.Vector2} [o.resolution]  render size in pixels, needed for 'screen'
 * @param {number} [o.wobble=0]  0..1 width variation for a hand-inked look
 * @param {number} [o.wobbleScale=4]  noise frequency in object units
 * @param {boolean} [o.fog=true]  let scene fog tint the line
 * @param {boolean} [o.useOutlineNormal=false]  read the smoothed `outlineNormal` attribute
 */
export function createOutlineMaterial(o = {}) {
  const mode = o.mode ?? 'object';
  if (!(mode in MODES)) throw new Error(`outline mode must be object|world|screen, got ${mode}`);
  const fog = o.fog ?? true;
  const material = new THREE.ShaderMaterial({
    name: 'InvertedHullOutline',
    side: THREE.BackSide,
    fog,
    toneMapped: false,
    transparent: (o.opacity ?? 1) < 1,
    defines: { OUTLINE_MODE: MODES[mode], ...(o.useOutlineNormal ? { USE_OUTLINE_NORMAL: '' } : {}) },
    uniforms: THREE.UniformsUtils.merge([
      fog ? THREE.UniformsLib.fog : {},
      {
        uColor: { value: new THREE.Color(o.color ?? 0x000000) },
        uOpacity: { value: o.opacity ?? 1 },
        uThickness: { value: o.thickness ?? 0.02 },
        uResolution: { value: (o.resolution ?? new THREE.Vector2(1080, 1920)).clone() },
        uWobble: { value: o.wobble ?? 0 },
        uWobbleScale: { value: o.wobbleScale ?? 4 },
        uSeed: { value: 0 },
      },
    ]),
    vertexShader,
    fragmentShader,
  });
  return material;
}

/**
 * Average the normals of all vertices that share a position and store the
 * result as `outlineNormal`. Without this a hard-edged mesh (cube, low-poly
 * prop) tears open at every crease, because each face pushes its own copy of
 * the corner in a different direction.
 */
export function computeOutlineNormals(geometry, precision = 1e4) {
  const pos = geometry.attributes.position;
  const nor = geometry.attributes.normal;
  if (!nor) geometry.computeVertexNormals();
  const normal = geometry.attributes.normal;
  const sums = new Map();
  const seen = new Map();
  const keyOf = (i) => `${Math.round(pos.getX(i) * precision)},${Math.round(pos.getY(i) * precision)},${Math.round(pos.getZ(i) * precision)}`;
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const k = keyOf(i);
    n.fromBufferAttribute(normal, i);
    // count each distinct face normal once, so triangle count does not bias the average
    const nk = `${k}|${Math.round(n.x * 100)},${Math.round(n.y * 100)},${Math.round(n.z * 100)}`;
    if (seen.has(nk)) continue;
    seen.set(nk, true);
    const s = sums.get(k) ?? new THREE.Vector3();
    s.add(n);
    sums.set(k, s);
  }
  const out = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    n.copy(sums.get(keyOf(i))).normalize();
    out[i * 3] = n.x; out[i * 3 + 1] = n.y; out[i * 3 + 2] = n.z;
  }
  geometry.setAttribute('outlineNormal', new THREE.BufferAttribute(out, 3));
  return geometry;
}

/**
 * The video's `solidify(mesh)`: returns the black shell mesh, parented to
 * `mesh` so it follows every transform, bone and instance.
 * @param {THREE.Mesh} mesh
 * @param {object} [o]  createOutlineMaterial options, plus:
 * @param {THREE.Material} [o.material]  share one outline material between meshes
 * @param {boolean} [o.smoothNormals=false]  compute + use `outlineNormal`
 */
export function solidify(mesh, o = {}) {
  const geometry = mesh.geometry;
  if (o.smoothNormals && !geometry.attributes.outlineNormal) computeOutlineNormals(geometry);
  const material = o.material ?? createOutlineMaterial({ ...o, useOutlineNormal: !!o.smoothNormals });

  let outline;
  if (mesh.isSkinnedMesh) {
    outline = new THREE.SkinnedMesh(geometry, material);
    outline.bindMode = mesh.bindMode;
    outline.bind(mesh.skeleton, mesh.bindMatrix);
  } else if (mesh.isInstancedMesh) {
    outline = new THREE.InstancedMesh(geometry, material, mesh.count);
    outline.instanceMatrix = mesh.instanceMatrix; // shared buffer: instances stay in sync
    outline.count = mesh.count;
  } else {
    outline = new THREE.Mesh(geometry, material);
  }
  if (mesh.morphTargetInfluences) {
    outline.morphTargetInfluences = mesh.morphTargetInfluences; // shared array
    outline.morphTargetDictionary = mesh.morphTargetDictionary;
  }
  outline.name = `${mesh.name || 'mesh'}__outline`;
  outline.userData.isOutline = true;
  outline.castShadow = false;
  outline.receiveShadow = false;
  outline.frustumCulled = mesh.frustumCulled;
  outline.raycast = () => {};
  mesh.add(outline);
  return outline;
}

/**
 * Outline every mesh under `root` (e.g. a loaded glTF scene) with ONE shared
 * material. Skips meshes flagged `userData.noOutline` and existing outlines.
 * @returns {{material: THREE.ShaderMaterial, outlines: THREE.Mesh[]}}
 */
export function addOutlines(root, o = {}) {
  const material = o.material ?? createOutlineMaterial({ ...o, useOutlineNormal: !!o.smoothNormals });
  const targets = [];
  root.traverse((obj) => {
    if (obj.isMesh && !obj.userData.isOutline && !obj.userData.noOutline) targets.push(obj);
  });
  const outlines = targets.map((m) => solidify(m, { ...o, material }));
  return { material, outlines };
}

/**
 * Step the wobble. Call with Math.floor(frame / 2) for an "animated on twos"
 * line boil; leave at 0 for a steady line. Pure function of the frame.
 */
export function setOutlineSeed(material, seed) {
  material.uniforms.uSeed.value = seed;
}
