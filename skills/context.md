# Context: what this style is

Read this first. It is the summary of three reference videos that were watched frame by frame (10 fps sheets for the full length, 30 fps sheets on every transition and effect) and measured on the audio side. Full evidence is in `reference/analysis/`.

Every statement here is tagged:

- **[measured]** counted or measured from the files.
- **[seen]** observed in frames, not measured.
- **[choice]** a build decision made for this skill, not a fact about the references.
- **[unknown]** could not be determined. Do not fill these in with guesses.

## The format

- Vertical 9:16, 30 fps, 61 to 67 s in the references **[measured]**. This skill targets 30 to 40 s **[choice, owner's rule]**.
- One narrator tells a strange true-sounding story about an unnamed person. Stick-figure characters act it out inside a stylised 3D world.
- First frame: action already under way, camera already moving, first caption already on screen, voice at level by 0.12 to 0.16 s **[measured]**. No title, no intro.
- Last frame: 0.1 to 0.4 s after the last word, hard stop, no outro, no call to action **[measured]**.

## The seven things that make it look like this

| Topic | The rule | File |
| --- | --- | --- |
| Characters | Flat-looking ink figures: round off-white head, capsule body, line limbs, ball hands, dark plum outline. They move in stepped poses. | `characters.md` |
| Outlines | Only characters carry an ink outline. The world has none. | `outlines.md` |
| World and textures | Real 3D sets with hand-painted, flat-coloured textures and readable text props. | `textures.md` |
| Lighting | One motivated key light per set, visible light shafts with dust, bloom on every light source and effect, a colour grade per scene. | `lighting.md` |
| Depth | Wide lens close to the subject, foreground objects, haze, soft corners, light depth of field on inserts. | `depth.md` |
| Motion | Two clocks: the camera and world run at 30 fps, characters pop between held poses. | `motion.md` |
| Camera | Never still. Not for one frame. | `camera.md` |

Then: `script.md` (how the story is written), `captions.md`, `audio.md`, `assets.md`, `render.md`, `cleanup.md`.

## Numbers that hold across all three references [measured]

| Thing | Value |
| --- | --- |
| Camera fully still | Never. Longest near-hold is about 6 frames in one video and about 2 s of slow creep in another. |
| Narration pace | 211 to 227 words per minute, about 3.65 words per second, flat from start to end |
| Captions | 1 to 3 words per card, 71 to 78 % single words, about 0.35 s per card, hard swap, white with black stroke, centred at 70 % of frame height |
| Loudness | -14.1 to -14.3 LUFS integrated, true peak -0.9 to -2.0 dBTP |
| Music | Present from first to last frame, 22 to 25 dB under the voice, not ducked |
| Strong sound effects | 3.2 to 6.3 per 10 s |
| Character outline | Dark plum (#301b25, #2c1821), 3 to 7 % of head diameter |
| Character height | 3 to 4 heads |

## Where the references disagree

Do not average these away. Pick per video.

| Topic | pink-prison | one-cart | mine-salting |
| --- | --- | --- | --- |
| Hard cuts | 0 | 0 | 15 |
| Scene joins | 10 dissolves of 7 to 12 frames, 1 whip pan, 1 push into a monitor, 2 doorway push-throughs, 1 fly through the roof | 18 dissolves of 4 to 8 frames | hard cuts, 3 dissolves of 6 to 8 frames, 1 dust wipe, 1 muzzle-flash join |
| Shots | long travelling takes, up to 7.6 s | 19 takes, 1.1 to 14.75 s | 21 shots, mean 2.9 s |
| Motion blur | on the whip pan | none | on fast camera moves |
| Vignette | only in rage beats | soft blurred corners instead | dark corners indoors |
| Characters look | 3D-ish: foreshorten from above | flat cut-outs | flat cut-outs that cast shadows |

**[choice]** The owner asked for continuous flow, so this skill defaults to the no-hard-cut grammar of pink-prison and one-cart: dissolves and travelling joins. Use a hard cut only when the script has a deliberate jolt.

## What is not known

- Which of these traits cause the videos' reach. The analysis describes what the videos do. It cannot show why they spread.
- Whether the stories are true. The scripts give no names, dates or places.
- The exact caption typeface (it resembles Poppins ExtraBold), the lens, the software the creator uses, whether the voice is a person or synthetic, the exact music tracks and instruments.
- Whether a quiet ambience bed exists below about -64 dBFS.

## Reference library

`reference/README.md` explains the sheets. Short version: `reference/sheets/<video>/10fps/sheet_NNN.jpg` covers 2 s each with time and frame number burned into every tile, and `sheet_index.json` tells you which sheet holds which second, so you never have to guess how many frames to look at.
