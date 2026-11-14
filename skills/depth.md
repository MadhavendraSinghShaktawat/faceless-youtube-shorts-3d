# Depth

Evidence: "Depth" in each `reference/analysis/<video>.md`.

The characters are flat. The sense of space comes from everything around them.

## Lens and position

- Wide lens held close. A vertical field of view of 55 to 70 degrees fits the look **[choice, estimated by all three analysts; the real lens is unknown]**.
- Get a close-up by moving the camera in, not by narrowing the lens **[seen]**. This keeps the wide-angle stretch on near objects.
- Usual angle: camera at 0.3 to 0.6 of character height looking slightly up, 20 to 35 degrees off-axis so a corner of the room shows two walls **[seen in pink-prison]**. Mine interiors: slightly above head height looking down 10 to 25 degrees. Low angle for arrivals and power.

## Layers

Every setup has three **[seen]**:

1. **Foreground**: something near the lens, partly out of frame and soft. A door edge, a cart wheel, a table corner, grass blades, a lamp, a shoulder.
2. **Subject**: the character or the prop being explained.
3. **Background**: the set receding, lit differently from the subject, with haze.

Because the camera always moves, the foreground slides against the background. That parallax is the main depth cue. A setup without a foreground object looks flat no matter what else is done.

## Depth of field

| Situation | Blur | Tag |
| --- | --- | --- |
| Wides | None or minimal | seen |
| Close-ups and macro inserts (pan of gold, arrow tips, paint tin) | Yes, moderate; background clearly soft | seen |
| Fast push-ins | Light, about 3 to 5 px at 720 px wide at most | measured |
| Foreground objects | Soft | seen |
| Frame corners in wides (one-cart) | Blurred instead of darkened | seen |

Keep the caption band sharp-backed: avoid busy in-focus detail behind 65 to 75 % of frame height.

## Atmosphere

- Scene-tinted fog so distant walls and hills fade (`lighting.md`).
- Light shafts and dust between camera and subject.
- Outdoor distance: layered hills, cloud sprites, far crowds as a strip.

## Motion blur

Mixed evidence: none at all in one-cart, even on a 0.6 s flight over a wall; present on the whip pan in pink-prison and on fast moves in mine-salting.

**[choice]** Leave it off by default. Turn it on only for the frames of a whip pan or an object-follow shot. It is done by sub-frame accumulation (8 samples), which multiplied draw time by about 8 in testing, and history-based blur passes break because frames render out of order.

## Lens distortion

None measured. Do not add barrel distortion.

## Checks

- Cover the character with your thumb on a still. If the frame still shows near, middle and far, the depth works.
- Step 10 frames of any shot: the foreground must shift against the background.
