# Reference library

Three videos from one creator, watched frame by frame. Use this folder instead of re-watching the videos.

The source videos are not in the repo (they are someone else's work). `reference/source/` is git-ignored. To rebuild sheets, put the files there as `pink-prison.mp4`, `one-cart.mp4`, `mine-salting.mp4`.

| Slug | Title | Size | Length | Frames |
| --- | --- | --- | --- | --- |
| `pink-prison` | The Pink Prison Cell Experiment | 720x1280, 30 fps | 65.2 s | 1957 |
| `one-cart` | How One Cart Stopped an Entire Army | 720x1280, 30 fps | 66.8 s | 2005 |
| `mine-salting` | How Mine Salting Worked | 1080x1920, 30 fps | 61.1 s | 1832 |

## Sheets

Every tile on every sheet has its time in seconds and its source frame number burned into the top-left corner, in yellow. Tiles read left to right, top to bottom.

| Folder | Sampling | Grid | Covers | Use for |
| --- | --- | --- | --- | --- |
| `sheets/<slug>/overview/overview_001.jpg` | 1 frame per 2 s | 6 x 6 | whole video on one image | first look, finding a scene |
| `sheets/<slug>/10fps/sheet_NNN.jpg` | 10 fps | 4 x 5 = 20 tiles | 2.0 s per sheet, whole video (33, 34 and 31 sheets) | staging, pacing, captions, camera path |
| `sheets/<slug>/30fps/*.jpg` | 30 fps, every frame | 5 x 6 = 30 tiles | 1.0 s per sheet, at transitions, fast moves and effects only | exact frame-by-frame motion |
| `sheets/<slug>/stills/*.jpg` | single frames, full resolution | | chosen frames | line weight, texture, glow, colour sampling |

## Metadata, so you do not have to count frames

- Each sheet `X.jpg` has `X.json` beside it: source video, `t_start`, `t_end`, sample rate, grid, and for every tile its row, column, time and source frame number.
- Each folder has an index (`sheet_index.json`, `overview_index.json`, or `<prefix>_index.json` for 30 fps sets): one entry per sheet with its time range.

To see second 38.9 of pink-prison: open `sheets/pink-prison/10fps/sheet_index.json`, find the entry whose `t_start` to `t_end` holds 38.9 (sheet 20, since each covers 2 s: sheet number = floor(t / 2) + 1), and read that one image.

## Analysis

| File | Holds |
| --- | --- |
| `analysis/<slug>.md` | Shot list, camera, motion, characters, outlines, world, lighting, depth, captions, story structure, replication numbers. Timestamps and frame numbers throughout |
| `analysis/<slug>.shots.json` | Machine-readable shot list: start, end, location, action, camera, join, caption text |
| `analysis/pink-prison.captions.json` | Every caption card with frame and time |
| `analysis/audio.md` | Voice, music, ducking, effects cue tables, loudness, replication spec |
| `analysis/script.md` | Hook mechanics, beat sheets, template, word budgets |
| `analysis/transcripts/<slug>.json`, `.txt` | Word-timed transcripts |
| `analysis/spectrograms/` | Spectrogram images used as evidence for music and effects |
| `analysis/sfx_frames/` | Frame strips at the strongest sound cues |
| `analysis/*.json` | Raw measurements: loudness, voice, music, effects candidates, script statistics |

## Rebuilding or adding sheets

```bash
python3 tools/make_sheets.py reference/source/<slug>.mp4 reference/sheets/<slug>/10fps --fps 10
python3 tools/make_sheets.py reference/source/<slug>.mp4 reference/sheets/<slug>/30fps \
        --fps 30 --start 38 --end 40 --cols 5 --rows 6 --tile-w 216 --prefix t038
```

Needs ffmpeg and Pillow. The same tool works on your own renders, which is the easiest way to compare a new video against the references side by side.

## Known limits of the analysis

- In `one-cart.md`, beats between 4 and 20 s rest on first-pass notes, and nine of the eighteen dissolves were located on 10 fps sheets only (marked "~" there).
- Caption start frames in pink-prison are within about 3 frames in four bright, fast stretches and within 1 elsewhere.
- Audio was measured, not listened to. Sound-effect names are inferred from spectral shape and the frame on screen.
- Three.js parameter values in the replication sections (field of view, bloom settings, cone opacity) are estimates from the look, not measurements.
