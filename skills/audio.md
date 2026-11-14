# Audio: voice, music, sound effects, loudness

Evidence: `reference/analysis/audio.md` (measurements and per-video cue tables), `spectrograms/`, `sfx_strong_merged.json`.

How the references were studied: measured, not listened to. Sound names in the cue tables come from spectral shape plus what is on screen at that moment. Treat a label such as "whoosh" as a best reading.

## Hard rule

Claude does not generate audio. No synthesised voice, no generated music, no generated effects.

- **Voice**: supplied by the user (`script.md`).
- **Music and effects**: downloaded from the free libraries in `assets.md`, or supplied by the user. Record the licence and credit for each file.

## Track layout [measured]

| Track | Content | Level |
| --- | --- | --- |
| Voice | One narrator, centre | About -14.5 LUFS on its own. Varies no more than 1.5 dB between sentences |
| Music | One light minor-key staccato cue | 22 to 25 dB under the voice (about -36 to -39 LUFS). Starts with frame 0, still playing at the cut |
| Hero effects | Booms, slams, blasts, explosions | Peaks 2 to 8 dB over the voice level, 0.2 to 1.9 s long |
| Support effects | Thuds, knocks, pops, swishes, clicks, whooshes, fuse hiss, cloth | Peaks 4 to 13 dB under the voice, 0.03 to 0.8 s |
| Ambience | None measurable in the references | Leave out |

Master: -14 LUFS integrated, true peak at or below -1 dBTP, loudness range 2 to 3 LU. The mix is close to mono. Nothing above 16 kHz is needed.

## Ducking [measured]

There is none. The music level changed by 0.8 to 2.0 dB between pauses and loud speech, which is inside the measurement noise. Keep the music at a fixed low level. Do not add a ducker. Effects are not ducked under the voice either; a limiter catches the sum.

## Music [measured, with limits]

- Minor key with a raised leading tone (E minor once, D minor twice), short notes of 0.34 to 0.40 s.
- Two of the three videos change section on story turns, by 6 to 13 dB. In the build-up before the payoff the music thins to sparse low hits, then returns at the payoff.
- For 30 to 40 s: plan 2 to 3 section points (re-hook, turn, final line).
- Tempo and instruments: **[unknown]**. Candidates were about 76 and about 100 beats per minute, low confidence.
- When choosing a track, search for: light, sneaky, pizzicato or staccato, comedy-suspense, minor key. Choose one whose sections can be edited to the story turns.

## Sound effects

Density **[measured]**: 3.2 to 6.3 strong cues per 10 s. For a 30 to 40 s video that is 10 to 25 cues.

| Type | Count for 30 to 40 s |
| --- | --- |
| Low thud, boom, thump | 3 to 9 |
| Mid knock, pop, tick | 3 to 9 |
| Bright swish, rustle, click, hiss | 2 to 4 |
| Whoosh or swell | 1 to 2 |
| Sustained tail: blast, crash, explosion, rumble | 2 to 4 |
| Tonal one-shot: ding, bell | 0 to 1 |

Placement **[measured]**:

- Every physical impact the narrator names gets a cue within about 0.1 s of the word: slams, smashes, rips, lights, tosses, blast off.
- Text or numbers slamming into the scene get a boom.
- Whooshes go on the big location jumps only, 1 to 5 per reference video. Not on every dissolve.
- A punchline often gets a small pop, or a short clear space with one quiet foley sound.
- Ending: either the loudest hit lands on the final words (two references) or the last 5 s have no effects at all (one reference).

About 10 quieter events per 10 s also exist under the voice. What they are is **[unknown]**.

## Timing [measured]

- Voice at level by 0.12 to 0.16 s. Music from 0.0 s. No intro.
- Sentence gaps 0.15 to 0.30 s.
- Video ends 0.1 to 0.4 s after the last word. Hard stop, no fade.

## Building the cue list

1. From the word timings, mark every physical verb and every on-screen impact in the shot plan.
2. Assign a type from the table and a role (hero or support). Keep hero cues to 2 to 5 for the whole video.
3. Find each sound in the free libraries (`assets.md`). Trim silence from the head so the transient sits on the cue time.
4. Set levels by role, then measure the result. Do not trust the numbers until the render's loudness report confirms -14 LUFS and the peak limit.

## Checks

- Loudness report from the render: integrated, true peak, range.
- Music measured in a voice pause sits 22 to 25 dB under the voice.
- Each named impact has its cue within 3 frames of the picture.
- A credits file lists every audio file with source and licence.
