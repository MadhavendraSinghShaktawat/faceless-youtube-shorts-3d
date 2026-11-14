# Cleanup: keep storage clean after every render

Run this after the user has the final video. It is part of the job, not optional.

```bash
tools/cleanup.sh --dry-run videos/<slug>     # list what would go, with sizes
tools/cleanup.sh videos/<slug>               # delete temporary files for that video
tools/cleanup.sh                             # same, for every video folder
tools/cleanup.sh --deep                      # also remove the engine's installs and downloads
```

It prints the bytes freed.

## What a render leaves behind [measured by diffing the disk before and after]

| Location | Content | Size |
| --- | --- | --- |
| `videos/<slug>/.build/` | Bundle, generated page, silent video, audio mix | small to tens of MB |
| `videos/<slug>/out/snaps/` | Review stills from `--snap` | a few MB |
| `~/.cache/hyperframes/history/<id>/` | Asset blobs for that render | varies |
| `~/.cache/hyperframes/chrome` | Headless Chrome, downloaded on first render | 193 MB |
| `~/.cache/hyperframes/whisper/` | Speech model, downloaded on first transcription | 488 MB |
| The system temp folder | Nothing after a clean exit; leftovers only when a render is killed | |

## What each mode removes

| | Default | `--deep` |
| --- | --- | --- |
| `.build/`, `out/snaps/`, per-video render history, stray temp folders from killed renders | yes | yes |
| `engine/node_modules` (140 MB) | no | yes |
| Chrome, speech models, fonts and all history under `~/.cache/hyperframes`, and `~/.hyperframes/cache` | no | yes |

Always kept: `out/final.mp4`, `out/report.json`, `out/review/`, `video.js`, `words.json`, `story.json`, `assets/`, `audio/`, `CREDITS.md`.

## When to use which

- **After every delivered video:** default mode on that video.
- **When the user is done making videos for now, or asks to free space:** `--deep`. In testing it freed 975 MB.
- **Before `--deep`, tell the user two things:**
  - `~/.cache/hyperframes` is shared by every HyperFrames project on the machine, not only this repo. If they use HyperFrames elsewhere, those projects will download Chrome and models again.
  - The next render here needs the network: `(cd engine && npm ci)` takes about a second from the lockfile, then Chrome (and the speech model, on the next transcription) download again. The first render after a deep clean took 19 s in testing.

## Other things to remove by hand when a video is finished

- `videos/<slug>/assets/_incoming/`: downloaded zips and unconverted source files, once the converted files are in `assets/`.
- `videos/<slug>/out/review/`: review sheets, once the user has accepted the video. Ask first; they are useful if changes come back.
- Voice or music working copies you made outside `audio/`.

## Safety

The script deletes only the folders named above. It resolves paths first and refuses anything outside this repo and those specific cache folders. Do not replace it with ad-hoc `rm -rf` commands. If something else needs deleting, list it with sizes and confirm with the user.
