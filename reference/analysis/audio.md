# Reference audio analysis (measured)

Videos: `pink-prison.mp4` (65.2 s), `one-cart.mp4` (66.8 s), `mine-salting.mp4` (61.0 s). AAC 44.1 kHz stereo.

## 0. How to read this file

Nobody listened to these files. Every statement is one of:

- **MEASURED** on the delivered mix (ffmpeg `ebur128`, numpy STFT, autocorrelation).
- **STEM** measured on a Demucs (`htdemucs --two-stems vocals`) separation into `vocals` and `no_vocals` ("bed" = music + SFX). The two stems sum back to the mix within -50 dB, but a separation is an estimate: some bed energy is lost under loud voice and some voice (breaths, low-frequency residue, laughs) leaks into the bed. Stem numbers carry roughly +-2 dB of uncertainty, more below 200 Hz.
- **VISUAL** checked against frames of the video at the event time (`sfx_frames/*.jpg`, plus the 10 fps sheets).
- **INFERRED** = a label derived from spectral shape + what is on screen (e.g. "whoosh"). Sound *type* names in the cue tables are always INFERRED.
- **NOT DETERMINABLE** = said so explicitly.

Raw numbers: `loudness.json`, `voice_metrics.json`, `music_metrics.json`, `extras.json`, `sfx_candidates.json`, `sfx_strong_merged.json`, `script_stats.json`. Scripts: `tools/analysis/` (see the last section).

Level conventions: "dBFS" = RMS of 10 ms frames, mono sum (L+R)/2. "rel VO" = level minus the voice RMS (-17 dBFS in all three). Voice RMS -17 dBFS corresponds to -14.4 LUFS here, so **LUFS ≈ dBFS + 2.6** for voice-like material.

---

## 1. Summary of what is in the mix

| | pink-prison | one-cart | mine-salting |
|---|---|---|---|
| Integrated loudness (mix) | -14.3 LUFS | -14.1 LUFS | -14.1 LUFS |
| Voice stem | -14.5 LUFS | -14.4 LUFS | -14.3 LUFS |
| Bed stem (music+SFX) | -28.8 LUFS | -28.6 LUFS | -27.7 LUFS |
| Music only (bed, SFX frames removed, 250-8000 Hz RMS) | -41.6 dBFS = **-24.6 dB rel VO** | -38.7 dBFS = **-21.6 dB rel VO** | -39.1 dBFS = **-22.4 dB rel VO** |
| Music present | yes, 0.08 s to last frame | yes, 0.00 s to last frame | yes, 0.02 s to last frame |
| Ducking | none detectable (<= 2 dB) | none detectable (<= 2 dB) | none detectable (<= 1 dB) |
| Strong SFX (peak >= VO-13 dB), merged | 21 = 3.2 per 10 s | 42 = 6.3 per 10 s | 31 = 5.1 per 10 s |
| All SFX candidates incl. weak | 65 = 10.0 per 10 s | 84 = 12.6 per 10 s | 61 = 10.0 per 10 s |
| SFX louder than the voice RMS | 7 | 3 | 5 |
| Speech rate (words / full duration) | 218 wpm | 211 wpm | 227 wpm |

The mix is voice-dominated: voice alone accounts for the integrated loudness to within 0.2-0.3 LU. Music is a quiet static bed about 22-25 dB under the voice. SFX are the only thing that ever approaches or exceeds voice level, and only for 0.2-1.5 s at a time.

---

## 2. Voice

All MEASURED unless marked. Word timings come from faster-whisper `small.en` word timestamps; checked against burned-in captions they are good to about +-50 ms inside phrases but up to ~250 ms wrong at pause edges (example: "Barbie's" is timed 12.92 s, the caption appears at 12.5 s and voice energy returns at ~12.65 s). Pause numbers are therefore given two ways.

| | pink-prison | one-cart | mine-salting |
|---|---|---|---|
| Words | 237 | 235 | 231 |
| Words/min over full video | 218.1 | 211.0 | 227.0 |
| Articulation rate (whisper pauses >150 ms removed) | 243 wpm | 231 wpm | 253 wpm |
| Syllables/s (estimated from spelling) | 4.97 | 4.68 | 4.71 |
| wpm per 10 s window | 216, 192, 240, 204, 234, 228 | 204, 204, 204, 234, 228, 198 | 222, 234, 240, 204, 216, 246 |
| First audio above -50 dBFS | 0.11 s | 0.05 s | 0.05 s |
| Voice onset (above -25 dBFS) | 0.16 s | 0.12 s | 0.13 s |
| Last word ends | 65.00 s | 66.46 s | 60.94 s |
| Tail after last word | 0.20 s | 0.37 s | 0.11 s |
| Level in last 100 ms | -30 dBFS | -21 dBFS | -31 dBFS |
| Voice RMS inside words | -16.7 dBFS | -16.7 dBFS | -16.4 dBFS |
| Frame level p10 / p50 / p95 | -30 / -18 / -12 | -29 / -18 / -12 | -28 / -18 / -12 |
| Sentence-to-sentence level SD | 1.3 dB | 1.0 dB | 1.4 dB |
| F0 median (autocorrelation) | 204 Hz | 210 Hz | 195 Hz |
| F0 5th-95th percentile | 123-324 Hz (16.9 st) | 131-329 Hz (15.9 st) | 115-320 Hz (17.8 st) |
| LPC formants F1-F4 (median) | 415 / 1624 / 2596 / 3924 | 402 / 1498 / 2605 / 3885 | 417 / 1521 / 2622 / 3807 |

**Speech rate.** 211-227 wpm (mean 219 wpm = 3.65 words/s), and it is flat: no 10 s window is below 192 or above 246 wpm. There is no slow intro and no slow ending.

**Start.** Speech starts on the first frame. The file opens with 50-110 ms of digital silence (encoder delay), voice is at full level by 0.12-0.16 s. There is no music intro, no sting before the first word.

**End.** The last word finishes 0.11-0.37 s before the file ends and the audio is still at -21 to -31 dBFS on the last 100 ms. There is no fade-out and no outro: a hard cut, so a replay runs straight into the first word.

**Pauses.**

- Whisper word gaps > 150 ms: 24 / 22 / 25 per video, total 6.5 / 5.3 / 6.1 s, median 0.26 / 0.22 / 0.20 s, longest 0.52 / 0.40 / 0.70 s. All fall at punctuation: 16+8 / 12+10 / 15+10 (sentence end + comma). Zero mid-phrase pauses.
- Sentence gap (whisper): median 0.26 / 0.22 / 0.18 s, interquartile 0.16-0.30 s.
- Envelope check on the vocal stem (level more than 11 dB under the voice median for >= 150 ms): 15 / 8 / 12 pauses, total 2.8 / 1.5 / 2.2 s = 4.3 / 2.2 / 3.7 % of runtime, median 0.17-0.18 s, longest 0.29 / 0.23 / 0.26 s. The vocal stem never drops below -40 dBFS for 150 ms anywhere.
- Reading the two together: sentence gaps are 0.15-0.3 s, the voice is sounding ~95 % of the time, and no silence longer than about 0.3-0.4 s exists. The single longest gap (mine-salting 41.34-42.04 s, 0.7 s by whisper, 0.26-0.35 s by envelope) is the comic beat before "Completely insane."

**Voice character.** Median F0 195-210 Hz with a wide 16-18 semitone working range. Character lines are done by the same voice with pitch moves: "That's insane!" sits at 361 Hz median, "Completely insane." at 116 Hz, the commander's cheese line at 292 Hz. Level is tightly controlled (sentence SD 1.0-1.4 dB, mix LRA 2.2-2.9 LU). Male or female: NOT DETERMINABLE from these numbers. F0 ~200 Hz and a formant spacing of ~1130 Hz (vocal tract ~15.5 cm) sit between typical adult male and female values; an energetic higher-pitched male read, a lower female read and a synthetic voice all fit.

**TTS / AI voice.** NOT DETERMINABLE. Evidence only:

- Consistent with synthesis or heavy editing: no mid-phrase hesitation in 703 words; every pause at punctuation; no pause over ~0.4 s; near-identical statistics across three separate videos (rate 211-227 wpm, F0 median 195-210 Hz, range 16-18 st, sentence level SD 1.0-1.4 dB).
- Consistent with a human read: large, varied pitch movement and distinct pitched "voices" for quotes. Modern TTS can also do this.
- Breaths: NOT DETERMINABLE. Every gap contains music or an SFX, so a breath cannot be isolated.
- A tightly edited, compressed, possibly sped-up human read and an expressive TTS voice are both compatible with the data.

---

## 3. Music

**There is a music bed in all three, start to finish.** Evidence:

1. Narrow horizontal lines in the spectrograms that hold a fixed frequency for 0.3-0.9 s while the voice harmonics glide (`spectrograms/*.bed.*.png`, `*.side.full.png`).
2. `tonal.py` finds 604 / 622 / 728 stable lines >= 0.24 s in the bed stem; their median distance from the nearest equal-tempered pitch is 5.8 / 7.6 / 7.6 cents (random frequencies would give 25).
3. The same lines are found in the untouched mix (242 / 138 / 186 in the mid channel, 760 and 781 in the side channel of one-cart and mine-salting), so they are not a separation artefact.
4. First note at 0.08 / 0.00 / 0.02 s, last note runs to the final frame.

| | pink-prison | one-cart | mine-salting |
|---|---|---|---|
| Pitch classes by sounding time (top 7) | E B G F# C A D# | D A E F G C A# (+C#) | A F E D C# G B |
| Key guess (INFERRED) | E minor, with D# leading tone | D minor, with C# leading tone | D minor / A-dominant, with C# |
| Median note length | 0.40 s | 0.34 s | 0.34 s |
| 90th pct note length | 0.72 s | 0.64 s | 0.64 s |
| Tempo candidates (onset autocorrelation, r) | 66 bpm (0.17), 143 bpm (0.15) | 76 bpm (0.12), 109 bpm (0.12) | 100 bpm (0.17), 50 bpm (0.19) |
| Tempo confidence | low | medium: low drum hits recur every 1.51-1.65 s from 51.3 to 59.1 s = 2 beats at 76 bpm | medium-low: lags 0.6 / 1.2 / 1.8 s all peak |
| Music level, SFX frames removed (250-8000 Hz) | -41.6 dBFS | -38.7 dBFS | -39.1 dBFS |
| Relative to voice RMS | -24.6 dB | -21.6 dB | -22.4 dB |
| Approx. as loudness | about -39 LUFS | about -36 LUFS | about -36.5 LUFS |

Autocorrelation peaks are weak (r 0.12-0.19) because the bed is 22-25 dB under the voice; treat every bpm as a candidate, not a fact.

**Genre / instruments (INFERRED, low confidence).** Minor key with a raised leading tone, short separated notes (median 0.34-0.40 s) mostly between 400 Hz and 3 kHz, sparse low end. That profile fits light "sneaky / mischievous" comedy underscore played staccato or plucked (pizzicato strings, mallets, staccato woodwinds). one-cart 0-10 s and 29-40 s has longer held melody notes (0.4-0.9 s at 450-900 Hz), i.e. a sustained lead (wind, string or synth). Which instrument: NOT DETERMINABLE. Whether a video uses one track or several edited together: NOT DETERMINABLE.

**Does the music change at story beats?** Music-band (250-4000 Hz) median level of the bed stem per 5 s:

- pink-prison: -41, -43, -46, -46, -48, -44, -48, -46, -44, -45, -42, -43, -41. One texture throughout, same key. About 4-6 dB quieter through the middle (10-40 s), back up for the last 15 s (the turn and explanation).
- one-cart: -38, -36 | -44, -49, -48 | -37, -35, -37 | -50, -48, -46, -49 | -34, -31. Four clear switches at about 10 s, 29 s, 40 s and 60 s (1 s resolution). They line up with the script: 9.5-12.8 s commander joke and "But it gets weirder"; 28.5 s "That night, it pours"; 40.3 s "Everyone screams at him" (music thins to low drum hits while the army closes in); 59.8 s "All 82 blast off" (full level for the payoff).
- mine-salting: -43, -46, -44 | -40, -41, -40, -40 | -47, -42 | -39, -41, -40. Switches at about 14 s ("And tomorrow, a rich guy is coming"), 35 s (the rich guy laughs, comic exchange, music thins) and 43 s ("So the rich guy pays up", twist section).

So: section changes of 6-13 dB, placed on story turns, are measured in two of three videos. Whether they are edits of one cue, different cues or volume automation: NOT DETERMINABLE.

---

## 4. Ducking

Question: does the music drop when the voice is present and come back in gaps?

| Test | pink-prison | one-cart | mine-salting |
|---|---|---|---|
| Mix side channel 300-3000 Hz (voice is centred, so this is bed only): median in pauses minus median under loud voice | +1.9 dB | +2.0 dB | +0.8 dB |
| Bed stem music band: median in pauses minus median under loud voice | +1.9 dB | +6.0 dB | +2.1 dB |
| Bed stem, each pause vs the 300 ms before it: median (IQR) | -0.7 dB (-4.2..+4.1) | +1.8 dB (+0.1..+5.2) | +3.0 dB (+0.8..+8.3) |
| Pause-aligned curve, -300 ms..+300 ms | step of +3.5 dB within 50 ms of pause start, then flat | step of ~+12 dB within 50-100 ms (n=5) | flat within 1 dB |

Reading:

- The only test not affected by separation (side channel of the delivered mix) shows 0.8-2.0 dB, which is inside the noise of the method (the AAC encoder also thins the side channel under loud centre content).
- The larger stem differences appear as an instant step at the pause edge, not as a release ramp over 100-500 ms, and the stem loses bed energy under loud voice by construction. SFX are also frequently placed in the gaps.
- **Conclusion: no sidechain ducking is detectable. If any exists it is <= 2 dB.** Attack and release: not applicable / NOT DETERMINABLE.
- The mix does not need ducking: the music sits a fixed 22-25 dB under the voice the whole time, and the voice never stops for longer than ~0.3 s.

---

## 5. SFX

### Method

`sfx.py` runs on the bed stem with two detectors: a broadband detector (median of third-octave bands 300 Hz-8 kHz, which ignores single music notes) and a 20-200 Hz detector. `cue_table.py` keeps events whose peak is within 13 dB of the voice RMS and merges neighbours closer than 0.35 s. Those are the "strong" cues below. Weaker candidates (down to about VO-23 dB) are in `sfx_candidates.json`; they are a mix of quiet foley, music accents and voice leakage and were not individually verified.

Columns: time and duration (s), peak level of the bed stem (dBFS, 10 ms frames), level relative to voice RMS, spectral centroid, measured shape, what is on screen / being said (VISUAL), confidence that this is a deliberate SFX of roughly the named kind.

Limits: an SFX quieter than about VO-13 dB that sits under speech is not in the tables. Sound names are INFERRED from shape + picture.

### Density

| | pink-prison | one-cart | mine-salting |
|---|---|---|---|
| Strong cues | 21 | 42 | 31 |
| Per 10 s (average) | 3.2 | 6.3 | 5.1 |
| Per 10 s window | 1, 2, 5, 3, 5, 4, 1 | 9, 5, 4, 6, 8, 7, 3 | 9, 5, 2, 6, 6, 3, 0 |
| >= VO-6 dB | 10 | 15 | 11 |
| >= VO (hero hits) | 7 | 3 | 5 |
| All candidates per 10 s | 10.0 | 12.6 | 10.0 |

Observations:

- one-cart and mine-salting put 9 strong cues in the first 10 s (the hook action itself is noisy: drilling, shotgun). pink-prison opens with only 1 (painting is quiet) and peaks mid-video.
- mine-salting has zero strong cues after 55.5 s: the last 5.5 s (the payoff line) is voice + music only. pink-prison and one-cart do the opposite and land their loudest hit on the final words (64.4-65.1 s at VO+8 dB; 64.5-66.3 s at VO+2 dB).
- Hero hits are mostly low in pink-prison and one-cart: 8 of their 10 cues at or above voice level have a centroid under 300 Hz. The 5 in mine-salting are mid/bright (shotgun x2, gold spatter, pickaxe, explosion: centroids 419-1541 Hz).
- Stereo: most cues are near-mono (side 15-38 dB under mid). A few long ones are wide (side only 4-8 dB under mid): pink-prison 27.3 s, one-cart 25.1 s and 64.5 s, mine-salting 43.3 s and 45.1 s.

### pink-prison cue table

| t | dur | peak dBFS | rel VO | centroid Hz | measured shape | on screen / line | conf |
|---|---|---|---|---|---|---|---|
| 4.07 | 0.15 | -23 | -6 | 306 | short low-mid thump | scientist stirring paint at bench, "mixes exactly" | med |
| 12.42 | 0.31 | -29 | -12 | 1308 | mid pop/crunch in the gap | guards at table eating, gap before "Barbie's" | med |
| 14.17 | 0.22 | -30 | -13 | 1133 | mid knock/swish | cut to pink cell door, "in here. Then" | low |
| 22.07 | 1.58 | -25 | -8 | 52 | sub rumble, 3 pulses | dissolve to guards hauling inmate, "So the first guy they throw in" | med |
| 24.47 | 0.03 | -29 | -12 | 54 | low thud | big inmate lands in pink cell, "inmate in the building" | med |
| 25.47 | 0.62 | -12 | +5 | 64 | boom | "300 lbs" text slams on, floor cracks | high |
| 26.50 | 0.24 | -12 | +5 | 52 | boom | "of tattoos", cracks spread | high |
| 27.31 | 1.28 | -12 | +5 | 135 | 2 booms + wide tail (side -8 dB) | "laughing at the walls", red cracks radiate from him | high |
| 33.81 | 1.17 | -14 | +3 | 111 | build then slam (peak 34.91) | arm wrestle, "the guard slams his hand down" | high |
| 35.34 | 0.52 | -28 | -10 | 358 | two knocks | aftermath, "in two seconds" | med |
| 39.92 | 0.49 | -26 | -9 | 584 | slow-attack whoosh | cut to aerial map, "all over the country" | high |
| 42.19 | 0.22 | -29 | -12 | 1935 | bright swish | pink trucks, "by the truckload" | med |
| 43.70 | 0.24 | -28 | -12 | 1815 | bright swish | night, push into guard booth, "a guard forgets" | med |
| 45.22 | 0.09 | -29 | -12 | 1905 | click | desk with monitor, "the pink cell" | med |
| 46.08 | 0.56 | -25 | -8 | 1698 | bell-like ring: inharmonic partials 1012 / 1077 / 1384 / 3106 / 3252 Hz for 0.5 s | timer on desk, "At 15 minutes" | high |
| 48.44 | 0.33 | -28 | -11 | 1768 | bright rustle | prisoner on bench starts moving, "he's pacing" | low |
| 50.00 | 0.28 | -22 | -5 | 1855 | two bright clicks | "they open the door" | med |
| 50.64 | 0.22 | -16 | +1 | 2549 | bright burst | door swings, light floods in | high |
| 51.56 | 1.13 | -12 | +5 | 284 | crash with debris (peak 52.29) | "rip the bench out of the floor" | high |
| 56.18 | 0.05 | -22 | -5 | 1505 | single pop | wrecked cell, debris in air, "anyone in 15" | low |
| 64.36 | 0.76 | -9 | +8 | 137 | loudest hit of the video | "exact opposite", inmate rages, cracks | high |

Ambience bed: none measurable. The 6-14 kHz floor of the bed stays at -75 to -82 dBFS for the whole video (no room tone, no hiss), and it does not change between the lab, the cell block, the aerial shot and the night scene.

### one-cart cue table

| t | dur | peak dBFS | rel VO | centroid Hz | measured shape | on screen / line | conf |
|---|---|---|---|---|---|---|---|
| 1.19 | 0.42 | -22 | -5 | 4598 | bright noisy buzz | drill bits going into the board, "82 holes" | high |
| 2.62 | 0.35 | -26 | -9 | 3169 | bright swish x2 | cut to hill and banner, "because down the hill" | med |
| 3.57 | 0.20 | -26 | -9 | 246 | low-mid thump | army marching, "an army" | med |
| 4.63 | 0.12 | -28 | -11 | 589 | knock | marching, "straight" | low |
| 5.17 | 0.09 | -29 | -12 | 418 | knock | fort wall reveal, "for his fort" | low |
| 5.95 | 0.34 | -28 | -11 | 2472 | bright scrape | soldiers at grinding wheel, "sharpens swords" | med |
| 6.74 | 0.16 | -30 | -13 | 500 | knock | same shot | low |
| 8.12 | 0.30 | -27 | -10 | 1597 | mid burst | "in the corner", man drilling | med |
| 8.89 | 0.35 | -26 | -9 | 1270 | slow-attack buzz | "still drilling" | med |
| 12.26 | 0.21 | -22 | -5 | 787 | single pop on the punchline | commander, "grating cheese?" | med |
| 13.89 | 1.41 | -17 | 0 | 112 | low thuds (peak 14.63) | board bolted onto cart, "He bolts the wood onto a cart" | high |
| 16.27 | 0.28 | -22 | -5 | 118 | low thud | arrow pushed into hole, "into every hole goes" | med |
| 17.59 | 1.01 | -28 | -10 | 440 | sliding/rustle | arrows going in, "long and thin, wrapped in paper" | med |
| 19.18 | 0.06 | -27 | -10 | 779 | tick | "paper, each with a string" | low |
| 21.03 | 0.60 | -21 | -4 | 931 | whoosh + pop | "he twists all the strings" | med |
| 22.45 | 0.85 | -23 | -6 | 127 | low thud | rope dropped on grass, "one rope nobody's allowed to touch" | med |
| 25.13 | 1.55 | -15 | +2 | 195 | crack with long wide tail (side -8 dB) | "he slaps his hand so hard the whole fort hears it", cut to wide fort | high |
| 29.05 | 0.52 | -30 | -13 | 499 | soft swell | cut to night, "That night, it pours" | low |
| 30.47 | 0.38 | -24 | -7 | 1134 | cloth-like burst | "throws his coat over the cart" | med |
| 31.33 | 0.12 | -27 | -10 | 799 | knock | climbing onto cart | low |
| 32.70 | 0.03 | -26 | -9 | 1742 | click | "lies on top of it" | low |
| 36.05 | 0.15 | -30 | -12 | 830 | knock | "we're all dead" | low |
| 37.73 | 0.32 | -21 | -4 | 253 | thump | "ladders slam against the walls" | high |
| 38.54 | 0.15 | -23 | -6 | 158 | thud | second ladder | high |
| 40.08 | 0.19 | -24 | -6 | 160 | thud | "the army charges" | med |
| 41.54 | 0.34 | -29 | -12 | 765 | swell | soldiers shouting at him, "to do something" | low |
| 43.78 | 0.05 | -26 | -9 | 51 | sub thud | army wide shot, "closer" | med |
| 44.31 | 0.13 | -21 | -4 | 61 | sub thud | "and closer" | med |
| 45.11 | 1.64 | -21 | -4 | 92 | sub thuds, 4 in 1.6 s | "until they're packed shoulder to shoulder" | med |
| 47.22 | 0.86 | -19 | -2 | 57 | sub thuds | close-up of soldiers, "close enough to see their teeth" | med |
| 48.65 | 0.12 | -24 | -7 | 1257 | cloth snap | "he rips off the coat" | high |
| 49.57 | 1.03 | -20 | -3 | 168 | low hit, then bright hiss at 50.2 s (centroid 4.6 kHz) | "lights the rope" | high |
| 51.26 | 0.07 | -27 | -10 | 97 | low hit | spark on rope | see note |
| 52.77 | 0.18 | -26 | -9 | 204 | low hit | "into 82" | see note |
| 54.38 | 0.15 | -24 | -7 | 114 | low hit | "tiny flames" | see note |
| 55.96 | 0.15 | -25 | -8 | 217 | low hit | "gunpowder" | see note |
| 57.61 | 0.08 | -28 | -11 | 98 | low hit | "turning every one" | see note |
| 59.13 | 0.10 | -27 | -10 | 159 | low hit | "rocket." | see note |
| 59.97 | 0.06 | -26 | -9 | 1287 | tick | "All 82" | low |
| 60.72 | 0.74 | -15 | +2 | 292 | launch burst | "blast off the cart" | high |
| 62.08 | 0.38 | -26 | -9 | 546 | whistles/knocks | "flying every which way" | med |
| 64.46 | 1.87 | -15 | +2 | 332 | explosion, wide (side -4 dB), runs to the end | fireballs in the packed army, "not a single one misses" | high |

Note on 51.3-59.1 s: six low hits spaced 1.51, 1.61, 1.58, 1.65, 1.52 s apart. That regularity makes them more likely a drum in the music (2 beats at ~76 bpm) than picture-synced SFX. The sub thuds at 43.8-48.1 s under the approaching army may be the same drum or marching foley: NOT DETERMINABLE.

Ambience bed: no steady broadband bed. Rain for "That night, it pours" (28.5-36 s): NOT DETERMINABLE. The 2-6 kHz floor rises about 5 dB (-70 to about -64 dBFS) at 29 s, but the music also gets 12 dB louder at the same moment and the 6-14 kHz floor does not move, so a rain layer cannot be separated from the music change. If rain is there it is at or below about -64 dBFS (VO-47 dB).

### mine-salting cue table

| t | dur | peak dBFS | rel VO | centroid Hz | measured shape | on screen / line | conf |
|---|---|---|---|---|---|---|---|
| 0.07 | 0.51 | -22 | -5 | 1023 | slow-attack burst from frame 2 | man raises shotgun, "He loaded the shotgun" | med |
| 1.35 | 1.27 | -11 | +6 | 453 | loud blast with tail (peak 1.96) | muzzle flash, "with gold and fired it" | high |
| 3.15 | 0.24 | -11 | +6 | 1541 | loud bright impact | gold spatters on rock wall, "of the mine" | high |
| 3.76 | 0.07 | -27 | -10 | 1468 | tick | cut to buddy, "His buddy" | low |
| 4.64 | 0.96 | -26 | -10 | 1107 | 4 small broadband bursts | "watches the gold vanish into the rock" | med |
| 6.76 | 0.10 | -26 | -9 | 293 | knock | buddy speaks, "So we're shooting" | low |
| 7.36 | 0.07 | -27 | -10 | 838 | knock | "gold" | low |
| 7.90 | 0.73 | -12 | +5 | 817 | second blast | wall behind buddy cracks, "into a gold mine?" | high |
| 9.08 | 0.13 | -20 | -4 | 526 | pop | cut to tunnel, "You see" | med |
| 10.38 | 0.44 | -27 | -10 | 1620 | bright swish x2 | cut to rock pile outside, "He's dug" | med |
| 11.56 | 0.04 | -29 | -12 | 898 | tick | "for 10" | low |
| 12.04 | 0.30 | -17 | 0 | 187 | low thud | mine cart tips its load, "years" | high |
| 14.01 | 0.57 | -29 | -12 | 376 | low-mid thump | poster shown, "And tomorrow" | low |
| 16.38 | 0.06 | -27 | -10 | 125 | low thud | cut to shop counter, "he spent" | med |
| 20.60 | 0.03 | -26 | -10 | 1241 | tick | white car arrives, "rolls up in a" | low |
| 26.16 | 0.82 | -13 | +4 | 419 | hard impact with debris | pickaxe, "He smashes a chunk of wall" | high |
| 34.00 | 0.10 | -21 | -4 | 251 | thump | macro of flattened flake, "shot this gold" | med |
| 35.56 | 0.09 | -26 | -10 | 423 | knock | "into the wall. But" | low |
| 36.16 | 0.05 | -27 | -11 | 1101 | tick | rich guy, "just laughs" | low |
| 37.10 | 0.13 | -25 | -9 | 372 | short burst in the gap | rich guy laughing | low (may be voice/laugh leakage) |
| 37.96 | 0.17 | -25 | -8 | 165 | low burst | "anyone shoot" | low (may be voice leakage) |
| 38.56 | 0.04 | -30 | -13 | 765 | tick | "gold into a wall" | low |
| 40.36 | 0.09 | -26 | -10 | 784 | knock | cut to buddy, "And his buddy" | low |
| 41.56 | 0.40 | -29 | -12 | 749 | small burst inside the 0.7 s comic pause | both conmen face camera, before "Completely insane." | med |
| 43.33 | 1.16 | -19 | -2 | 707 | swelling broadband flutter, wide (side -8 dB) | banknotes handed over and flying, "pays up" | high |
| 45.10 | 1.11 | -19 | -3 | 1788 | bright broadband run, wide (side -5 dB) | they run out with cash, cut to mine exterior, "those two bolt with the money" | high |
| 47.25 | 0.78 | -26 | -9 | 1577 | slow-attack whoosh | "pulls a stick of dynamite out of his suit" | med |
| 49.36 | 0.19 | -29 | -12 | 833 | knock | "He's never mined" | low |
| 51.16 | 0.75 | -28 | -11 | 3177 | bright hiss | fuse lit, "he just lights it" | high |
| 52.27 | 0.16 | -26 | -9 | 1562 | bright swish | "tosses it down the tunnel" | med |
| 54.46 | 1.06 | -15 | +2 | 1201 | explosion (peak 55.11) | fireball at mine mouth, "and runs. And when the dust" | high |

After 55.5 s there is no strong cue: the final line plays over music only.

Ambience bed: none measurable. Sub and low bands of the bed stem are busier than in the other two videos (20-200 Hz RMS -37 dBFS without SFX frames vs -40 and -46), which may be a low music part, mine rumble or voice residue: NOT DETERMINABLE. Nothing changes at the cuts between mine interior, exterior and shop.

### SFX categories seen across the three (strong cues only, 94 total)

| Shape class (heuristic, `cue_table.py: shape()`) | Count | Typical level rel VO | Typical length | Seen on (VISUAL) |
|---|---|---|---|---|
| Low thud / boom / low-mid thump (low band dominant) | 27 | hero: +2..+8 dB; support: -4..-12 dB | 0.1-0.6 s | body hits, text slams, dropped objects, ladders, final button, low drum-like hits |
| Mid knock / pop / tick | 31 | -4..-13 dB | 0.03-0.4 s | small actions, cuts, punchline accents, taps |
| Bright swish / rustle / scrape / click (centroid > 1.5 kHz) | 14 | -5..-12 dB (rare hero +1..+6) | 0.1-0.4 s | cloth, doors, grinding, drill, gold spatter, fuse hiss |
| Whoosh / swell (attack 150-500 ms) | 7 | -4..-13 dB | 0.3-0.8 s | location jumps (aerial cut, night cut), fast gestures |
| Sustained / tail (>= 0.9 s) | 15 | -10..+6 dB | 0.9-1.9 s | shotgun, bench rip, echoing slap, explosions, cash flutter, marching rumble |

One tonal one-shot was confirmed separately (bell/ding at pink-prison 46.08 s, -8 dB rel VO, 0.5 s). The classes are assigned by rule from band levels, attack and duration; the class boundaries are soft.

---

## 6. Loudness, peaks, stereo, spectrum

All MEASURED on the delivered files.

| | pink-prison | one-cart | mine-salting |
|---|---|---|---|
| Integrated | -14.3 LUFS | -14.1 LUFS | -14.1 LUFS |
| Loudness range (LRA) | 2.2 LU | 2.9 LU | 2.7 LU |
| LRA low / high | -15.3 / -13.1 | -15.5 / -12.6 | -15.5 / -12.9 |
| Short-term (3 s) min / max | -16.5 / -12.4 | -16.2 / -12.0 | -17.1 / -12.5 |
| Short-term span | 4.1 LU | 4.2 LU | 4.7 LU |
| Momentary (400 ms) max | -10.8 LUFS | -9.6 LUFS | -9.7 LUFS |
| Momentary p5 / p95 | -17.9 / -12.0 | -17.8 / -11.5 | -18.6 / -11.3 |
| Momentary min (after 0.4 s) | -25.7 | -21.3 | -23.5 |
| True peak | -0.9 dBTP | -2.0 dBTP | -1.7 dBTP |
| Sample peak | -1.09 dBFS | -2.15 dBFS | -1.84 dBFS |
| RMS / crest factor | -17.0 dBFS / 15.9 dB | -17.0 / 14.9 dB | -16.7 / 14.9 dB |
| L/R correlation | 0.985 | 0.984 | 0.995 |
| Side minus mid (overall) | -21.3 dB | -20.9 dB | -25.9 dB |
| L minus R level | +0.07 dB | 0.00 dB | +0.01 dB |
| Spectral centroid | 864 Hz | 1205 Hz | 780 Hz |
| 95 % energy below | 5.5 kHz | 8.0 kHz | 4.5 kHz |
| Content above 16 kHz | none (-53 dB) | none (-73 dB) | none (-72 dB) |

Per-second momentary maxima are in `loudness.json` (`momentary_per_second`). The curve never leaves a band of roughly -17 to -10 LUFS after the first second; the lowest seconds are the comic pauses (pink-prison 36-37 s "Wait, what?" -16.7; mine-salting 42-43 s "Completely insane." -17.1).

Octave-band energy relative to total (dB):

| Band | pink | cart | mine |
|---|---|---|---|
| 20-60 Hz | -14.9 | -19.1 | -19.8 |
| 60-125 Hz | -14.6 | -15.6 | -15.2 |
| 125-250 Hz | -3.5 | -3.4 | -3.4 |
| 250-500 Hz | -5.7 | -6.2 | -5.7 |
| 500-1000 Hz | -10.2 | -9.8 | -9.5 |
| 1-2 kHz | -14.2 | -14.6 | -14.2 |
| 2-4 kHz | -16.6 | -17.2 | -16.4 |
| 4-8 kHz | -14.2 | -12.7 | -14.1 |
| 8-16 kHz | -15.8 | -13.0 | -17.7 |

The three are within 1 dB of each other from 60 Hz to 4 kHz: this is the voice chain's signature (energy centred 125-500 Hz, a presence/air lift at 4-8 kHz that is level with or above 2-4 kHz). Hard low-pass at 16 kHz (codec or export).

Stereo: effectively a mono mix with the voice dead centre. Width comes only from the bed. Side-minus-mid by band shows where: pink-prison is widest at 4-16 kHz (-11 to -12 dB; voice sibilance shows up in the side channel there, so the voice has some stereo high-frequency processing or reverb, or it is a codec effect: NOT DETERMINABLE) and at 20-60 Hz (-14 dB, the big wide boom at 27-28 s). one-cart is widest at 20-125 Hz (-10 to -13 dB, wide low SFX). mine-salting is narrow everywhere (-20 to -32 dB).

**Delivery target for a replica:** -14 LUFS integrated (+-0.3), true peak <= -1.0 dBTP, LRA 2-3 LU, short-term span <= 5 LU, momentary max about -10 LUFS, 44.1 or 48 kHz stereo AAC, mono-compatible (correlation >= 0.98).

---

## 7. Replication spec

### Track layout

| Track | Content | Pan | Level |
|---|---|---|---|
| VO | One narrator, including all character quotes (done as pitch/attitude changes of the same voice) | centre, mono | -14.5 LUFS integrated on its own; RMS about -17 dBFS; frame p95 about -12 dBFS; sentence-to-sentence variation <= 1.5 dB |
| MUSIC | One light minor-key staccato comedy/suspense cue (or 2-4 edited sections) | stereo, narrow | 22-25 dB under VO RMS: about -39 to -42 dBFS RMS, roughly -36 to -39 LUFS. Section changes of 6-12 dB allowed on story turns |
| SFX-HERO | Booms, slams, blasts, explosions, crashes | centre; long tails may be wide | peaks +2 to +8 dB over VO RMS (bed-stem frame peak -9 to -15 dBFS), 0.2-1.9 s, 3-7 per 60 s |
| SFX-SUPPORT | Thuds, knocks, pops, swishes, clicks, whooshes, fuse hiss, cloth, cash flutter | centre or slightly wide | peaks 4-13 dB under VO RMS (-21 to -30 dBFS), 0.03-0.8 s |
| AMB | none measured in the references | - | omit, or keep below -64 dBFS if a scene needs it |

Master: sum should land at -14 LUFS with VO alone already at -14.5. Limit to -1 dBTP. No audio above 16 kHz is needed.

### Timing rules (measured)

- VO starts at 0.12-0.16 s. Music starts with it (0.0-0.08 s). No intro.
- VO rate 211-227 wpm, flat across the video. Sentence gaps 0.15-0.30 s. No gap over ~0.4 s except one deliberate comic beat (<= 0.7 s) per video at most.
- End 0.1-0.4 s after the last word, hard cut, no fade, music still playing. Either land the loudest SFX on the last words (2 of 3 references) or leave the last ~5 s free of SFX (1 of 3).

### Ducking

- None. Keep the music at a fixed level 22-25 dB under the VO. If a ducker is used anyway, limit it to <= 2 dB so the result matches the references.
- SFX are not ducked under VO either: hero hits sit over speech at up to VO+8 dB for 0.2-0.8 s while the momentary loudness stays under about -10 LUFS (the limiter catches the sum).

### Music changes

- Mark 2-4 section points on story turns (re-hook, time jump, tension build, payoff). Measured positions: one-cart 10 / 29 / 40 / 60 s of 67; mine-salting 14 / 35 / 43 s of 61. For a 30-40 s video that scales to 2-3 section points.
- In the tension section before a payoff the music can thin by ~12 dB to sparse low hits (one-cart 40-60 s), then return to full level on the payoff line.

### SFX frequency of use

| Shape class | Per 60 s: pink / cart / mine | For a 30-40 s video |
|---|---|---|
| Low thud / boom / thump | 4.6 / 14.4 / 5.8 | 3-9 |
| Mid knock / pop / tick | 4.6 / 10.8 / 13.8 | 3-9 |
| Bright swish / rustle / click / hiss | 5.5 / 3.6 / 3.9 | 2-4 |
| Whoosh / swell | 0.9 / 3.6 / 2.0 | 1-2 |
| Sustained / tail (blast, crash, explosion, flutter, rumble) | 3.7 / 5.4 / 4.9 | 2-4 |
| Tonal one-shot (ding, bell) | 0.9 / 0 / 0 | 0-1 |
| **Total strong cues** | **19.3 / 37.7 / 30.5 (3.2-6.3 per 10 s)** | **10-25** |

Placement rules visible in the data:

- Every on-screen physical impact that the narration names gets a cue within about +-0.1 s of the word (slams, smashes, blast off, rips, lights, tosses).
- On-screen text slams get a hero boom (pink-prison "300 lbs" at 25.5 s).
- Not every cut gets a whoosh. Whooshes are measured on big location jumps (aerial shot, cut to night), 1-5 per video.
- Punchlines often get a small pop or a short gap with a quiet foley sound (pink-prison 12.4 s, one-cart 12.3 s, mine-salting 41.6 s).
- Roughly 10 further quiet events per 10 s exist below VO-13 dB. Their nature was not verified.

---

## 8. Not determinable from these files

- Whether the narrator is human or synthetic, and male or female.
- Breaths, mouth noise, room reverb on the voice (the vocal stem decays about 20 dB in ~150-200 ms after words, which fits a dry or lightly processed voice, but the stem is not clean enough to measure a reverb time).
- Exact instruments, exact tempo, track identity, and whether music changes are edits, different cues or automation.
- Whether rain / wind / crowd / room-tone beds exist below about -64 dBFS.
- Whether the regular low hits in one-cart (43-59 s) are music or SFX.
- The identity of the ~40 weak candidates per video (quiet foley vs music accents vs separation leakage).
- Any SFX quieter than about VO-13 dB that sits directly under speech.
- The original mix's processing chain (compressor/limiter settings); only the outcome (LRA 2-3 LU, crest 15-16 dB) is measured.

---

## 9. Reproducing the measurements

Scripts in `tools/analysis/` (python3 + numpy; Pillow for frame strips):

| Script | Does | Output |
|---|---|---|
| `common.py` | WAV loading, STFT, band levels, stem loader | - |
| `transcribe.py` | faster-whisper word timestamps (needs `pip install faster-whisper`) | `_tmp/<v>.fw.json` |
| `make_transcripts.py` | builds transcripts, applies caption-checked corrections | `transcripts/<v>.json`, `.txt` |
| `separate.sh` | Demucs voice/bed separation (needs `pip install demucs soundfile`) | `_tmp/demucs_out/...` |
| `voice.py` | rate, pauses, pitch, levels | `voice_metrics.json` |
| `loudness.py` | ebur128, peaks, width, spectrum | `loudness.json` |
| `tonal.py` | stable 12-TET line detector (music evidence) | stdout |
| `music.py` | notes per section, tempo, bed level, ducking tests | `music_metrics.json` |
| `sfx.py` | SFX candidates on the bed stem | `sfx_candidates.json` |
| `cue_table.py` | strong merged cues + shape label | `sfx_strong_merged.json` |
| `sfx_frames.py` | video frame strips at each strong cue | `_tmp/sfxframes/` (copied to `sfx_frames/`) |
| `extras.py` | music-only level, envelope pauses, formants | `extras.json` |
| `script_stats.py` | text statistics | `script_stats.json` |
| `spectrograms.sh` | all PNGs in `spectrograms/` | PNG |

`reference/analysis/_tmp/` (WAVs, stems, models, venv) was emptied after the run. To re-run: extract WAVs (done automatically by `common.load`), run `transcribe.py` and `separate.sh` from a venv with those two packages, then the rest with system python.
