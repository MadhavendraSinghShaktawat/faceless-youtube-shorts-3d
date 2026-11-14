# Three.js techniques for the look

Every snippet here is cut from code that ran on **three.js r187 (0.187.0)** with `WebGLRenderer` + `EffectComposer` in headless Chrome 157 (ANGLE Metal), 1080x1920.

- Smoke test with all of it in one scene: `research/_bench/techniques/techniques.js`. Run `node research/_bench/techniques/test.mjs` (it uses `research/outline-shader/node_modules`).
- Result: `_bench/techniques/out/all.png` (inspected: toon trees with ink outlines, wind-bent grass, glowing particles, sun glow, depth of field, billboard character, stick figure, painted rock).
- Cost of that scene: **4.2 ms per frame** with god rays + depth of field + bloom, 3.1 ms without depth of field, 33 ms with 8-sample motion blur.
- Determinism: for each variant, rendering t=2.0, then t=3.3, then t=2.0 again gave byte-identical PNGs for the two t=2.0 frames.

Import paths: `three` and `three/addons/...` (which maps to `examples/jsm/`).

## 0. Deterministic time (the rule everything else follows)

Build the scene once. Expose one function that sets every animated value from `t` and draws.

```js
export function createScene({ canvas }) {
  // ... build ...
  function renderAt(t) {            // t in seconds = frame / fps
    update(t);                      // positions, uniforms, mixer.setTime(t)
    composer.render(1 / 30);        // the delta argument is unused by the passes below
  }
  return { ready, renderAt };
}
```

Banned in scene code, because frames are rendered out of order and on several workers:

| Do not use | Use instead |
| --- | --- |
| `requestAnimationFrame`, `renderer.setAnimationLoop` | The host calls `renderAt(t)`. |
| `Date.now()`, `performance.now()`, `THREE.Clock`, `THREE.Timer` | The `t` you are given. |
| `Math.random()` | A seeded PRNG at build time (`mulberry32`, below), or a hash of an index. |
| `mixer.update(delta)` | `mixer.setTime(t)`. Verified with a skinned glTF: seek back and forth gives identical pixels. |
| Anything that reads the previous frame: `AfterimagePass`, `SavePass` + blend, TAA, damped controls, physics stepped per frame | Closed-form motion, or simulate once at load into arrays and look up by `t`. |
| `uniform.value += ...` | `uniform.value = f(t)`. |

```js
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
```

Before the first captured frame: `await renderer.compileAsync(scene, camera)` so no shader compiles inside a frame, and `await loader.loadAsync(url)` for every asset.

## 1. Renderer and post chain

```js
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(1080, 1920, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;        // PCFSoftShadowMap was removed in r187
renderer.toneMapping = THREE.NeutralToneMapping;     // applied by OutputPass

const target = new THREE.WebGLRenderTarget(1080, 1920, { type: THREE.HalfFloatType, samples: 4 });  // HDR + MSAA
const composer = new EffectComposer(renderer, target);
composer.setPixelRatio(1);
composer.setSize(1080, 1920);
composer.addPass(new RenderPass(scene, camera));
// order used and verified: [edge lines] -> god rays -> depth of field -> bloom -> output
composer.addPass(new OutputPass());                   // tone mapping + sRGB, always last
```

The half-float target is what makes selective bloom work, and `samples: 4` is the anti-aliasing (the renderer's own `antialias` does nothing once a composer is in use).

## 2. Toon / cel shading with gradient maps

```js
function makeGradientMap(values = [0.35, 0.675, 1.0]) {          // dark -> light
  const tex = new THREE.DataTexture(new Uint8Array(values.map((v) => Math.round(v * 255))), values.length, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;            // linear filtering would blur the bands away
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}
const mat = new THREE.MeshToonMaterial({ color: 0x4e62f9, gradientMap: makeGradientMap() });
```

Facts from the r187 shader (`gradientmap_pars_fragment`, `lights_toon_pars_fragment`):

- The ramp is sampled at `u = dot(N, L) * 0.5 + 0.5` and only the red channel is read. The left half of the ramp is the side facing away from the light.
- Each light contributes `ramp * lightColor * albedo`. Ambient and hemisphere light are added unbanded, so they set how dark the shadow band is.
- Shadow maps multiply the light colour, so shadow edges are soft, not banded. `light.shadow.normalBias = 0.08` to `0.12` removes the ragged self-shadowing that toon shading shows up.
- No specular. For a rim light or a hard highlight, add it in `onBeforeCompile`, or fake it with an emissive mesh.

Helpers in `research/outline-shader/src/toon.js`: `makeGradientMap(3 | 4 | 5 | [values])`, `createToonMaterial()`, `toonify(gltfScene)`.

## 3. Hand-painted texture workflow

The reference video's method: **use only the base colour map, and flatten it**. Three routes, all producing a plain sRGB colour texture for `MeshToonMaterial.map`:

1. **Offline (best for hero assets).** Krita: Filter > G'MIC > Artistic > Cartoon. Photoshop: Filter Gallery > Artistic > Cutout (levels 8, edge simplicity 6, edge fidelity 1). Export PNG, load with `TextureLoader`.
2. **At load, in the page.** `posterizeTexture(texture, { levels: 6, blur: 3 })` in `outline-shader/src/toon.js`: blur, then quantise each channel. An approximation of those filters, not a port.
3. **Painted in code.** Seeded brush strokes on a canvas. Used for the ground and rock in the smoke test:

```js
function paintedTexture({ base = '#7a8f5a', strokes = ['#8fa868', '#6a7d4c', '#a3b77a'], size = 512, count = 900, seed = 7 }) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const r = mulberry32(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size); g.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = r() * size, y = r() * size, a = r() * Math.PI, len = 20 + r() * 60;
    g.strokeStyle = strokes[(r() * strokes.length) | 0]; g.globalAlpha = 0.35 + r() * 0.4; g.lineWidth = 6 + r() * 18;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;                 // colour textures must be tagged sRGB
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}
```

When converting a glTF: drop normal, roughness, metalness and AO maps (`toonify()` does this). They do nothing under toon shading except cost memory.

## 4. Ink outlines

See `research/outline-shader.md`. Short version: `addOutlines(root, { mode: 'world', thickness: 0.045, color: 0x1a1020, smoothNormals: true })` for characters and props; optional `EdgeOutlinePass` for interior creases. Give the ground and grass `userData.noOutline = true`.

## 5. Bloom, selective

Selective by brightness, which needs no second render: only pixels above 1.0 in the HDR buffer pass the threshold.

```js
const bloom = new UnrealBloomPass(new THREE.Vector2(1080, 1920), 0.7 /*strength*/, 0.5 /*radius*/, 1.0 /*threshold*/);
composer.addPass(bloom);   // after depth of field, before OutputPass

// things that should glow
new THREE.MeshToonMaterial({ color: 0xffe08a, emissive: 0xffc24a, emissiveIntensity: 6 });
// in a custom shader: write colour * 2.5 or more
```

Keep ordinary lit surfaces below 1.0 in the HDR buffer or the whole frame blooms. three divides diffuse light by pi, so a white surface under a sun of intensity 2.6 plus a hemisphere light of 1.0 lands close to 1.0; in the benchmark scene that combination left only the emissive meshes glowing. If pale surfaces start to glow, lower the light or raise the threshold.

The other option is layer-based selective bloom (the three.js `webgl_postprocessing_unreal_bloom_selective` example): render the scene a second time with non-glowing materials swapped to black, bloom that, and add it back. It gives exact per-object control at the price of a second scene render and a material-swap pass. Not needed so far.

## 6. Depth of field

```js
const bokeh = new BokehPass(scene, camera, { focus: 10, aperture: 0.0012, maxblur: 0.008 });
composer.addPass(bokeh);
// per frame, pure function of the pose:
bokeh.uniforms.focus.value = camera.position.distanceTo(hero.position);
```

- `focus` is a world-space distance from the camera. `aperture` scales blur with distance from focus; `maxblur` caps it (fraction of the frame). The values above gave a soft foreground and background at a camera distance of 11 units.
- `BokehPass` renders its own depth with `MeshDepthMaterial` as an override material. So anything alpha-tested (billboards) is a solid rectangle in that depth, and custom vertex displacement (grass wind, hull offsets) is not applied. In practice this was not visible in the test frame, but a large billboard near a focus edge can show a rectangular halo.
- Cost here: about 1.1 ms per frame.

Alternatives: the `postprocessing` npm package (6.39.6, Zlib licence) has a higher-quality `DepthOfFieldEffect`, at the cost of moving the whole chain to its `EffectComposer`. On the WebGPU side r187 ships `three/addons/tsl/display/DepthOfFieldNode.js`. Neither was tested.

## 7. Volumetric light shafts (god rays)

r187 no longer ships a `GodRaysShader` in `examples/jsm/shaders`. Options:

| Option | What it is | Verdict |
| --- | --- | --- |
| Screen-space radial blur (below) | Draw occluders black and the sun white into a half-res target, then smear it away from the sun's screen position and add it. | Implemented and verified. About 60 lines, one extra scene render at half resolution. |
| Additive cone or card meshes | A cone from the light with a soft, depth-faded additive material. | Cheapest and fully art-directable; use for window shafts and spotlights. Not built here. |
| `postprocessing` package `GodRaysEffect` | Same screen-space idea, packaged. | Needs that library's composer. Not tested. |
| `three/addons/tsl/display/GodraysNode.js` | True shadow-map ray-marched shafts. | WebGPU / TSL only. Not tested. |

Core of the verified pass (`GodRaysPass` in `techniques.js`):

```js
// 1. occlusion buffer: everything black, sun disc white, depth-tested
scene.overrideMaterial = blackBasicMaterial; scene.background = null; scene.fog = null;
renderer.setRenderTarget(occlusion); renderer.setClearColor(0x000000, 1); renderer.clear();
renderer.render(scene, camera);
renderer.autoClear = false; renderer.render(sunScene, camera); renderer.autoClear = true;
// 2. sun position in UV space
v.copy(sunPosition).project(camera); uSunUv.set(v.x * 0.5 + 0.5, v.y * 0.5 + 0.5);
```

```glsl
vec2 delta = (vUv - uSunUv) * (uDensity / float(SAMPLES));              // SAMPLES 64, density 0.95
float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
vec2 uv = vUv - delta * jitter; float illum = 1.0; float acc = 0.0;
for (int i = 0; i < SAMPLES; i++) { uv -= delta; acc += texture2D(tOcclusion, uv).r * illum * uWeight; illum *= uDecay; }
gl_FragColor = vec4(base.rgb + uColor * acc * uExposure, base.a);        // decay 0.965, weight 0.045
```

The jitter is a fixed per-pixel pattern, so it hides banding without adding frame-to-frame noise. Hide points, sprites and lines during the occlusion render (the pass does), and restore `overrideMaterial`, background, fog and clear colour afterwards. Put it before bloom so the shafts bloom too.

## 8. Motion blur

Anything based on the previous frame (`AfterimagePass`, the reference repo's `SavePass` blend) is order-dependent and must not be used. The deterministic method is **sub-frame accumulation**: render the scene several times across the open shutter and average, in linear HDR, then tone-map once.

```js
const accum = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType });
const addQuad = new FullScreenQuad(new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: null }, uWeight: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uWeight; varying vec2 vUv;
    void main(){ gl_FragColor = vec4(texture2D(tDiffuse, vUv).rgb * uWeight, uWeight); }`,
  blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
  depthTest: false, depthWrite: false,
}));

function renderAt(t, { samples = 8, shutter = 0.5 } = {}) {      // shutter 0.5 = 180 degrees
  output.enabled = false; composer.renderToScreen = false;      // keep the chain linear
  renderer.setRenderTarget(accum); renderer.setClearColor(0x000000, 0); renderer.clear();
  for (let k = 0; k < samples; k++) {
    update(t + ((k + 0.5) / samples - 0.5) * shutter / fps);
    composer.render();
    addQuad.material.uniforms.tDiffuse.value = composer.readBuffer.texture;
    addQuad.material.uniforms.uWeight.value = 1 / samples;
    renderer.autoClear = false; renderer.setRenderTarget(accum); addQuad.render(renderer); renderer.autoClear = true;
  }
  output.uniforms.tDiffuse.value = accum.texture;
  output.render(renderer, null, accum);                          // OutputPass draws to the canvas
}
```

Verified deterministic. Cost is linear: 8 samples took 33 ms per frame against 4.2 ms. Use it only on shots that need it (whip pans, fast action), and 4 to 8 samples is enough for a stylised look. Cheaper cheats that fit the cartoon style: smear frames (stretch the mesh along its velocity for 1 to 2 frames) and speed lines (`Line2`, below). A velocity-buffer blur exists for WebGPU (`three/addons/tsl/display/MotionBlur.js`); not tested.

## 9. Fog

```js
scene.fog = new THREE.FogExp2(0x9fd6ff, 0.028);      // or new THREE.Fog(color, near, far)
scene.background = new THREE.Color(0x9fd6ff);        // match, so distant objects dissolve into the sky
```

Built-in materials pick it up automatically. A `ShaderMaterial` needs `fog: true`, the `THREE.UniformsLib.fog` uniforms merged in, and the `fog_pars_vertex` / `fog_vertex` / `fog_pars_fragment` / `fog_fragment` chunks (the outline material does this). Additive particles should usually ignore fog.

## 10. GPU particles

Stateless: every particle's position is computed in the vertex shader from a per-particle seed and `uTime`. No buffers are updated per frame, so any frame can be drawn in any order.

```js
geometry.setAttribute('position', new THREE.BufferAttribute(spawnPositions, 3));
geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));            // 4 seeded randoms each
geometry.boundingSphere = new THREE.Sphere(center, radius);                    // the shader moves them; set bounds by hand
const particles = new THREE.Points(geometry, new THREE.ShaderMaterial({
  uniforms: { uTime, uSize: { value: 0.07 }, uColor: { value: new THREE.Color(0xfff2a8) },
              uScale: { value: 1920 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) } },
  vertexShader: `attribute vec4 aSeed; uniform float uTime, uSize, uScale; varying float vAlpha;
    void main() {
      float life = fract(aSeed.w + uTime * (0.05 + 0.08 * aSeed.x));           // looping 0..1 lifetime
      vec3 p = position + vec3(sin(uTime * 0.7 + aSeed.y * 6.2832) * 0.5, life * 6.0, cos(uTime * 0.5 + aSeed.z * 6.2832) * 0.5);
      vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * (0.5 + aSeed.x) * uScale / -mv.z;                 // world-size points with perspective
      vAlpha = sin(life * 3.14159);                                            // fade in and out, no popping
    }`,
  fragmentShader: `uniform vec3 uColor; varying float vAlpha;
    void main() { float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(uColor * 2.5, smoothstep(0.5, 0.1, d) * vAlpha); }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
}));
```

`uColor * 2.5` pushes them over the bloom threshold. 1,500 were used; tens of thousands are fine. For bursts (impact sparks, dust puffs), add a start time attribute and use `max(0.0, uTime - aStart)` as the age with a ballistic formula. State-carrying GPU simulation (`GPUComputationRenderer`) breaks out-of-order rendering and is not suitable.

## 11. Instanced grass

One blade geometry, 30,000 instances, wind in the vertex shader of a stock toon material.

```js
const H = 0.55;
const blade = new THREE.PlaneGeometry(0.09, H, 1, 4); blade.translate(0, H / 2, 0);    // root at y = 0
const p = blade.attributes.position, n = blade.attributes.normal;
for (let i = 0; i < p.count; i++) { p.setX(i, p.getX(i) * (1 - (p.getY(i) / H) * 0.9)); n.setXYZ(i, 0, 1, 0); }
// taper to a tip; normals forced up so every blade takes the ground's lighting and the field reads as one flat mass

const uTime = { value: 0 };
const grassMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: ramp, side: THREE.DoubleSide });
grassMat.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = uTime;
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uTime;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      float h = position.y / ${H.toFixed(3)};
      vec3 root = instanceMatrix[3].xyz;
      float sway = sin(uTime * 1.8 + root.x * 0.9 + root.z * 1.3) * 0.16 + sin(uTime * 3.1 + root.x * 2.1) * 0.05;
      transformed.x += sway * h * h;`);                                               // tips move, roots stay
};
const grass = new THREE.InstancedMesh(blade, grassMat, 30000);
grass.receiveShadow = true;                                                          // castShadow off: too noisy, too costly
for (let i = 0; i < 30000; i++) {
  grass.setMatrixAt(i, m.compose(position, yRotation, scale));                       // seeded placement
  grass.setColorAt(i, color.setHSL(0.27 + rnd() * 0.06, 0.55, 0.38 + rnd() * 0.16)); // per-blade tint
}
```

Set `uTime.value = t` in `update(t)`. If the instanced mesh is large and off-origin, set `grass.frustumCulled = false` or compute its bounding sphere, since the wind moves vertices outside the static bounds.

## 12. 2D cartoon characters in a 3D world

Three workable forms. All three were rendered in the smoke test.

**A. Billboard plane with a drawn texture.** Fastest way to get a truly 2D character (drawn in a canvas, an SVG, or a PNG sprite sheet) into the world.

```js
const mat = new THREE.MeshBasicMaterial({ map: charTexture, alphaTest: 0.5, side: THREE.DoubleSide });
const billboard = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), mat);
billboard.castShadow = true;
billboard.customDepthMaterial = new THREE.MeshDepthMaterial({         // shadow in the character's shape, not a rectangle
  depthPacking: THREE.RGBADepthPacking, map: charTexture, alphaTest: 0.5 });
// per frame: turn about Y only, so the feet stay planted
billboard.rotation.y = Math.atan2(camera.position.x - billboard.position.x, camera.position.z - billboard.position.z);
```

- Use `alphaTest` (hard cut-out), not `transparent: true`: it writes depth, so sorting, depth of field and fog all behave. The outline is part of the drawing.
- `MeshBasicMaterial` keeps the drawn colours exactly; use `MeshToonMaterial` with the same `map` and `alphaTest` if the character should take scene light.
- `THREE.Sprite` always faces the camera fully (it tilts back when the camera looks down) and cannot cast shadows; prefer the plane.
- Animate by swapping `texture.offset` / `texture.repeat` over a sprite sheet as a function of `Math.floor(t * 12)`, or redraw the canvas and set `texture.needsUpdate = true`.
- It is flat: side-on camera moves give it away. Keep the camera within about 40 degrees of front.

**B. 3D meshes with flat toon shading and thick hull outlines.** The stick-figure style: capsule limbs, sphere head. This holds up from any angle and takes real shadows. Build limbs from **one unit capsule stretched between two joints**, so no geometry is created per frame:

```js
const limbGeo = new THREE.CapsuleGeometry(0.11, 1, 6, 12);          // unit length along Y
const UP = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3();
function setLimb(mesh, a, b) {                                       // a, b: joint positions
  d.subVectors(b, a); const len = d.length();
  mesh.position.addVectors(a, b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  mesh.scale.set(1, len, 1);
}
// joints are plain functions of t (walk cycle = sines of t * stepRate); then:
setLimb(upperArmL, neck, elbowL); setLimb(forearmL, elbowL, handL);  // etc.
solidify(limb, { material: sharedOutline, smoothNormals: true });   // 'world' mode ignores the non-uniform scale
```

The outline's `world` mode is what makes this work: an object-space outline would be stretched by `scale.y`. For bendy noodle limbs, rebuild a `TubeGeometry(new CatmullRomCurve3([shoulder, elbow, hand]), 16, 0.1, 8)` per frame and assign it to both the limb and its outline child (dispose the old one); that is a few hundred vertices, which is cheap. A rigged glTF with `mixer.setTime(t)` is the route for anything more complex (verified with RobotExpressive).

**C. Fat lines.** For pure line-art limbs, speed lines and scribbles. Width in world units, so they scale with perspective.

```js
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
const geo = new LineGeometry();
const line = new Line2(geo, new LineMaterial({ color: 0x1a1020, linewidth: 0.07, worldUnits: true }));
line.material.resolution.set(1080, 1920);
geo.setPositions(flatXYZArray);                                      // call again each frame to animate
```

With `worldUnits: false`, `linewidth` is in pixels. Fat lines have no round caps or joins at sharp bends; keep curves smooth or put small spheres at the joints. They do not cast shadows.

Which to use: B for the main characters (they must be lit, shadowed and seen from moving cameras), A for crowds, props, faces and effects drawn in 2D, C for accents.

## 13. Loading glTF characters and seeking animation

```js
const gltf = await new GLTFLoader().loadAsync(url);                  // await before the first frame
toonify(gltf.scene, { steps: 3 });
addOutlines(gltf.scene, { mode: 'world', thickness: 0.045, smoothNormals: true });
const mixer = new THREE.AnimationMixer(gltf.scene);
mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'Dance')).play();
await renderer.compileAsync(scene, camera);
// in update(t):
mixer.setTime(t);
```

For cross-fades, set each action's `time` and `weight` directly from `t` rather than using `crossFadeTo`, which is driven by `mixer.update` deltas.

## Not verified here

- The `postprocessing` and `@react-three/postprocessing` packages.
- Any WebGPU / TSL effect other than `toonOutlinePass` (which was run and drew correctly; see `outline-shader.md`).
- Layer-based selective bloom, cone-mesh light shafts, sprite-sheet animation, `TubeGeometry` limbs: described from the three.js API, not rendered in the smoke test.
