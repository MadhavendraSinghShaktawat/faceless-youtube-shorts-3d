# Render stack for the director skill

Researched and benchmarked 2026-11-14 on macOS 27 (arm64), Apple M6, 12 cores, 24 GB, Node 24.22.1, ffmpeg 9.0.2, Chrome 157.
Everything below marked "measured" was run on this machine; the projects are in `research/_bench/`.

## Decision

**Use HyperFrames 0.9.41 as the render host, with the 3D written as a plain three.js r187 ES module that exposes `renderAt(t)`.**
Keep the Puppeteer + WebCodecs harness (`_bench/baseline`) as the fast fallback; it runs the same scene module unchanged.

Why HyperFrames over the other two:

1. **Licence.** Apache-2.0 with no conditions. Remotion is free only for individuals, non-profits and for-profit companies of up to 3 employees; anyone else needs a paid company licence. A skill that other people may run cannot assume they qualify.
2. **It does the non-3D half of the job.** Multi-track audio with volume envelopes and ducking, word-level transcription of a supplied voiceover, and DOM/CSS captions are built in and were verified here. The baseline needs all of that written by hand.
3. **Three.js is a first-class case.** The contract is one event: draw from `e.detail.time` inside an `hf-seek` listener, and gate start-up on a `window.__hf.buildReady` promise. That is exactly "every frame is a pure function of time".
4. **Agent tooling.** Plain HTML, plus `lint`, `check`, `snapshot` and `doctor` commands an agent can run to review its own work without a UI.

Speed did not decide it. All three stacks render this content several times faster than real time (table below), so a 40 s video costs 7 to 17 s in any of them.

Remotion is the right pick only if the user is certainly licence-eligible and wants React. It was slightly faster than HyperFrames and equally correct.

## What "Hyperframe" is

It is HeyGen's open-source HTML-to-video framework, `github.com/heygen-com/hyperframes` (npm package `hyperframes`). State on 2026-11-14, read from the GitHub API, the repo and npm:

- Created 2026-03-10, 83.8k stars, 246 open issues, last push 2026-11-13. Description: "Write HTML. Render video. Built for agents."
- Licence Apache-2.0 (`LICENSE` in the repo, and the npm `license` field).
- npm `latest` is 0.9.41 (0.9.42 was already offered by `doctor`). Pre-1.0 and releasing almost daily. Needs Node 22 or newer.
- Renders by driving headless Chrome with Puppeteer and encoding with the system ffmpeg.
- Ships agent skills for Claude Code (`npx hyperframes skills update`), which include a Three.js reference (`skills/hyperframes/references/runtimes.md`, `types/3d.md`).

## Evidence table

| Criterion | Remotion 4.0.543 | HyperFrames 0.9.41 | Baseline: three + Puppeteer 25.17 + WebCodecs |
| --- | --- | --- | --- |
| Three.js stepping | `useCurrentFrame()` drives the scene. `@remotion/three` `<ThreeCanvas>` forces R3F `frameloop="never"` and calls `advance()` once per frame. Plain three in a `<canvas>` + `useLayoutEffect` also works. Both measured, pixel-identical to each other. | `hf-seek` event gives `e.detail.time`; frames may arrive out of order across workers. Measured: all 150 frames match Remotion's frame for frame (41 to 42 dB PSNR, codec noise only). | Your own loop calls `renderAt(i / fps)`. |
| Post-processing | Plain `EffectComposer` works (RenderPass, UnrealBloomPass, OutputPass measured). In R3F you take over rendering with `useFrame(cb, 1)`. | Same `EffectComposer` code, unchanged. Also ran the outline demo (toon + hull outline + skinned glTF). | Same code. |
| Waiting for assets | `delayRender()` / `continueRender()`; `<ThreeCanvas>` holds the render until the canvas exists. Not exercised with a glTF here. | `window.__hf.buildReady["key"] = promise`. Measured with `GLTFLoader.loadAsync` + `renderer.compileAsync`. | `await` before signalling ready. Measured. |
| glTF skeletal seek | `mixer.setTime(t)` (same three code; not run here). | `mixer.setTime(t)` measured over 5 workers, correct frames. | Measured: t=1, t=3, t=1 gives byte-identical pixels. |
| How frames are captured | Parallel tabs in one Chrome Headless Shell (default 6 here), frames handed to its bundled ffmpeg through shared memory. | Parallel Chrome processes ("workers", auto picked 5), `Page.captureScreenshot`, system ffmpeg. On macOS the faster BeginFrame path is not used. | One page. Frames go GPU to `VideoEncoder` (VideoToolbox H.264) to an MP4 muxed in the page. No screenshots. |
| GPU | Needs `--gl=angle`. `--gl=swangle` (software) was 9x slower. | Hardware GPU auto-detected (`--browser-gpu`); software fallback was 5x slower. | `--use-angle=metal`; reported `ANGLE Metal Renderer: Apple M6`. |
| Concurrency with WebGL | Helps up to about 6 to 8 tabs, then gets worse (c=1 8.6 s, c=6 3.3 s, c=12 3.8 s). Each tab builds its own scene. | Helps up to about 5 workers, then gets worse (w=1 8.2 s, auto 4.1 s, w=12 5.8 s). Each worker is a whole Chrome that builds its own scene. | None needed. |
| Audio | `<Audio>` per track, `volume={(f) => ...}` per frame, mixed by Remotion. Measured: 3 tracks, duck to 0.25 landed at -12 dB. | `<audio data-start data-volume data-automation>` per track, effect chains, voiceover "carve" ducking, mixed by HyperFrames. Measured: same result. | Not provided. One `ffmpeg -filter_complex` call after the render (0.5 s). Measured: same result. |
| Captions | `@remotion/captions` + `@remotion/install-whisper-cpp`, rendered as React DOM. | `hyperframes transcribe vo.wav` gives word-level JSON locally (whisper.cpp or Parakeet). Captions are DOM/CSS, with ready-made caption blocks in the registry. Measured: 8 words timed in 2.4 s. | Run whisper.cpp yourself. DOM is not captured by the WebCodecs path, so captions must be drawn on a 2D canvas (done in the bench), or you fall back to screenshots at 22 fps. |
| Licence and cost | Remotion License. Free: individuals, for-profit orgs up to 3 employees, non-profits, evaluation. Otherwise Company License: Creators $25 per seat per month, or Automators $0.01 per render with a $100 per month minimum; Enterprise from $500 per month. Licence text says it "will slightly change" in 5.0. | Apache-2.0, free for any use. Cloud rendering and HeyGen voices are optional paid services; local rendering uses none of them. | three MIT, Puppeteer Apache-2.0, esbuild MIT, mediabunny MPL-2.0, ffmpeg used as a tool. Free. |
| Agent authoring | React + TypeScript project, 1.1 GB `node_modules`. Rules to remember: no `useFrame` for animation, `layout="none"` on `<Sequence>` inside the canvas, `--gl=angle`. Has official agent skills. | One HTML file plus a JS bundle, 140 MB install. `lint`, `check`, `snapshot --at 1,3,1`, `doctor` give the agent feedback loops. Skills ship for Claude Code. | About 150 lines of harness the skill must own. Total control, no framework rules, no feedback tooling. |
| Risk | Licence eligibility; heavier project. | Pre-1.0, very fast release cadence, some docs describe things the published version lacks (see gotchas). Pin the version. | Everything is yours to maintain. |

## Benchmark

**Test.** One shared scene module, `research/_bench/shared/scene.js`, imported unchanged by all three projects: 1080x1920, 30 fps, 5 s (150 frames), 50 `MeshToonMaterial` meshes with gradient maps, an inverted-hull outline on each, a ground plane, one shadow-casting directional light (2048 shadow map), fog, `EffectComposer` with a 4x MSAA half-float target, `UnrealBloomPass`, `OutputPass`, an orbiting camera, and a word-by-word caption overlay.

**Method.** Wall-clock from process start to finished MP4, including bundling and browser start-up. Median of 3 runs unless noted.

### 5 seconds, 150 frames

| Stack and flags | Wall-clock | Frames per second |
| --- | --- | --- |
| Baseline, WebCodecs in page | 1.35 s | 111 |
| Baseline, WebCodecs + ffmpeg audio mux | 1.84 s | 82 |
| Remotion, `--gl=angle --concurrency=8 --hardware-acceleration=if-possible` | 2.95 s | 51 |
| Remotion, `--gl=angle` (default concurrency 6) | 3.42 s | 44 |
| Remotion, `<ThreeCanvas>` (R3F) variant, same flags | 3.47 s (1 run) | 43 |
| HyperFrames, `--gpu` (auto 5 workers) | 3.87 s | 39 |
| HyperFrames, defaults | 4.12 s | 36 |
| HyperFrames, `--gpu`, with 3 audio tracks mixed | 4.7 to 5.0 s (2 runs) | 31 |
| Remotion, with 3 audio tracks mixed | 5.26 s (1 run) | 29 |
| Baseline, `page.screenshot` JPEG piped to ffmpeg | 6.8 s (1 run) | 22 |
| Baseline, `page.screenshot` PNG piped to ffmpeg | 10.7 s (1 run) | 14 |
| HyperFrames, `--no-browser-gpu` (software GL) | 20.4 s (1 run) | 7 |
| Remotion, `--gl=swangle` (software GL) | 31.5 s (1 run) | 5 |
| Baseline, raw RGBA frames POSTed to ffmpeg | 34 s (2 runs) | 4 |

Drawing alone, with no capture, took 0.65 s for 150 frames (231 fps), so capture and encoding are the whole cost in every stack.

### 40 seconds, 1200 frames (the real target length, one run each)

| Stack and flags | Wall-clock | Frames per second |
| --- | --- | --- |
| Baseline, WebCodecs | 6.65 s | 180 |
| Remotion, `--concurrency=8 --hardware-acceleration=if-possible` | 9.2 s | 131 |
| Remotion, defaults + `--gl=angle` | 12.5 s | 96 |
| HyperFrames, `--gpu` | 12.9 s | 93 |
| HyperFrames, defaults | 16.8 s | 71 |
| Baseline, screenshot JPEG | 50.6 s | 24 |

A heavier scene (30k instanced grass blades, particles, god rays, `BokehPass` depth of field, bloom, outlines; see `threejs-techniques.md`) drew in 4.2 ms per frame on this GPU, and 33 ms with 8-sample motion blur. So the look itself does not change the ranking; motion blur by accumulation is the only feature that multiplies render time.

### Output validity

Every output was probed with ffprobe and three frames were extracted and looked at.

| Output | ffprobe | Looked at |
| --- | --- | --- |
| `_bench/baseline/out/webcodecs.mp4` | h264 High, 1080x1920, 30/1, yuv420p, 150 frames, 5.000 s, 10.7 Mb/s | Toon bands, black outlines, shadows, bloom halo, caption present |
| `_bench/remotion/out/plain.mp4` | h264, 1080x1920, 30/1, yuv420p, 150 frames, 7.2 Mb/s | Same picture |
| `_bench/remotion/out/r3f.mp4` | same | PSNR against `plain.mp4` is infinite: identical |
| `_bench/hyperframes/out/hf.mp4` | h264, 1080x1920, 30/1, yuv420p, 150 frames, 10.2 Mb/s | Same picture |
| `_bench/hyperframes/out/hf_audio.mp4` | plus AAC 48 kHz stereo, 5.000 s | Music -33.2 dB before the voice, -43.0 dB while ducked, -33.4 dB after |

Cross-stack frame accuracy: per-frame PSNR between HyperFrames (5 workers) and Remotion (6 tabs) over the picture area was 41.3 dB minimum, 42.1 dB mean, across all 150 frames. A one-frame offset drops it to 19.6 dB, so no frame was duplicated, dropped or reordered.

## Recommended versions and install

```bash
# in the video project folder
npm init -y
npm i hyperframes@0.9.41 three@0.187.0 esbuild@^0.25
npx hyperframes doctor          # checks Chrome, ffmpeg, whisper-cpp
export HYPERFRAMES_NO_TELEMETRY=1
```

Also needed on the machine: `ffmpeg` and `ffprobe` on PATH, and `brew install whisper-cpp` for local transcription (present here as `/opt/homebrew/bin/whisper-cli`).

Pin `hyperframes` exactly. Upgrade deliberately and re-run a known render when you do.

## Project shape

```
index.html            one root composition: <canvas>, caption <div>, <audio> tags
src/scene.js          three.js; exports createScene({canvas}) -> { ready, renderAt(t) }
src/entry.js          glue: buildReady + hf-seek
bundle.js             esbuild output of src/entry.js (IIFE)
assets/               voiceover, music, sfx, glb, textures
```

Glue (`_bench/hyperframes/src/entry.js` is the working copy):

```js
let scene;
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady['scene'] = (async () => {
  scene = createScene({ canvas: document.getElementById('gl'), preserveDrawingBuffer: true });
  await scene.ready;                 // glTF loads, renderer.compileAsync(scene, camera)
  scene.renderAt(0);                 // throwaway first frame
  const gl = scene.renderer.getContext();
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));  // force the GPU to finish
})();
window.addEventListener('hf-seek', (e) => scene && scene.renderAt(e.detail.time));
```

Root element:

```html
<div id="root" data-composition-id="main" data-start="0" data-duration="38" data-fps="30"
     data-width="1080" data-height="1920" data-no-timeline>
  <canvas id="gl" class="clip" data-start="0" data-duration="38" width="1080" height="1920"></canvas>
  <div id="caption" class="clip" data-start="0" data-duration="38"></div>
  <audio id="vo" src="assets/vo.wav" data-start="0.6"></audio>
  <audio id="music" src="assets/music.wav" data-start="0" data-duration="38" data-volume="0.8" data-fade-out="0.3"
         data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":1},{"t":0.4,"v":1},{"t":0.6,"v":0.25},{"t":3.2,"v":0.25},{"t":3.6,"v":1}]}]}'></audio>
  <audio id="sfx1" src="assets/whoosh.wav" data-start="3.8" data-volume="0.9"></audio>
</div>
<script src="./bundle.js"></script>
```

A volume lane on a clip is timed from that clip's own start, and holds its first value backwards, so give a bed an explicit `t: 0` point.

## Commands

Build and render (best measured flags):

```bash
NODE_PATH=./node_modules npx esbuild src/entry.js --bundle --format=iife --outfile=bundle.js
npx hyperframes lint
HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes render --gpu --output out/final.mp4
```

- `--gpu` is hardware H.264 encoding (VideoToolbox) in ffmpeg. It was the only flag that made HyperFrames faster here (16.8 s to 12.9 s at 40 s).
- Leave `--workers` on auto. 1, 2, 8 and 12 were all slower than auto (5).
- `--quality draft` for review renders (3.65 s against 4.1 s).
- Review stills without a full render: `npx hyperframes snapshot --at 1,3,1 --no-end` (the two stills at 1 s should be identical).
- Word timings from the supplied voiceover: `npx hyperframes transcribe assets/vo.wav --model small.en` writes `transcript.json` as `[{text, start, end, id}]`.

Fallback harness (same scene module, no framework):

```bash
cd research/_bench/baseline && npm i && npx puppeteer browsers install chrome
npm run build && node render.mjs webcodecs          # 1.35 s for 150 frames
./mux-audio.sh out/webcodecs.mp4 out/final.mp4      # voice + ducked music + sfx, video stream-copied
```

Remotion, for reference (best measured flags):

```bash
npx remotion render src/index.ts BenchPlain out/plain.mp4 --gl=angle --concurrency=8 --hardware-acceleration=if-possible
```

## Gotchas hit

HyperFrames:

- **One root composition.** A second HTML file with `data-composition-id` in the project root fails lint (`multiple_root_compositions`). Put extra compositions in `compositions/` and render them with `-c compositions/name.html`; their relative URLs then need `../`.
- **`data-no-timeline` is required** on a root that registers no GSAP timeline, or every render waits out a 45 s readiness timeout. A Three-only composition also needs an explicit `data-duration`.
- **The clock is frozen during a render.** `Date.now()` and `performance.now()` return the seek time and `requestAnimationFrame` callbacks are held. `THREE.Clock`, `setAnimationLoop` and anything that waits a frame will hang or stall. Await promises (`compileAsync`, `loadAsync`) instead.
- **Every worker loads the whole scene.** Start-up cost (glTF parse, shader compile) is paid 5 times. Keep assets small, or pass `--workers 1` or `2` for asset-heavy scenes.
- **Bare `three` imports need bundling or a pinned CDN URL.** The bench bundles with esbuild. HyperFrames' own examples import three from jsdelivr, which makes renders depend on the network.
- **Telemetry is on by default.** `HYPERFRAMES_NO_TELEMETRY=1` (or `DO_NOT_TRACK=1`) turns it off; `npx hyperframes telemetry status` confirmed "disabled".
- **Docs run ahead of the release.** The Three.js docs point at an example called `path-traced-3d`; `init --example path-traced-3d` fails on 0.9.41 ("not found in registry"), and `--example product-turntable` fails with "installed but missing index.html". `--example blank --resolution portrait` works.
- **Only one local render at a time per user account** by default; a second waits. Set `HYPERFRAMES_RENDER_LOCK=off` to run side by side.
- **Its motion blur is for DOM elements**, not for pixels inside a WebGL canvas. Do canvas motion blur in three (see `threejs-techniques.md`).
- The MP4 carries `hyperframes_renderer` / `hyperframes_version` metadata tags. `ffmpeg -i in.mp4 -map_metadata -1 -c copy out.mp4` removes them.

Remotion:

- Without `--gl=angle` (or `Config.setChromiumOpenGlRenderer('angle')`) three.js does not get the GPU. The config file does not apply to the Node API; pass `chromiumOptions: { gl: 'angle' }` there.
- Remotion's docs warn that `angle` leaks memory on long renders and suggest rendering in parts. Not hit at 1200 frames.
- Inside `<ThreeCanvas>`: no `useFrame` for animation, and `<Sequence layout="none">`.
- Importing a module from outside the project needs `Config.overrideWebpackConfig` to add the project's `node_modules` to `resolve.modules`.
- `node_modules` was 1.1 GB, against 140 MB for HyperFrames and 77 MB for the baseline.

three.js r187 and Chrome:

- `THREE.PCFSoftShadowMap` has been removed; r187 warns and falls back. Use `THREE.PCFShadowMap`.
- With `EffectComposer`, create the renderer with `antialias: false` and put MSAA on the composer target: `new WebGLRenderTarget(w, h, { type: HalfFloatType, samples: 4 })`.
- Set `preserveDrawingBuffer: true` when the host captures by screenshot (HyperFrames, Remotion). HyperFrames' own Three example does the same. The WebCodecs path does not need it.
- Toon shading plus shadow maps gives a ragged terminator; `light.shadow.normalBias = 0.08` to `0.12` cleaned it up here.
- `VideoEncoder` exists only in a secure context. Serve the page from `http://127.0.0.1`, not `file://` or `about:blank`.
- npm 11 did not run `postinstall` scripts for puppeteer and esbuild ("not yet covered by allowScripts"). Chrome was already in `~/.cache/puppeteer` here; on a clean machine run `npx puppeteer browsers install chrome`.
- Software GL (SwiftShader) is 5x to 9x slower. A render host without a GPU needs a different time budget.

## The bench projects

| Folder | State | To run |
| --- | --- | --- |
| `_bench/hyperframes/` (winner) | `node_modules` kept, runnable | `npm run render` (5 s scene with 3 audio tracks), `npm run render:outline` (skinned glTF + outlines). Reinstall with `npm i` if `node_modules` is ever removed. |
| `_bench/baseline/` | `node_modules` deleted | `npm i && npx puppeteer browsers install chrome && npm run render` |
| `_bench/remotion/` | `node_modules` deleted (was 1.1 GB) | `npm i && npx remotion render src/index.ts BenchPlain out/plain.mp4 --gl=angle` |
| `_bench/shared/` | scene module and test audio | imported by all three |
| `_bench/techniques/` | smoke test for `threejs-techniques.md` | `node test.mjs` (uses `research/outline-shader/node_modules`) |

## Sources

- HyperFrames repo at commit `f01209d` (2026-11-13): `LICENSE`, `docs/guides/rendering.mdx`, `docs/packages/cli.mdx`, `docs/reference/html-schema.mdx`, `docs/reference/audio-effects.mdx`, `docs/concepts/frame-adapters.mdx`, `docs/guides/motion-blur.mdx`, `skills/hyperframes/references/runtimes.md`, `path-tracing.md`, `types/3d.md`. https://github.com/heygen-com/hyperframes
- Remotion: `node_modules/remotion/LICENSE.md` (4.0.543), https://www.remotion.dev/docs/license/pricing , https://www.remotion.dev/docs/license/telemetry , https://www.remotion.dev/docs/gl-options , https://www.remotion.dev/docs/gpu , https://www.remotion.dev/docs/three , https://www.remotion.dev/docs/three-canvas , https://www.remotion.dev/docs/audio/volume , and the source of `@remotion/three/dist/cjs/ThreeCanvas.js`.
- npm registry versions on 2026-11-14: remotion 4.0.543, @remotion/three 4.0.543, hyperframes 0.9.41, three 0.187.0, @react-three/fiber 9.8.2, react 19.3.1, puppeteer 25.17.0, mediabunny 1.66.0.
