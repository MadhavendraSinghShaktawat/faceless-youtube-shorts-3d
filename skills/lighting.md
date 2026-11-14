# Lighting and glow

Evidence: "Lighting & glow" in each `reference/analysis/<video>.md`; working code in `research/threejs-techniques.md`.

Bloom values below are **[choice]**: the analysts estimated them from the look. Everything about where glow appears and how large it is comes from frames.

## One key light, and you can see where it comes from [seen]

| Setting | Key | Shadows |
| --- | --- | --- |
| Cell | Sun through a barred window, drawn as striped shafts | Soft-edged, tinted blue or teal, never black |
| Day room | Skylights and tube lights | Pale blue `#8bb3cc` on a near-white floor |
| Fort, day | Sun, warm key with cool ambient | Soft |
| Fort, night | Lanterns, cool fog `#434c73` | Warm pools |
| Mine | 1 to 3 warm lamps (about 2700 to 3200 K look) with strong falloff | Blacks sit at dark brown `#221812`, not black |

Characters are not lit like the world. They stay flat and bright and take a tint from the scene (`characters.md`).

## Light you can see in the air [seen in all three]

- Window shafts: additive geometry at about 15 to 30 % opacity, striped by the bars.
- Lamp cones in the mine: additive cone at about 35 to 45 % opacity, colour near `#9e8a67`.
- Inside every shaft or cone: 20 to 40 slow dust motes. They are always moving, which helps the "nothing is ever still" rule.
- A backlit doorway gets one shaft card.

## Glow (bloom)

Where it appears **[seen]**: windows, tube lights, lanterns, wet paint in light, gold, fuse sparks, muzzle flash, explosions, rocket heads, red "rage" vein lines, a door opening onto light.

How big **[measured]**: halos of 20 to 40 px around bright sources at 720 px wide. Emissive cores are near white (`#fdf5be` to `#fffffe`).

Settings to start from **[choice]**:

| Parameter | Value |
| --- | --- |
| Threshold | about 0.85 |
| Strength | 0.4 to 0.6 in warm interiors, 0.6 to 0.9 in bright or pink scenes |
| Radius | about 0.5 |
| Flash spike | strength 1.5 to 2.5 for 2 frames on a gunshot or explosion, with a 4-frame white light flash |

Bloom only the things meant to glow. Keep the off-white heads below the threshold or every character will halo.

## Grade and vignette, per scene [seen]

- Each scene has its own colour cast: teal cell, hot magenta, baby pink, pale blue, indigo night, amber mine.
- Emotional beats shift the grade inside a shot: the rage beat in pink-prison adds a magenta-tinted vignette (about 0.6) and red veins.
- Corners: dark vignette indoors in mine-salting (corners at 30 to 50 % of centre brightness), almost none outdoors, blurred rather than darkened corners in one-cart.
- Time of day changes across a dissolve (day to night, night to sunrise), or drifts during a long orbit (day to dusk over about 1.6 s in one-cart).
- No film grain and no chromatic aberration were seen.

## Fog

Light exponential fog in the scene's tint. It separates depth layers and catches the shafts.

## Technical notes [tested, r187]

- `PCFSoftShadowMap` no longer exists; use `PCFShadowMap`.
- Toon shading with shadow maps gives a ragged shadow edge; `light.shadow.normalBias` of 0.08 to 0.12 cleaned it.
- Put anti-aliasing on the composer's render target (4 samples, half-float), not on the renderer.

## Checks

- Sample three pixels from a rendered still: shadow, midtone, highlight. The shadow must have a colour, not grey or black.
- One visible light source and one visible beam or cone in every interior.
- Compare against a reference still of the nearest matching setting before rendering the full video.
