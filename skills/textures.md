# World and textures

Evidence: "World/environment & textures" in each `reference/analysis/<video>.md`. Sources and download commands: `assets.md`.

## What the sets are [seen]

- Real 3D rooms and landscapes the camera travels through: a cell block and day room, a hillside fort with gatehouse and walls, a mine tunnel with timber frames, a town street, farmland from the air.
- Simple, clean geometry with slightly chunky proportions. No fine mesh detail.
- No ink outline on any of it.
- Each story point is dressed with a readable text prop: a paint-recipe poster, "POD C", "C-4" on a cell door, a 1979 wall calendar, a newspaper front page, "SURE THING MINE EST. 1899", a dynamite label, a chalk "10 FT" mark. These carry exposition the narrator does not say.

## Texture styles, per reference

| Video | Surfaces | Style |
| --- | --- | --- |
| pink-prison | Painted block walls, concrete floor, steel doors | Flat colour with hand-inked tiling brick lines (running bond, about 2:1), mortar a few percent darker than the brick, slight value change per brick |
| one-cart | Ashlar stone walls, timber, tiled roofs, grass, terrain | Stylised PBR: tiling stone with a normal map, very dense instanced grass with tip-to-base gradient `#97c255` to `#2b5520`, cloud sprites |
| mine-salting | Sandstone, planks, rail ballast | Hand-painted: speckled rock with thin dark crack lines, clean wood grain |

So the world can sit anywhere from flat-inked to stylised PBR. Characters stay flat in all three. Pick one treatment per video and hold it.

## Rules

1. Base colour does the work. Use the albedo map; add a normal map only where the reference look needs relief (stone walls). Drop metalness and heavy roughness detail.
2. Flatten downloaded textures so they read as painted: reduce to a few values (posterise), lower contrast, keep large shapes. `research/outline-shader.md` lists the offline filter options; ImageMagick or `sharp` can do it from the command line.
3. Tile sizes stay large on screen. A brick should be at least as wide as a character's hand at mid-shot. Fine noise shimmers when the camera moves, and the camera always moves.
4. Textures at 1024 px are enough for tiling surfaces at 1080x1920. Use 2048 px only for a hero surface the camera pushes into.
5. Make text props as canvas textures drawn in code: exact wording, exact fonts, no licence questions. Keep text large enough to read at phone size, and never place it under the caption band (65 to 75 % of frame height).
6. Colour comes from a small palette per scene. Sample the anchors from the reference analyses when the setting is similar:
   - Prison teal `#376270`, hot pink `#e926a1`, baby pink `#f185b6`, day room `#88a9bc`, floor `#dae5e4`
   - Fort: sky `#458de2`, grass `#97c255`, dusk `#aa8ca0` to `#efdcce`, night fog `#434c73`
   - Mine: lit rock `#92571f`, shadow rock `#44220e`, plank `#8c4e1d`, gold `#d5a913`, paper `#faf2ca`

## Building a set

1. From the shot plan, list each location and what the camera must see there. Build only that. Walls the camera never faces do not exist.
2. Block the set from primitives first (boxes, planes, cylinders) and take stills. Fix scale and staging before any texture.
3. Then dress it: tiling textures, a few downloaded props, the text prop, one light source the viewer can see.
4. Add at least one foreground element per setup for depth (`depth.md`).
5. Something in the set must be moving before the camera arrives: dust in a light shaft, a swinging lamp, drifting clouds, grass in wind, a flickering flame (`motion.md`).

## When no model exists

Follow the ladder in `assets.md`: search the listed free sources, then build the object from primitives in code (most props in this style are a handful of boxes and cylinders with flat colour), and only then ask the user.
