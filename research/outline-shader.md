# The outline look from "Stylized Cartoon Shader In THREE.JS (Full Explanation)"

Video: https://www.youtube.com/watch?v=V5UllFImvoE (channel "arya 3d", formerly Visionary 3D; published 2023-05-08; 24:58).
Working code for everything below: `research/outline-shader/`. Verified on three.js r187 (0.187.0), `WebGLRenderer` + `EffectComposer`, headless Chrome 157 on ANGLE Metal.

## What was obtained

- **Transcript: yes, complete.** YouTube's auto-generated English captions, fetched with the scrape-creators transcript tool and read end to end (about 24,800 characters). It is speech only; the code on screen is not in it, so the shader below is rebuilt from what he says while typing.
- **Description and chapters:** 00:00 Intro, 00:23 Project setup, 01:06 References, 01:40 How I arrived at the solution, 04:48 Stylized Torus Knot, 12:07 Stylized Sword Model, 21:01 Bonus Method, 23:48 Outro.
- **Linked repo:** https://github.com/visionary-3d/stylized-shader-part1 (MIT, three `^0.148.0`, webpack). These are **starter files only**. `src/app.js` has the blue torus knot and an `_addModel()` loader but no outline code; the finished shader is not published. The repo does contain the three gradient ramps (`threeTone.jpg` 3x1 px, `fourTone.jpg` 4x1, `fiveTone.jpg` 5x1) and `sword.glb`.
- **Model used:** "Trandafir - Weaponcraft 2023" by einmeister5 on Sketchfab.

## The technique, precisely

It is the **inverted hull** (he calls it "solidify", after the Blender modifier he demonstrates it with), plus stock `MeshToonMaterial`, plus flattening the colour texture in a paint program. There is no post-processing edge detection in the video: no Sobel, no depth or normal buffers, no surface IDs, no noise on the line.

### 1. Outline: a black back-face shell pushed out along the normals

He first shows it in Blender (01:40): add a second, black emission material; add a Solidify modifier with thickness -0.01; flip normals; turn on backface culling; set the modifier's material offset to 1. Then he ports it to three.js (04:48) as a function `solidify(mesh)` that builds a second mesh from the same geometry.

Reconstructed from the transcript:

```js
const solidify = (mesh) => {
  const THICKNESS = 0.02;                       // 0.01 for the sword
  const geometry = mesh.geometry;
  const material = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      void main() {
        vec3 newPosition = position + normal * ${THICKNESS};
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }`,
    side: THREE.BackSide,
  });
  const outline = new THREE.Mesh(geometry, material);
  scene.add(outline);
  return outline;
};
```

The steps he walks through, and why each matters:

1. A copy of the mesh in flat red first, to see it. It z-fights with the original.
2. `side: THREE.BackSide`. Only the far inside of the copy is drawn, so it sits behind the original and stops fighting it. Now it is invisible, because it is the same size.
3. `outline.scale.setScalar(1.1)` makes a rim appear, but he rejects it: scaling from the origin gives a different thickness in different places.
4. Instead, move each vertex along its own normal in the vertex shader: `position + normal * thickness`. This gives the same thickness all the way round. Colour changed to black.

**Uniforms: none.** The thickness is a JavaScript constant baked into the shader source with a template literal (`${...}`); the colour is a literal. He uses 0.02 on the torus knot (`TorusKnotGeometry(1, 0.4, 100, 100)`) and 0.01 on the sword, saying the effect "works best if you make it really small".

### 2. Shading: `MeshToonMaterial` with a 3-step gradient map

```js
const texture = await new THREE.TextureLoader().loadAsync(TOON_TONE);   // images/textures/threeTone.jpg
texture.minFilter = texture.magFilter = THREE.NearestFilter;            // "a really important line"
const material = new THREE.MeshToonMaterial({ color: '#4e62f9', gradientMap: texture });
```

Without the gradient map the material looks wrong; with linear filtering the three bands blur into a smooth ramp. Nearest filtering is what makes the hard steps.

### 3. Textured models: keep only base colour, then cartoon-filter the texture

For the sword (12:07) there is no shader work. In Blender he deletes every map except base colour (specular tint, emission), unpacks the texture, filters it in a paint program, plugs the filtered image back into base colour, and re-exports the GLB. Then the same `solidify()` is called on the loaded model.

- **Krita** (12:07): Filter > G'MIC > Artistic > Cartoon. Smoothness 4.3, sharpening 135, edge threshold 16, edge thickness 0.5 (the caption reads "2.5"; unclear), colour strength 1, colour quantisation 51.
- **Photoshop, the "bonus method"** (21:01): Filter Gallery > Artistic > Cutout. Number of levels 8, edge simplicity 6, edge fidelity 1. He prefers this result.

He also strips the glTF's parent nodes and applies all transforms in Blender before export. That step matters more than it looks; see the first limit below.

## Limits of the video's version (measured here)

`npm test` in `research/outline-shader/` renders `out/video.png` with exactly the video's settings.

- **It breaks on meshes whose nodes or bones carry scale.** `normal * 0.02` is in the mesh's local units. The CC0 test character `RobotExpressive.glb` stores vertices about 0.01 units across under an armature scaled by 100, so 0.02 becomes 2 world units and the shell explodes into shards (`out/video.png`). This is why he flattens the hierarchy in Blender first.
- **Hard edges split.** Where a mesh has one normal per face (cubes, low-poly props), each face pushes its copy of a corner a different way and the outline opens at the corners.
- **No skinning, morphs or instancing.** A raw `ShaderMaterial` with that vertex shader ignores bones.
- **Width is in world space**, so lines get thinner with distance. Often wanted; sometimes not.
- **The starter repo's post chain is not usable for frame-by-frame rendering.** It blends each frame with the previous one (`SavePass` + `BlendShader`, mix 0.25) for motion blur, which depends on render order.
- The starter creates the renderer with `PCFSoftShadowMap`, which r187 has removed.

## Implementation for current three.js

Files (ES modules, bare `three` imports):

| File | Purpose |
| --- | --- |
| `outline-shader/src/solidify.js` | The inverted hull, generalised. |
| `outline-shader/src/toon.js` | Gradient map in code, toon material, PBR-to-toon conversion, texture posterise. |
| `outline-shader/src/edge-pass.js` | Optional depth + normal edge pass. Not from the video. |
| `outline-shader/demo/demo.js`, `demo/index.html` | Test scene: the video's torus knot, two cubes, a skinned glTF. |
| `outline-shader/render-test.mjs` | Headless render of four variants plus a seek-determinism check. |

Run it:

```bash
cd research/outline-shader
npm i                                   # three 0.187.0, puppeteer 25.17.0
npx puppeteer browsers install chrome   # only if Chrome is not already in ~/.cache/puppeteer
npm test                                # writes out/video.png, hull.png, edges.png, wobble.png
```

### API

```js
import { solidify, addOutlines, createOutlineMaterial, computeOutlineNormals, setOutlineSeed } from './src/solidify.js';
import { makeGradientMap, createToonMaterial, toonify, posterizeTexture } from './src/toon.js';

// The video, exactly
solidify(mesh, { mode: 'object', thickness: 0.02, color: 0x000000 });

// Recommended for the director skill: one shared material for a whole character
toonify(gltf.scene, { steps: 3 });                                    // PBR -> MeshToonMaterial, base colour only
addOutlines(gltf.scene, { mode: 'world', thickness: 0.045, color: 0x1a1020, smoothNormals: true });
```

`createOutlineMaterial` options and the uniforms behind them:

| Option | Uniform or define | Meaning |
| --- | --- | --- |
| `thickness` | `uThickness` | Object units, world units or pixels, by mode. |
| `mode` | `OUTLINE_MODE` 0, 1, 2 | `object`: the video. `world`: offset along the view-space normal after skinning, so node and bone scale do not matter. `screen`: constant pixel width at any distance. |
| `color` | `uColor` | Line colour. Near-black with a hue (`0x1a1020`) reads better than pure black. |
| `resolution` | `uResolution` | Render size, for `screen` mode. |
| `wobble`, `wobbleScale` | `uWobble`, `uWobbleScale` | Width variation from 3D value noise on object position, for a hand-inked line. |
| (via `setOutlineSeed`) | `uSeed` | Re-rolls the wobble. Pass `Math.floor(frame / 2)` for a line boil on twos; it stays a pure function of the frame. |
| `smoothNormals` | `USE_OUTLINE_NORMAL`, attribute `outlineNormal` | Uses normals averaged per position (`computeOutlineNormals`) so hard edges stay closed. |
| `fog` | three's fog uniforms | Lets scene fog tint the line. |

Shader logic (`solidify.js`): the vertex shader is assembled from three's own chunks, so the shell follows whatever the mesh does. In order: `morphinstance_vertex`, `batching_vertex`, take `normal` or `outlineNormal`, `morphnormal_vertex`, `skinbase_vertex`, `skinnormal_vertex`, `defaultnormal_vertex`, `begin_vertex`, `morphtarget_vertex`, then:

```glsl
float width = uThickness * (1.0 + uWobble * (olNoise(position * uWobbleScale + uSeed * 17.31) * 2.0 - 1.0));
// mode object (the video): before skinning, in bind space
transformed += hullNormal * width;
// ... skinning_vertex, project_vertex ...
// mode world: view space is rigid, so this is a true world-unit width
mvPosition.xyz += viewNormal * width;  gl_Position = projectionMatrix * mvPosition;
// mode screen: push in clip space, scaled by w so it survives the perspective divide
vec2 dir = normalize((projectionMatrix * vec4(viewNormal, 0.0)).xy * uResolution);
gl_Position.xy += dir * (2.0 * width / uResolution) * gl_Position.w;
```

One trap worth knowing: `defaultnormal_vertex` negates the normal when the material is `BackSide` (`FLIP_SIDED`), so the shader flips it back before using it.

`solidify()` parents the shell to the mesh. For a `SkinnedMesh` it creates a `SkinnedMesh` bound to the same skeleton; for an `InstancedMesh` it shares the `instanceMatrix` buffer; morph influences are shared by reference. Shells never cast shadows.

### Proof

`npm test` output on this machine:

```
video:  t1=cf4f632b0278 t3=70ce0f7f0ef4 t1again=cf4f632b0278  deterministic=true
hull:   t1=e18233a71462 t3=9d20492fb65a t1again=e18233a71462  deterministic=true
edges:  t1=d213295395d9 t3=7ff56323bca8 t1again=d213295395d9  deterministic=true
wobble: t1=0152d29e0db6 t3=e6b1294453fe t1again=0152d29e0db6  deterministic=true
```

Each frame was opened and inspected:

- `out/video.png`: thin even line on the torus knot with 3-band shading, as in the video; the robot's shell is exploded, which demonstrates the scale limit.
- `out/hull.png`: `world` mode with smoothed normals. Clean heavy outline on the knot and on the dancing skinned robot. The lower cube deliberately uses raw face normals and shows a small gap at its corner; the upper cube uses smoothed normals and is closed.
- `out/edges.png`: hull plus the edge pass. Interior creases on the cubes and robot are now inked.
- `out/wobble.png`: 5 px `screen` mode with wobble 0.6.

The same demo was also rendered through HyperFrames on 5 parallel workers (`_bench/hyperframes`, `npm run render:outline`, 90 frames) and the frame inspected: correct pose and outline.

### When the hull is not enough: the edge pass

`EdgeOutlinePass` (in `edge-pass.js`) is the other standard technique, added because the hull cannot draw lines inside a silhouette. It renders the scene once more with `MeshNormalMaterial` into a target that has a `DepthTexture`, then runs a Roberts cross (two diagonal differences) over linear depth and over view-space normals:

```glsl
float depthEdge  = length(vec2(d1 - d0, d3 - d2)) / max(centreDepth, 1e-3);   // relative, so distance does not blacken
float normalEdge = sqrt(dot(n1 - n0, n1 - n0) + dot(n3 - n2, n3 - n2));
float edge = max(smoothstep(uDepthThreshold, 2.0 * uDepthThreshold, depthEdge),
                 smoothstep(uNormalThreshold, 2.0 * uNormalThreshold, normalEdge));
gl_FragColor = vec4(mix(base.rgb, uColor, edge * uStrength), base.a);
```

Uniforms: `uThickness` (sample offset in pixels), `uDepthThreshold` (default 0.02), `uNormalThreshold` (default 0.45), `uColor`, `uStrength`. Put it right after `RenderPass`. Set `userData.noEdge = true` on things that should not be inked (it already skips hull shells, points, sprites and lines). On low-poly models it inks every facet; raise `uNormalThreshold` or leave those models to the hull alone. It also draws a line where the ground meets the sky.

## WebGLRenderer or WebGPURenderer

Use **`WebGLRenderer` + `EffectComposer`** for this project. All code here is GLSL and was verified on that path, and it also runs on software GL when a host has no GPU.

For reference, r187 has the same technique built in on the node side: `toonOutlinePass(scene, camera, color, thickness, alpha)` from `three/tsl` (`src/nodes/display/ToonOutlinePassNode.js`), used with `WebGPURenderer` and `RenderPipeline`. It was tested here in headless Chrome 157 (`_bench/techniques/webgpu.html`): the backend came up as real WebGPU and it drew outlined toon meshes. It is a viable later move, but it would mean rewriting every custom shader in TSL, and `RenderPipeline` only recently replaced `PostProcessing`, so the API is still moving.

`three/addons/effects/OutlineEffect.js` is also an inverted hull for `WebGLRenderer`, but it wraps `renderer.render()` and does not sit inside an `EffectComposer` chain, so it does not combine with bloom or depth of field.

## Sources

- Transcript and metadata of https://www.youtube.com/watch?v=V5UllFImvoE (auto captions, read in full).
- https://github.com/visionary-3d/stylized-shader-part1 at commit `3f7e18a`: `src/app.js`, `src/render/init.js`, `src/images/textures/*.jpg`.
- three.js r187 source: `src/renderers/shaders/ShaderChunk/defaultnormal_vertex.glsl.js`, `skinnormal_vertex.glsl.js`, `project_vertex.glsl.js`, `gradientmap_pars_fragment.glsl.js`, `lights_toon_pars_fragment.glsl.js`, `src/nodes/display/ToonOutlinePassNode.js`, `examples/jsm/effects/OutlineEffect.js`.
- Test model: RobotExpressive by Tomás Laulhé, modified by Don McCurdy, CC0 1.0, from the three.js r187 examples.
