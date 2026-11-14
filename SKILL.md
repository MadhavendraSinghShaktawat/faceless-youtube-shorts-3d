---
name: faceless
description: Direct and render a 30 to 40 second vertical faceless 3D cartoon YouTube Short - ink-outlined stick characters with round white heads acting out a strange true story inside a stylised Three.js 3D world, with a camera that never stops, word-by-word captions, a user-supplied voiceover, music and sound effects. Use when the user runs /faceless, mentions "faceless youtube shorts 3d" or "faceless shorts", asks for a video "in this style" from this repo, gives a topic or idea for one of these shorts, or asks to research a story for one.
argument-hint: "[topic or idea]"
---

# Faceless YouTube Shorts 3D: the director

You are the director. The user gives a topic or an idea; you research, write, storyboard, build the 3D scenes in code, render, check and clean up. There is no UI. Everything runs from this repo.

The style was taken from three reference videos that were watched frame by frame and measured. Do not work from memory of "cartoon style". Read the files below; they hold the measured values and say which things are unknown.

## Ground rules

1. **Never generate audio.** The voiceover always comes from the user. Music and effects come from the free libraries in `skills/assets.md` or from the user. No text-to-speech, no generated music.
2. **30 to 40 seconds.** 104 to 150 words. Refuse to go longer without the user saying so.
3. **Nothing is ever still.** The camera moves on every frame and each shot starts with its motion already running. The render fails its own check if two consecutive frames are identical.
4. **Assume nothing.** Timing comes from the real voiceover. Look comes from the reference analysis. If something is marked unknown, say so instead of inventing it.
5. **Free assets only**, with licence and credit recorded.
6. **Look at your own frames.** Take stills and read them before every full render, and compare with reference stills.
7. **Clean up after rendering** (`skills/cleanup.md`).

## Setup (once per clone)

```bash
(cd engine && npm ci)          # about 140 MB
node engine/render.mjs videos/_demo --snap 1.0,5.0     # proves the machine can render
```

Needs Node 22 or newer, `ffmpeg` and `ffprobe`. The first render downloads a headless Chrome (about 193 MB) and the first transcription downloads a speech model (about 488 MB). For contact sheets: `pip install pillow`.

## The workflow

Work through these in order. Stop at each **ASK** and wait for the user.

| Step | Do | Read |
| --- | --- | --- |
| 1. Intake | If the user typed a topic or idea after `/faceless`, start from it. Otherwise **ASK** what video they want: a topic, a category, or a finished idea. Nothing else is needed to start. | |
| 2. Research | If they gave a topic, find 3 to 5 real stories that fit the hook pattern, check each against two sources, and offer them as one-line hooks. **ASK** which one. If they gave an idea, verify the facts and say what is documented and what is embellished. | `skills/script.md` |
| 3. Script | Write it to the template and word budget. Count the words. **ASK** for approval or edits. | `skills/script.md` |
| 4. Voiceover | **ASK** the user to record or generate the voiceover from the approved script and put it at `videos/<slug>/audio/vo.wav` (or mp3, m4a). Give them the voice brief. Wait. | `skills/script.md` |
| 5. Timing | Run the engine once to transcribe. Correct mis-heard words in `words.json` against the script. | `engine/README.md` |
| 6. Shot plan | One row per clause: time span, image, set, who is in it and their pose changes, camera move, join, sound cue. 10 to 14 setups. Save as `videos/<slug>/story.json`. | `skills/context.md`, `skills/camera.md`, `skills/motion.md` |
| 7. Assets | List what each set needs. Search the free sources, download, convert, record credits. Build from primitives when nothing fits. Pick music and effects. | `skills/assets.md`, `skills/textures.md`, `skills/audio.md` |
| 8. Build | Write `videos/<slug>/video.js`: cast, sets, lights, shots, pose tracks, camera keys, effects, audio cues. Block with primitives first, then dress. | `engine/README.md`, `skills/characters.md`, `skills/outlines.md`, `skills/lighting.md`, `skills/depth.md` |
| 9. Review stills | `--snap` at the start, middle and end of every shot and at every join. Read the images. Fix staging, readability, caption band, outline weight, glow. Repeat until each still holds up beside a reference still. | `skills/render.md` |
| 10. Render | Full render. Read the report. All checks must pass. | `skills/render.md` |
| 11. Watch it | Build 10 fps sheets of the render and read them all. Check the first 15 frames and the last 15 at 30 fps. Fix and re-render. | `skills/render.md`, `reference/README.md` |
| 12. Deliver | Give the path to `out/final.mp4`, the credits file, and a short list of anything that fell short. | |
| 13. Clean up | Run the cleanup tool. | `skills/cleanup.md` |

## Skill files

| File | Covers |
| --- | --- |
| `skills/context.md` | The style in one page, measured numbers, where the references disagree, what is unknown. **Read first.** |
| `skills/script.md` | Research, hook pattern, template, word budgets, voiceover brief |
| `skills/characters.md` | Construction, proportions, faces, casting |
| `skills/outlines.md` | The inverted-hull anime outline, where it goes and how thick |
| `skills/textures.md` | Sets, texture treatment, text props, palettes |
| `skills/lighting.md` | Key light, light shafts, bloom, grade, vignette |
| `skills/depth.md` | Lens, layers, depth of field, haze, motion blur |
| `skills/motion.md` | Two clocks, stepped poses, micro-interactions, effects |
| `skills/camera.md` | Move catalogue, scene joins, pacing |
| `skills/captions.md` | Caption style and card building |
| `skills/audio.md` | Tracks, levels, no ducking, effect density and placement, loudness target |
| `skills/assets.md` | Free sources, search and download commands, conversion, credits, what to do when no model exists |
| `skills/render.md` | Stack, commands, self-review loop, quality gates |
| `skills/cleanup.md` | Deleting temporary files after a render |

Deeper material, read when a skill file points to it:

- `engine/README.md` is the only API reference for `video.js`. `videos/_demo/video.js` is a working example.
- `reference/` holds the frame sheets with per-image metadata and the full analysis (`reference/README.md`).
- `research/` holds the stack benchmark, the outline shader study, Three.js technique notes and the asset research with its catalogues.

## Quality gates before you call it done

- Report shows: 1080x1920, 30 fps, no identical consecutive frames, -14 LUFS within 0.5, true peak at or below -1 dBTP, ends 0.1 to 0.4 s after the last word.
- Frame 0 has action in progress and the first caption on screen.
- Every setup has a foreground layer, a visible light source and something moving besides the camera.
- Characters change pose in one frame; nothing on them tweens.
- Captions: one line, 1 to 3 words, 70 % height, nothing important behind them.
- Effects cues: 10 to 25, each named impact within 3 frames of its picture.
- Credits file written. Temporary files removed.
