# Motion and micro-interactions

Evidence: "Motion & micro-interactions" in each `reference/analysis/<video>.md`; 30 fps sheets in `reference/sheets/<video>/30fps/`.

## Two clocks [measured]

| Runs every frame (30 fps) | Stepped |
| --- | --- |
| Camera | Character poses: hold 2 to 15 frames (median about 4 in pink-prison; up to 30 in one-cart), then change in a single frame |
| Props in motion, doors, vehicles | Expressions: swap in one frame |
| Cloth, banners, grass, clouds | Talking mouths: new shape every 2 to 3 frames |
| Particles, dust, sparks, rain | Walks: 2 to 3 poses, 4 to 5 frames each |
| Light flicker, effects | Blinks: 2 to 3 frames, when used |

This contrast is the signature. Smoothly tweened limbs break the look immediately. Never interpolate a pose.

## Nothing is ever stale

The owner's rule, and the references agree: frame differencing found no static stretch in any of the three videos.

- Every shot starts with its motion already running. Start camera paths, particles and loops before the shot's first visible frame.
- Frame 0 of the video shows an action half done (the roller already on the wall, the drill already turning, the gun already loaded).
- During a held character pose, something else moves: the camera creep, dust, a swinging lamp, a flame, clouds, a prop still settling.
- When the narrator moves on, the image moves on within a few frames. No shot waits.

## Character acting between poses [seen]

- Anticipation is a pose, not a tween: one held wind-up pose for 2 to 4 frames, then the action pose.
- Pop-ups and entrances: slide in from a frame edge with one overshoot frame.
- Whole-figure tilt up to about 45 degrees for leaning, falling, shouting.
- Squash and stretch only on impacts, 2 to 4 frames.
- Runs use a smeared-leg pose **[seen in mine-salting]**.
- Fast actions take very few frames: a door slams in 2 to 3 frames, an arm-wrestle slam is 2 frames.
- No idle breathing loop was seen in one-cart. Do not add floaty idle motion to characters. Let the world carry the life.

## Micro-interactions worth copying [seen, with timestamps in the analyses]

- A prop is highlighted at the moment the narrator names it: gold outline, a white four-point glint, an emissive flash.
- An explainer cutaway: one rocket floats up and opens to show its inside while it is described (one-cart).
- A number or label appears in the world as an object, not as a caption graphic ("300 lbs", "10 FT" chalk mark, a stopwatch).
- Reactions are instant: the bystander's face changes on the same frame as the event.
- Small physical gags on the side: a head bumps a beam, a hand gets slapped.

## Effects vocabulary

| Effect | Recipe | Source |
| --- | --- | --- |
| Floor and wall cracks | Decal growing outward over about 8 frames | pink-prison |
| Rage veins | Jagged red emissive lines redrawn every 1 to 2 frames so they boil, with bloom | pink-prison |
| Debris | Outlined cubes or flat-shaded low-poly rocks on a simple arc | pink-prison, one-cart |
| Confetti or flakes | 60 to 100 quads, slow tumble, about 3 s life | pink-prison |
| Impact ring | Thin ring expanding over 4 frames | one-cart |
| Flash | 4-frame white light, bloom spike for 2 frames | pink-prison, mine-salting |
| Sparks, fuse | 12 to 16 radial dashes, white core with orange glow, gravity | mine-salting, one-cart |
| Trails | White soft ribbons with small bright heads | one-cart |
| Explosion | Clustered spheres with a 3-tone orange ramp (`#c14f18`, `#ee9220`, pale core) and a pale base ring | one-cart |
| Dust puff | Lingers about 1.5 s after an impact; a full-frame dust cloud can hide a scene change | mine-salting |
| Rain | About 25 thin streaks per frame at 30 to 50 % opacity, in front of the characters, with ripple rings | one-cart |
| Sparkle | Four-point star sprites near gold or when parts click into place | mine-salting, one-cart |

Not seen in any reference: speed lines, impact frames, smear frames on the camera, screen-shake that could be confirmed. Do not add them by default.

## Determinism

Every motion is a pure function of time `t`. No frame-to-frame state, no unseeded randomness, no real clock. Frames render out of order across workers, so anything that depends on the previous frame will break. Particle positions come from a seeded formula of `t`.

## Checks

- Difference consecutive frames across the whole render. Any pair with near-zero change is a fault.
- Step through a pose change at 30 fps: one frame old pose, next frame new pose, nothing in between.
- Watch the first 15 frames: is something mid-action on frame 0?
