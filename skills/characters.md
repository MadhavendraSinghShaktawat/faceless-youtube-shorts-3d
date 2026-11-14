# Characters

Evidence: section "Characters" in each `reference/analysis/<video>.md`; close-up stills in `reference/sheets/<video>/stills/`.

## What the references show

| Trait | Value | Tag |
| --- | --- | --- |
| Head | Plain circle, off-white fill (#fbfaf5), no nose, no ears | seen |
| Height | 3 to 4 heads (3.0 one-cart, 3.3 to 4 mine-salting, 3.8 to 4 pink-prison) | measured |
| Torso | Capsule or bean, about 1.15 heads tall and 0.65 wide; a heavy character is about 1.1 by 1.25 | measured |
| Limbs | Single dark strokes, same weight as the outline, round ends. Legs about 1.7 heads long | measured |
| Hands | Small filled balls, 2 to 2.5 stroke widths across | measured |
| Feet | Short stroke or tiny wedge; often just the line end | seen |
| Outline | Dark plum #301b25 / #2c1821 (one-cart reads near-black #1a1420). 3 to 7 % of head diameter, uniform, round caps | measured |
| Face | Two dot or oval eyes, brows as short strokes, mouth as a simple shape. Features drawn at about 45 % of outline weight | measured |
| Shading | Flat. At most a faint gradient. They take the scene's tint (pink room, blue dusk) instead of full lighting | seen |
| Shadows | They cast shadows on floors and walls | seen |
| Identity | Carried by one or two items: hat, hair shape, tie, moustache, uniform colour, badge. Costumes have flat colour or simple pattern | seen |

Whether the originals are 2D drawings placed in 3D or toon-shaded 3D shapes is **[unknown]**: two analyses read them as flat cut-outs, one saw them foreshorten correctly from directly above.

## How this skill builds them [choice]

A procedural 3D rig that reads as a 2D drawing from every angle. This satisfies both observations and needs no artwork.

- Head: sphere, unlit off-white, multiplied by the scene tint.
- Torso: capsule, flat costume colour (optional simple canvas-drawn pattern: stripes, buttons, badge).
- Arms and legs: thin tubes in the outline colour, radius equal to the outline width, with a joint at elbow and knee.
- Hands: small spheres. Hand props attach here. Props are shaded 3D objects with **no** outline **[seen in mine-salting]**.
- Outline: inverted hull, see `outlines.md`.
- Face: a canvas texture on a small camera-facing decal on the head, so the face always reads cleanly. Swap textures to change expression.
- Hats and hair: simple outlined meshes parented to the head.
- Shadow casting on.

The engine provides this rig. See `engine/README.md` for the exact calls.

## Expressions seen in the references

Neutral, half-lidded smug, angry (brows down, gritted teeth), wide-eyed shock, happy closed-eye smile with blush, laughing open mouth, worried, sleepy, grimace. Mouth shapes while talking: closed line, small open, wide open, "o", teeth grit, smile, frown (7 shapes listed in `mine-salting.md` section 3).

There is no lip sync. While a character is the one being quoted, swap the mouth shape every 2 to 3 frames **[measured]**. The narrator's lines move no mouths.

## Casting a video

1. List the roles in the script (the references use 2 to 5 speaking roles plus crowds).
2. Give each role one silhouette cue and one colour cue so they are told apart at thumbnail size: the tall top hat, the yellow beanie, the guard cap, the orange curly hair.
3. Keep bodies and heads identical in construction. Vary only height, torso width, costume and face.
4. Crowds: instanced copies of 3 to 4 variants with a small phase-offset bob; a far crowd can be one textured strip **[seen in one-cart]**.

## Acting

Stepped animation, covered in `motion.md`. In short: hold a pose 2 to 15 frames, change in one frame, never tween limbs. Whole-body moves are allowed between poses: tilt up to about 45 degrees, slide in from a frame edge, one overshoot frame on a pop-up, squash only on impacts.

## Checks before render

- Screenshot a close-up, a full figure and a wide. The outline must stay proportional to the head in all three.
- Compare beside a reference still. The head should be a clean circle with an even line and no shading bands.
- Every character readable against its background: light head on dark set, or a rim of bloom behind it.
