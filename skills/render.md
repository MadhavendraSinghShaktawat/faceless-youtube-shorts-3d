# Render: stack, commands, self-review

Evidence: `research/render-stack.md` (benchmark and decision), `engine/README.md` (API and commands).

## The stack and why

| Part | Choice | Reason |
| --- | --- | --- |
| 3D | three.js 0.187.0, plain ES module, every frame a pure function of time | Deterministic; the same scene code ran unchanged in all three hosts tested |
| Render host | HyperFrames 0.9.41 (HeyGen's open-source HTML-to-video tool, Apache-2.0) | Free for anyone. Remotion is free only for individuals, non-profits and companies of up to 3 people |
| Captions | DOM overlay in the same page | Sharp text, exact font |
| Audio | A final ffmpeg pass | HyperFrames' own mixer has no loudness target (its test mix came out at -17.4 LUFS) |
| Transcription | HyperFrames' local whisper | Word timings from the user's voiceover |

Benchmark on the same 1080x1920 toon scene with outlines, shadows and bloom (Apple M6):

| Host | 5 s (150 frames) | 40 s (1200 frames) |
| --- | --- | --- |
| Puppeteer + WebCodecs (no framework) | 1.35 s | 6.65 s |
| Remotion, best flags | 2.95 s | 9.2 s |
| HyperFrames, `--gpu` | 3.87 s | 12.9 s |

Remotion was a little faster and matched HyperFrames frame for frame. Speed did not decide it: all three finish a 40 s video in under 20 s. Licence and built-in tooling did. If a user is certainly eligible for Remotion's free tier and wants it, `research/_bench/remotion/` is a working starting point.

Without a GPU (software rendering) every host was 5 to 9 times slower.

## Commands

```bash
node engine/render.mjs videos/<slug> --snap 0,1.5,3.0     # stills only, 2 to 4 s
node engine/render.mjs videos/<slug> --draft              # quick full pass
node engine/render.mjs videos/<slug>                      # final -> videos/<slug>/out/final.mp4 + out/report.json
node engine/render.mjs videos/<slug> --workers 2          # when the scene loads heavy assets
```

Measured: the 8 s demo renders in 6 to 10 s; a 36 s video in about 17 s.

Exit code 0 means every check passed; 2 means it rendered but a check failed; 1 means a lint or render error.

## What the engine checks for you

- Stops before rendering if `video.js` uses a real clock, unseeded randomness, timers or animation loops, or names a set, actor, pose, expression or prop that does not exist.
- Warns on: a camera key with no creep, a hard cut, a dissolve outside 4 to 12 frames, a caption over 3 words, a wrong tail length.
- After rendering: codec, size, frame rate, frame count, no two identical consecutive frames, -14 LUFS within 0.5, true peak at or below -1 dBTP, end 0.1 to 0.4 s after the last word.

## The self-review loop

You cannot watch the video, so look at frames, the same way the references were studied.

1. **Block.** Sets from primitives, characters placed, camera keys in. Snap the first, middle and last frame of each shot. Fix staging and scale.
2. **Dress and light.** Snap again. Put each still beside a reference still from `reference/sheets/<video>/stills/` of the closest setting. Check outline weight against head size, shadow colour, glow, foreground layer, caption band.
3. **Joins.** Snap three frames across each dissolve (before, middle, after). Both sides must be moving and neither should jump in brightness.
4. **Pose changes.** Snap two consecutive frames at a pose change (`t` and `t + 1/30`).
5. **Draft render, then sheets:**
   ```bash
   python3 tools/make_sheets.py videos/<slug>/out/final.mp4 videos/<slug>/out/review/10fps --fps 10
   python3 tools/make_sheets.py videos/<slug>/out/final.mp4 videos/<slug>/out/review/open --fps 30 --start 0 --end 1 --cols 5 --rows 6 --tile-w 216
   ```
   Read every sheet in order. This is "watching" the video.
6. **Final render**, read `out/report.json`, then the gates in `SKILL.md`.

## Known limits of the engine (plan around them)

- No push-through join between two sets (through a wall or roof into the next scene). It can be done by hand inside one set.
- No rain, cloth, crowds or finger poses yet. Hands do not rotate.
- Characters are fully unlit; the references show a faint gradient on the head.
- Motion blur needs 10 to 12 samples to look clean and costs that many renders per frame. Use it on whip pans only.
- Loading a GLB works but GLB animation playback has not been exercised in a render.
- The demo's sets are simpler than the references' sets. Closing that gap is set dressing: textures, props, text props, lighting.

The full list is at the end of `engine/README.md`. If a video needs something on it, say so to the user before promising the shot.

## Gotchas already paid for

- HyperFrames is pre-1.0 and releases almost daily. The version is pinned. Do not upgrade casually.
- Telemetry is on by default in HyperFrames; the engine turns it off.
- Each render worker loads the whole scene. Keep assets small or lower `--workers`.
- three.js r187 removed `PCFSoftShadowMap`.
- A machine with a fresh npm may skip the browser download step; the first render fetches Chrome itself.
