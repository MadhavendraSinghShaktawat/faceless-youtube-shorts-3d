# Captions

Evidence: "Captions" in each `reference/analysis/<video>.md`; per-card timings in `reference/analysis/pink-prison.captions.json`.

## Measured style

| Property | Value |
| --- | --- |
| Typeface | Heavy rounded geometric sans. Resembles Poppins ExtraBold or Black. Exact face **[unknown]** |
| Case | Sentence case, as spoken. Punctuation kept ("pink,", "shade.", "mine?") |
| Colour | White fill |
| Stroke | Black, about 0.75 % of frame width (5 to 6 px at 720 wide, about 8 px at 1080) |
| Shadow | Soft black, a few px down |
| Position | One centred line at 70 % of frame height (70.5 % in one-cart) |
| Size | Font size about 6.2 % of frame width (about 45 px at 720, about 67 px at 1080); a 9-letter word spans about 30 % of the width |
| Words per card | 1 to 3. Single words are 71 to 78 % of cards, two words 22 to 25 %, three words 3 to 4 % |
| Card length | Median 0.34 to 0.37 s; shortest 2 frames |
| Change | Hard swap on one frame. No pop, no scale, no fade, no highlight |
| Emphasis | None. No coloured words, no emoji, no background box |
| Gaps | None. A card stays until the next one replaces it |
| Numbers | Shown as numerals with units: "82", "300 lbs", "2 seconds" |
| Across scene joins | Captions follow the voice and ignore cuts and dissolves |

First card is on screen on frame 0.

## Building cards from the word timings

1. Take the word-level transcript of the user's voiceover.
2. Correct mis-heard words against the approved script before making cards. Two caption errors shipped in the references ("bottles," for "bolt with", "never mind" for "never mined"); do not copy that.
3. One word per card by default. Join into two words when a short function word leads into the next ("the gold", "of real", "in his life" is three). Never more than three, never more than about 12 characters plus a space.
4. Each card starts at its first word's start time and holds until the next card starts.
5. Keep sentence punctuation on the word it belongs to.
6. Numbers as numerals.

## Other on-screen text

There is no title, no watermark, no progress bar and no subscribe prompt in the references. All other text is inside the 3D world as props (`textures.md`).

## Font

Poppins is under the SIL Open Font License and can be bundled. The engine ships a local copy so renders do not depend on the network.

## Checks

- Take stills at five random times: exactly one line, centred, at 70 % height, readable over the background behind it.
- Nothing important in the scene sits behind the band from 65 to 75 % of frame height.
- Step through three card changes: one frame old, next frame new.
