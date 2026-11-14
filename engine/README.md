# engine

Renders one video folder to `out/final.mp4`: 1080x1920, 30 fps, H.264 + AAC. HyperFrames 0.9.41 drives headless Chrome; the picture is a three.js 0.187.0 scene that is a pure function of `t`; audio is mixed and mastered by ffmpeg.

Needs Node 22+, `ffmpeg` and `ffprobe` on PATH. HyperFrames downloads its own Chrome (193 MB) on the first render and a whisper model (488 MB) on the first transcription.

## Commands

```bash
(cd engine && npm ci)                                # once; 140 MB
node engine/render.mjs videos/<slug>                 # full render -> videos/<slug>/out/final.mp4 + out/report.json
node engine/render.mjs videos/<slug> --draft         # faster encode, same frames
node engine/render.mjs videos/<slug> --snap 1.0,3.5  # stills only -> out/snaps/at-1s.png, at-3.5s.png
node engine/render.mjs videos/<slug> --workers 2     # for asset-heavy scenes (every worker loads the whole scene)
tools/cleanup.sh [--dry-run] [--deep] [videos/<slug>]
```

Exit code 0 = all checks passed, 2 = rendered but a check failed, 1 = lint or render error.

What a run does: evaluate `video.js` in Node; transcribe `audio/vo.*` to `words.json` if a voiceover exists and `words.json` does not; build caption cards; lint; bundle; `hyperframes lint`; `hyperframes render --gpu`; mix and master audio; validate.

Validation checks: h264, 1080x1920, 30/1 fps, yuv420p, frame count, duration, no two consecutive frames identical (frame MD5), and with audio: AAC 48 kHz stereo, -14 LUFS +-0.5, true peak <= -1 dBTP, end 0.1 to 0.4 s after the last word.

Lint errors (stop the run): `Math.random`, `Date.now`, `performance.now`, `requestAnimationFrame`, timers, `THREE.Clock`, `mixer.update` in the video folder's JS; unknown set, actor, pose, expression or prop; a shot under 6 frames; missing audio files. Warnings: camera key with no creep, hard cut, dissolve outside 4 to 12 frames, caption over 3 words, wrong tail length.

### Measured on this machine (Apple M6, 2026-11-14)

| Run | Time |
| --- | --- |
| Demo, 8 s / 240 frames, full render | 6.4 to 9.6 s total (render 5.3 to 8.4 s) |
| 36 s / 1080 frames (demo shots stretched) | 16.9 s total (render 12.8 s = 84 fps, validate 3.7 s) |
| `--snap` with 2 to 4 stills | 1.6 to 4 s |
| First render after `cleanup.sh --deep` (Chrome download) | 19 s for the demo |
| Transcription, 2.5 s clip | 5.7 s with the model cached, 43 s when it downloads |
| Audio mix + master | 0.4 s |

## A video is one folder

```
videos/<slug>/
  video.js      required. export default defineVideo({...})
  words.json    word timings [{ text, start, end }]. Written by transcription if missing; edit it by hand to fix words. Never overwritten.
  story.json    optional, not read by the engine
  assets/       textures, GLBs. Copied next to the page: load them as 'assets/name.ext'
  audio/        vo.wav|mp3|m4a|... (user supplied), music, sfx
  out/          final.mp4, report.json, snaps/, review/
  .build/       temporary (bundle, index.html, silent video, mix)
```

`video.js` imports the kit from the bare name `acs` (resolved by the bundler; no `node_modules` in the video folder):

```js
import { defineVideo, Set3D, world, fx, orbit, walk, talkWindows, THREE } from 'acs';
```

Rules for `video.js`:

- **All times are video seconds**, everywhere (shots, camera keys, tracks, talk windows, fx, sfx).
- The module is also evaluated in Node, so do no DOM, canvas or texture work at top level. Put it inside the `sets`, `props` builders (they run in the page only).
- Everything must be a function of `t`. For randomness use `mulberry32(seed)` or `hash(a, b, c)`.

### Schema

```js
export default defineVideo({
  duration: 8,            // seconds. Omit when there is a voiceover: duration = last word end + audio.tail
  fps: 30,                // default 30
  toneMapping: 'none',    // 'none' (default, palette-exact) | 'neutral'
  shutter: 0.6,           // motion-blur shutter fraction (only used by camera keys with blur)
  workers: undefined,     // passed to hyperframes --workers

  cast:  { name: { /* Character options */ } },
  props: { name: (ctx) => Object3D },          // hand props / movable props, built once
  sets:  { name: (ctx) => Set3D },             // ctx = { THREE, width, height, fps, duration, rng(name) }
  shots: [ /* Shot */ ],
  fx:    [ fx.flash({ t: 2.5 }) ],             // full-frame cues
  captions: { weight: 800, sizePct: 6.2, strokePct: 0.75, yPct: 70, maxWords: 3, maxChars: 13 },
  audio: {
    vo: 'audio/vo.wav',          // default: first audio/vo.* found. false = ignore
    voOffset: 0,                 // seconds the VO starts into the video (also shifts words.json times)
    tail: 0.3,                   // seconds after the last word (0.1 to 0.4)
    whisperModel: 'small.en',
    music: { file: 'audio/music.mp3', underDb: 23, start: 0, sections: [{ t: 20, gainDb: -12 }, { t: 29, gainDb: 0 }] },
    sfx: [{ t: 2.5, file: 'audio/boom.wav', peakDb: -12 }, { t: 4.1, file: 'audio/pop.wav', peakDb: -24 }],
  },
});
```

**Shot**

```js
{
  id: 'cell',
  set: 'cell',                 // key of sets
  start: 0,                    // the shot runs until the next shot's start
  transition: { type: 'dissolve', frames: 6 },   // join INTO this shot. Default. 'cut' = hard cut
  camera: [ /* camera keys */ ],                 // or a cameraPath(...)
  cameraDefaults: { push: 0.035, arc: 1.5, fov: 60 },
  actors: {
    warden: {
      at: [x, y, z], face: 12,                   // face: yaw in degrees, 0 = looking down +Z, 90 = +X
      scale: 1, tint: '#fff', hold: { R: 'swatch' },   // hold: prop names in 'L' | 'R' | 'head'
      track: [                                   // stepped: each key keeps everything it does not mention
        { t: 0,   pose: 'holdLow', expr: 'bored' },
        { t: 0.5, pose: 'holdUp' },
        { t: 1.1, pose: ['holdUp', { headTurn: -14 }], expr: 'skeptical' },
        { t: 3.6, pose: 'walkA', at: [0, 0, -1], face: 80, hold: {} },
      ],
      talk: [[0.1, 1.8], [2.55, 3.1]],           // mouth swaps every 2-3 frames inside these windows
    },
  },
  props: { crate: { at: [0, 0.25, 1], rot: [0, 20, 0], scale: 1 } },  // free props; may be a stepped track [{ t, at, rot }]
  dof: { focus: 'warden' | [x,y,z] | metres, aperture: 0.0009, maxblur: 0.004 },   // inserts and close-ups only
  grade: { vignette: 0.5 },    // overrides the set's grade for this shot
  bloom: { strength: 0.9 },    // overrides the set's bloom
  update: ({ t, frame, local, set, cast, props, camera, THREE }) => {},   // every frame, after actors and camera are set
}
```

Track key fields: `pose`, `expr`, `mouth` (forces a shape), `at`, `face`, `rot` ([x,y,z] degrees, e.g. lying down), `scale`, `look` ([x,y] -1..1, eye direction), `hold`, `tint`, `visible`.

Shot joins: a dissolve of N frames is centred on `start` and gives N mixed frames with weights k/(N+1). Both shots are rendered to HDR targets with their own cameras still moving, graded, blended, then bloomed once. Start an incoming shot's tracks slightly before its `start` (the demo uses 0.2 s) so poses exist during the first half of the dissolve.

## Two clocks

- **World clock, every frame:** camera path, `set.onUpdate`, fx, grass, dust, `shot.update`.
- **Stepped clock, per frame index:** actor tracks. A key takes effect on frame `round(t * fps)` in one frame; nothing is interpolated. Blinks (2 frames, about every 2.8 s) and talk mouths are automatic.

## Camera (`camera.js`)

```js
orbit({ t: 0, target: [0, 1.4, 0], dist: 6, yaw: 24, pitch: 4, fov: 58, push: 0.045, arc: -2.2 })
// -> { pos, look, ...rest }. yaw 0 = camera on +Z looking down -Z; pitch > 0 = camera above the target
{ t: 1.2, frames: 12, pos: [x,y,z], look: [x,y,z], ease: 'outCubic', push: 0.03, arc: 1.6, rise: 0, roll: 0, blur: 0 }
```

| Key field | Default | Meaning |
| --- | --- | --- |
| `t` | 0 | when the move to this framing starts (first key: the opening framing) |
| `frames` | 14 | length of the move. 10 to 18 = fast re-frame |
| `ease` | `outCubic` | `linear, inQuad, outQuad, inOutQuad, inCubic, outCubic, inOutCubic, outQuart, outExpo, outBack, step` |
| `push` | 0.035 | creep: fraction of the camera-to-target distance closed per second |
| `arc` | 1.5 | creep: degrees per second around the target (sign = direction) |
| `rise` | 0 | creep: vertical drift, units per second |
| `fov`, `roll` | 60, 0 | degrees |
| `blur` | 0 | motion-blur samples during the move. 6 shows strobing on a whip pan; use 10 to 12. Costs that many renders per frame |

The creep runs from before the first frame and continues under every move, so the camera is never still. Whip pan: `frames: 12-18, ease: 'inOutCubic', blur: 12`. `cameraPath(keys, defaults)` returns `{ keys, at(t, fps), apply(camera, t, fps) }` if you need the pose yourself. Also exported: `ease`, `lerp`, `clamp01`.

## Characters (`character.js`, `poses.js`, `faces.js`)

Cast entry options (all optional):

```js
warden: {
  size: 0.5,            // world units per head diameter; the figure is about 3.6 heads tall
  skin: '#fbfaf5', ink: '#2c1821', outline: 0.048,     // outline as a fraction of the head diameter
  body: { color: '#f6f3ee', pattern: 'tie', accent: '#8a5326', accent2: '#e0a55a', width: 0.6, height: 1.08, depth: 0.6 },
  hair: { style: 'cap', color: '#6b4226' },            // cap | bowl | bun | long | none
  hat:  { style: 'beanie', color: '#e2ad3b', band: '#c9962c' },   // beanie | helmet | hardhat | tophat | cap | crown | cone
  expr: 'bored',        // default expression
}
```

Body patterns: `plain`, `tie`, `stripes` (`count`), `buttons`, `grid`, `sash`, `belt`, `apron`, or a function `(g, w, h) => {}` drawing on a 512x512 canvas that wraps the torso (x = w/2 is the chest centre; the straight part is y 0.33h to 0.67h). `width: 1.1` gives the heavy variant.

How it is built: unlit sphere head and capsule torso with an inverted-hull outline in world units (it grows in close-ups), unlit ink tubes for limbs, ball hands, face drawn on a canvas and shown on a camera-facing decal that slides and narrows with the head turn. Every mesh casts shadows; nothing on the character receives light, only `charTint` / `tint`.

**Poses** (`poseNames()`): `stand idle holdUp holdOut holdLow point pointFwd pointUp wave1 wave2 think facepalm salute armsUp cheer shrug hips crossed shock cower push carry beg walkA walkB runA runB sit sitSlump crouch kneel jump fall squash stretch`. One-arm poses use the character's right arm; `['mirror', 'holdUp']` swaps sides.

A pose reference is a name, an object, `[name, overrides]`, or `['mirror', ref]`. Pose keys:

```js
definePose('lean', { armL: [a1, f1, a2, f2], armR: [...], legL: [...], legR: [...],
  lean: 0, tilt: 0, twist: 0, headTurn: 0, headNod: 0, headTilt: 0, dy: 0, ground: true, sx: 1, sy: 1 });
```

Limb angles are absolute per segment, in degrees: `a` in the frontal plane from straight down (90 = horizontal away from the body, 180 = up, negative = across the body), `f` forward tilt. L / R are the character's own. Feet are planted automatically unless `ground: false`.

```js
walk({ from: [x,y,z], to: [x,y,z], t0: 3.8, t1: 5.0, every: 5, run: false, end: 'stand' })  // -> track keys, stepped positions
talkWindows(words, from, to, gap = 0.22)   // word timings -> [[t0, t1], ...] for `talk`
```

**Expressions** (`expressionNames()`): `neutral bored angry furious sad worried surprised happy excited smug suspicious skeptical closed dead`. `defineExpression(name, { eye, brow: [angleL, angleR, lift] | null, mouth })`, eye = `dot | half | wide | closed | happy | squint | x`.

**Mouths**: `flat smile frown o open grin teeth smirk none`.

Direct use (rare): `new Character(opts)` has `.root`, `.setState(state)`, `.applyPose(ref)`, `.attach('R', object)`, `.setTint(color)`, `.faceCamera(camera)`, `.headWorld()`.

## World (`world.*`)

```js
const set = new Set3D({
  background: '#b01c78',
  fog: { color: '#d8349a', density: 0.018 },          // or { color, near, far }
  grade: { tint: '#fff', lift: 0, gain: 1, saturation: 1, contrast: 1, vignette: 0.2, vignetteColor: '#000', edgeBlur: 0 },
  bloom: { strength: 0.6, radius: 0.5, threshold: 1.0 },
  charTint: '#fff3f8',
  godrays: { sun: [-30, 34, -60], color: '#fff3cf', exposure: 0.2, radius: 4 },   // screen-space sun shafts, exteriors
});
set.add(objectOrFx, 'optionalName');   set.get('name');   set.onUpdate((t, frame) => {});   set.wait(promise);
```

`vignette` is how much the corners darken (0.2 = to 80 %); `edgeBlur` is a corner blur radius in pixels (the one-cart look).

Lights are in **albedo units**: a toon surface shows `albedo * (ambient + key * ramp)`, ramp = 1.0 / 0.72 / 0.42. Keep `ambient + key <= 1.0` or pale surfaces cross the bloom threshold.

| Helper | Example |
| --- | --- |
| `sun` | `world.sun({ from: [-9, 12, 7], to: [0, 0, 0], color: '#fff3dc', intensity: 0.55, area: 9 })` directional key with shadows |
| `spot` | `world.spot({ from: [0, 3.9, 0], to: [0, 0, 0], intensity: 0.7, angle: 50, penumbra: 0.5 })` |
| `windowLight` | `world.windowLight({ window: win, dir, color: '#fff2e6', intensity: 0.3 })` projects the barred window as a light patch and casts character shadows in it |
| `ambient` | `world.ambient({ sky: '#fff', ground: '#ffb3dc', intensity: 0.8 })` the colour of every shadow |
| `toon`, `flat`, `glow` | `world.toon({ color, map })`, `world.flat({ map })` unlit, `world.glow({ color: '#ffd27a', intensity: 3 })` blooms |
| `paintedTexture` | `world.paintedTexture({ base: '#4fae3c', count: 500, seed: 8, repeat: [1, 14] })` brush strokes |
| `brickTexture` | `world.brickTexture({ base: '#e926a1', cols: 2, rows: 4, jitter: 0.025, line: 7 })` |
| `plankTexture`, `tileTexture`, `rockTexture` | `world.plankTexture({ base: '#8c4e1d', planks: 4 })`, `world.tileTexture({ base: '#78d5e8', n: 4 })`, `world.rockTexture({ base: '#92571f', cracks: 10 })` |
| `drawnTexture` | `world.drawnTexture(256, 320, (g, w, h) => { g.fillText('P-618', w / 2, h - 28); })` signs, notes |
| `loadTexture` | `world.loadTexture('assets/tex.jpg', { set, repeat: [2, 2] })` |
| `loadGLB` | `world.loadGLB('assets/barrel.glb', { set, scale: 1, toon: true, outline: false, outlineWidth: 0.02 })` returns a holder group at once; `holder.userData.ready` resolves to `{ scene, animations, mixer }`; animate with `mixer.setTime(t)` |
| `outlineProp` | `world.outlineProp(group, { width: 0.014 })` ink outline opt-in for props |
| `box`, `quad` | `world.box({ size: [1, 0.2, 2], at: [x, y, z], rot, color })`, `world.quad({ size: [2.6, 60], at, rot: [-Math.PI / 2, 0, 0], material })` |
| `room` | `world.room({ w: 7, h: 4.4, d: 7, wall: { map, tile: 2.2 }, floor: { map, tile: 3 }, ceiling: { color }, open: ['front'] })` walls: back (-Z), front, left (-X), right; origin = floor centre |
| `barredWindow` | `world.barredWindow({ w: 2, h: 1.15, bars: 5, cross: 1, halo: 0.55 })` place it 0.07+ in front of the wall |
| `ground`, `sky`, `hills`, `grass` | `world.ground({ radius: 80, map, tile: 6 })`, `world.sky({ top, bottom, clouds: 36 })`, `world.hills({ count: 11, radius: 46, color, height: 7 })`, `world.grass({ count: 42000, area: [26, 30], center: [0, -6], height: 0.46, where: (x, z) => Math.abs(x) > 1.35 })` |

No outlines on the environment: nothing in a set is outlined unless you call `outlineProp` or `loadGLB(..., { outline: true })`.

## FX (`fx.*`)

Each returns `{ object, update }`; pass it to `set.add`.

| Helper | Example |
| --- | --- |
| `lightShaft` | `fx.lightShaft({ window: win, dir: [-0.22, -0.6, 0.77], length: 5.6, color: '#ffe9f4', opacity: 0.26, spread: 1.35 })` striped by the bars |
| `lightCone` | `fx.lightCone({ at: [0, 3.9, 0], length: 3.9, radius: 2.6, color: '#9e8a67', opacity: 0.4 })` |
| `dust` | `fx.dust({ center: [0.4, 1.7, -1.2], size: [2.6, 2.8, 4.2], count: 60, mote: 0.03 })` |
| `burst` | `fx.burst({ at, t0: 2.5, count: 46, speed: 3.2, gravity: 7, life: 0.9, dir: [0, 0.3, 1], cone: 0.8 })` |
| `cracks` | `fx.cracks({ at, rot, size: 2.2, t0: 2.5, frames: 8, color: '#5d0a3c', glow: 0 })` grows over 8 frames; `glow: 3` + red = emissive veins |
| `ring` | `fx.ring({ at: [0, 0.03, 1], t0: 1.0, frames: 6, r1: 2 })` |
| `flash` | `fx.flash({ t: 2.5, frames: 4, strength: 0.55, bloom: 0.6, color: '#fff0fa' })` goes in `video.fx`: even lift after bloom plus a 2-frame bloom spike |

**Bloom** works on linear HDR with threshold 1.0. White heads (0.955) and lit walls stay under it; things glow because they are above 1: `world.glow`, light shafts over bright walls, dust, bursts. The references' "threshold 0.85" was read off display pixels; 1.0 linear is the equivalent here. A large surface above 1 whites out whatever is in front of it, which is why the window pane sits at 1.0 with a separate halo.

## Captions (`captions.js`)

Poppins ExtraBold (bundled, OFL, `engine/assets/fonts/`), white, round black stroke 0.75 % of the frame width, soft shadow, one centred line at 70 % of the height, font-size 6.2 % of the width. One word per card; a short function word pulls the next word onto its card, up to 3 words and 13 characters. Cards swap on a single frame and hold until the next card; a silence over 0.45 s clears the caption. The first card is on frame 0 if its word starts within 0.3 s; the last card holds to the end. `captions: { weight: 900 }` switches to Poppins Black.

Exports: `buildCards(words, opts)`, `captionAtFrame(cards, f)`, `cardStats(cards)`, `captionCss(opts)`.

## Audio (`lib/audio.mjs`)

The voiceover is always supplied by the user. Nothing synthesises speech.

A final ffmpeg pass is used instead of HyperFrames' mixer: the mixer sums tracks at the volumes given and has no loudness target (its bench mix measured -17.4 LUFS). The pass measures and sets each track, then masters:

- VO: mono to centre, linear gain to -14.5 LUFS.
- Music: linear gain to `underDb` (default 23) below the VO, looped to length, **no ducking**. `sections` are fixed level steps with 0.15 s ramps.
- SFX: each cue at `t`, level by `peakDb` (target peak in dBFS; hero hits -9 to -15, support -21 to -30) or raw `gainDb`.
- Master: linear gain to -14 LUFS, 4x-oversampled limiter, re-measured and corrected until both targets hold; cut hard at the video end, no fade.

Measured with the bench files (`research/_bench/shared/audio`): VO -13.3 to -14.5 LUFS, music -29.2 to -37.5 LUFS, SFX peaks -12 and -24 dBFS, `final.mp4` at -14.0 LUFS, -2.7 dBTP. With SFX pushed to +3 dBFS peak the loop converged in 2 passes at -14.1 LUFS, -1.8 dBTP.

With no audio at all the file has no audio stream.

## Other exports

`mulberry32(seed)`, `hash(a, b, c)`, `seedOf(string)`; `solidify`, `addOutlines`, `createOutlineMaterial`, `computeOutlineNormals`, `setOutlineSeed`; `makeGradientMap`, `createToonMaterial`, `toonify`, `posterizeTexture`; `buildTimeline`, `trackAt`, `windowAt`, `frameOf`; `createStage` (used by the runtime); `EdgeOutlinePass` (copied from the research, exported, not wired into the stage).

## Known limits

- **Hands do not rotate and have no fingers.** A held prop stays upright; offset it inside its own group.
- **No walk interpolation, no IK.** Feet are planted by lifting the hips only; sitting needs a seat of the right height (0.84 head units = 0.42 at the default size).
- **The face is a flat decal.** It slides and narrows with the head turn and disappears when the head faces away; past about 70 degrees it reads as a profile only loosely.
- **Arms pass through the torso and head** if a pose puts them there. Check new poses with `--snap`.
- **Characters are unlit.** They take `charTint` but no light or shadow on themselves (the references show a faint shading gradient on the head).
- **Depth of field ignores the face decal, points and light shafts** when it builds depth; a large shaft near the focus edge can look sharp.
- **Motion blur** is sub-frame accumulation: correct, but each sample is a full render.
- **One bloom for the frame.** During a dissolve the two shots' bloom settings are blended by weight.
- **God rays** are screen-space: they only show when the sun position is in front of the camera.
- **Not built:** push-through transitions (camera through a wall into the next set), cloth, rain, crowds, sprite-sheet props, music section detection. A push-through can be done by hand inside one set.
- **Not exercised in a render:** `EdgeOutlinePass`, `toneMapping: 'neutral'`, GLB animation playback, `music.start`.
- HyperFrames is pre-1.0 and pinned. It rewrites well-known font family names to its own Google Fonts download, so the caption font is declared under the private name `ACS Caption`; do not add system font names to the caption CSS.
