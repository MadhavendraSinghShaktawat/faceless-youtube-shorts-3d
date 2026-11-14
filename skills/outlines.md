# Outlines

Evidence: `research/outline-shader.md` (the technique, with tested code in `research/outline-shader/src/`), and the "Outlines/ink" section of each `reference/analysis/<video>.md`.

## The requested look

The owner asked for the outline from the YouTube tutorial "Stylized Cartoon Shader In THREE.JS (Full Explanation)". Its transcript was read in full. It teaches three things:

1. **Inverted hull.** A second copy of the mesh with a black unlit material, `side: THREE.BackSide`, and a vertex shader that pushes each vertex out along its normal: `position + normal * thickness`. The tutorial uses 0.02 and 0.01 as thickness.
2. **Toon shading.** `MeshToonMaterial` with a 3-pixel-wide `gradientMap` set to `NearestFilter`, which gives three hard light bands.
3. **Flattened textures.** Keep only the base colour map and simplify it offline (posterise or "cutout" filter) so it looks painted.

It does not use post-process edge detection.

## What the engine's version adds [tested on three.js r187]

- Works on skinned meshes, morph targets and instanced meshes.
- Two width modes: `world` (width in scene units, so the line thickens as the camera gets close, which matches the references) and `pixel` (constant on screen).
- Smoothed normals, so hard-edged meshes do not split at corners.
- Optional wobble for a hand-drawn feel.

Known failure of the tutorial's exact shader: on a glTF whose armature is scaled (commonly 100x), the outline explodes. Use `world` mode, which corrects for scale.

## Where outlines go [measured and seen]

| Element | Outline? | Width | Colour |
| --- | --- | --- | --- |
| Characters (head, torso, hats, hair) | Yes | 3 to 7 % of head diameter. Use 4 to 5 % | Dark plum `#2c1821`. Never pure black |
| Limbs | They are the line | Same width as the outline | Same |
| Face features | Drawn, not hulled | About 45 % of the outline width | Same |
| Hand props (gun, pan, dynamite, rope) | No **[seen in mine-salting and one-cart]** | | |
| Environment, buildings, terrain | No, in all three videos | | |
| Small debris and effect pieces | Yes in pink-prison (outlined cubes) | Thin | Same |
| Prop being explained | A gold highlight outline while it is named **[seen in one-cart]** | | Gold |

Measured widths on screen: 5 to 7 px on a full figure and 10 to 14 px in close-up at 720 px wide; 16 px on a 336 px head and 38 px on a 554 px head at 1080 px wide. The line scales with the character, so use `world` mode.

Inner lines on the world (brick joints, wood grain, rock cracks) are part of the texture. See `textures.md`.

## Using downloaded models

- A downloaded character or creature that must sit beside the stick figures: apply toon material plus hull outline at the same percentage width so it belongs.
- Downloaded environment pieces: no outline. Convert their materials to the flat or toon look instead.
- Thin or open meshes (leaves, cloth planes) give broken hulls. Leave them without an outline.

## Checks

- No gaps at sharp corners (turn on smoothed normals).
- No z-fighting flicker between hull and surface during camera moves: step through 10 consecutive frames of a fast move.
- The line is plum, not black, when sampled from a rendered frame.
