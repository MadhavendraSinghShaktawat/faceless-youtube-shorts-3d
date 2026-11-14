# Animated Cartoon Souls

A Claude Code skill that directs and renders 30 to 40 second vertical cartoon shorts: ink-outlined stick characters with round white heads act out a strange true story inside a stylised Three.js world, with a camera that never stops, word-by-word captions, your voiceover, music and sound effects.

There is no UI. You talk to Claude; Claude researches, writes, builds the scenes in code, renders and cleans up.

## Install

Clone it where Claude Code looks for skills:

```bash
git clone <repo-url> ~/.claude/skills/animated-cartoon-souls        # for every project
# or
git clone <repo-url> .claude/skills/animated-cartoon-souls          # for one project
cd ~/.claude/skills/animated-cartoon-souls/engine && npm ci
```

Or ask Claude: "clone `<repo-url>` into my skills folder and set it up".

Needs Node 22 or newer, ffmpeg, and Python 3 with Pillow for review sheets. The first render downloads a headless Chrome (about 193 MB); the first transcription downloads a speech model (about 488 MB).

## Use

Say "animated cartoon souls" and what you want:

> animated cartoon souls: make one about a weird medieval siege trick

or give a finished idea. Claude will:

1. Research real stories and offer hooks, or check your idea.
2. Write a script of 104 to 150 words and ask you to approve it.
3. **Ask you for the voiceover.** You record or generate it and drop the file in the video folder. Claude never generates audio.
4. Time everything to your voice, plan the shots, fetch free assets, build and render.
5. Hand you `videos/<slug>/out/final.mp4` with a credits file, then delete temporary files.

## What is in here

| Path | What |
| --- | --- |
| `SKILL.md` | The director's workflow and rules. Claude reads this first |
| `skills/` | One file per craft: context, script, characters, outlines, textures, lighting, depth, motion, camera, captions, audio, assets, render, cleanup |
| `engine/` | The renderer: three.js scene kit (characters, poses, faces, camera paths, dissolves, light shafts, effects, captions), audio mastering, one command. `engine/README.md` is the API |
| `videos/_demo/` | An 8 second working example |
| `tools/make_sheets.py` | Turns any video into timestamped contact sheets with metadata |
| `tools/cleanup.sh` | Removes temporary files after a render |
| `tools/analysis/` | The scripts used to measure the reference audio |
| `reference/` | Frame sheets and full analysis of the three reference videos. `reference/README.md` explains how to read them |
| `research/` | Render-stack benchmark, outline shader study, Three.js technique notes, asset research and catalogues |

## Stack

three.js 0.187.0 for the picture, HyperFrames 0.9.41 as the headless render host, ffmpeg for audio mastering. All free and open source. The choice and the benchmark against Remotion are in `research/render-stack.md`.

## Honest state

- The engine renders, passes its own checks and is deterministic. The demo's characters, line weight and captions are close to the references. Its sets are much plainer than the references' sets; getting closer is a matter of set dressing per video.
- Not built yet: travelling joins through walls between two sets, rain, cloth, crowds, hand rotation. See the limits list in `engine/README.md`.
- The reference videos themselves are not included. `reference/` holds analysis and low-resolution study sheets of another creator's videos. Check that you are comfortable publishing those before making the repo public; the skill works without the sheet images.
- Downloaded assets keep their own licences. Each video gets a `CREDITS.md`.
