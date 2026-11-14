# one-cart.mp4 — frame-level style analysis

Source: `reference/source/one-cart.mp4`, 720x1280, 30 fps, 2005 frames (f0-f2004), 66.8 s. "How One Cart Stopped an Entire Army".

Evidence used: all 34 sheets in `reference/sheets/one-cart/10fps/`; 30 fps sheets in `reference/sheets/one-cart/30fps/` (read: t0.0, t1.0, t2.0, t4.5, t5.6, t25.0, t26.0, t28.6, t30.3, t36.4, t43.0, t50.4, t60.0, t63.3, t64.3, t65.8); 12 full-res stills in `reference/sheets/one-cart/stills/`; a per-frame luminance-difference pass over all 2005 frames (90x160 grey, caption band masked).

Precision: times checked at 30 fps are given as frame numbers. Times seen only on 10 fps sheets are accurate to about +/-0.1 s (3 frames) and are marked with "~". Hex colours are 5x5-pixel averages from JPEG stills, so they include compression and scene lighting.

## 0. Headline findings

- **No hard cuts: confirmed.** The largest frame-to-frame differences in the whole file are inside two continuous camera moves (f61-f72 and f1616-f1620), not at edits. Every change of setup is a short **cross-dissolve of 4-8 frames (0.13-0.27 s)**. I counted **18 dissolves, giving 19 takes**. There are no whip-pan wipes, object wipes or match cuts.
- Day to night (f866-f873), night to sunrise (f1100-f1108) and every other time change is the same plain dissolve; the scene lighting itself does not animate across the change. The one exception is the dusk shift at ~22.4-24.0 s, which happens inside a continuous orbit with no dissolve.
- Inside takes the camera does long continuous moves, including two "hyper" fly-throughs (wall to valley in 0.6 s; through the fan of fuses).
- **The camera is never still.** There is no run of even 6 consecutive frames with near-zero motion anywhere in the file.
- Characters are **flat 2D drawn cut-outs** standing in a **fully 3D, PBR-style world**. Environment has no outlines; characters and only characters have thick ink lines.
- Captions are 1-3 words, hard-swapped on a single frame, fixed position, no animation.

## 1. Shot / beat list

25 beats in 19 takes (a "take" is the span between dissolves; S01-S02, S07-S10, S11-S12, S20-S21 are continuous takes split here for readability). The same data is in `one-cart.shots.json`.

| id | t_start | t_end | location | what happens | camera | transition out | captions |
|---|---|---|---|---|---|---|---|
| S01 | 0.00 | 2.00 | Outside fort wall, grass at foot of grey stone wall (day) | Inventor (crimson quilted robe, white headband) leans in cranking a brace drill into a yellow perforated board; snap-in to macro of the bit, chips and sawdust fall; bit withdraws f56-f59. | Slow push-in already moving at f0 (0-1.0s); fast push-in f30-f39 (0.3s, ease-out) to macro; slow drift 1.3-2.0. Wide lens, low height. | No cut: camera sweeps right and rockets up the wall (continuous move into S02) | He drilled 82 holes into the wood |
| S02 | 2.00 | 4.75 | Up the fort wall, over pagoda gatehouse, out over the valley, down to the dirt road | Camera reveals the valley; enemy column with dust trail on a road; arrives in front of general on red palanquin under a parasol, soldiers marching toward camera. | Hyper-fast crane up + fly-over f60-f78 (0.6s, largest frame deltas in the video, every frame sharp/no motion blur), then dive/push toward the column 2.6-3.3, then slow pull-back/drift 3.3-4.7 as army walks at camera. | Cross-dissolve f140-f146 (~0.2s) | because down the hill an army is marching straight |
| S03 | 4.75 | 5.85 | Road below the fort, side-on | General points sword at the fort on the hill; soldier walks; dust puff behind. | Slow lateral drift/push, fort soft in background (DOF). | Cross-dissolve f174-f180 | for his fort. And while |
| S04 | 5.85 | 7.85 | Fort courtyard by the arch gate | Soldiers sharpen swords at a grindstone with sparks; pan passes several soldier types and ends on two smirking at screen-left. | Continuous lateral truck/pan left with slight push, constant speed, ~2s. | Cross-dissolve ~f234-f240 | everyone else sharpens swords, he's in the corner, |
| S05 | 7.85 | 13.00 | Courtyard corner, grass, lit arch with volumetric shaft behind | Inventor crouched drilling; commander (grey helmet, red plume, navy studded armour, red skirt) walks in at 9.3 and talks; gold wood shavings spiral up 11.3-12.6; inventor lifts the board. | Slow orbit right 8.0-9.2, then slow push on two-shot 9.5-12.5 (lowest-motion stretch of the first half). | Cross-dissolve ~f387-f393 | still drilling. His commander asks, Are we fighting them or grating cheese? But it gets |
| S06 | 13.00 | 14.20 | Same spot, reverse angle (wood palisade + red cone tower behind) | Commander leans in tilted; inventor holds up the holed board, flips it. | Slow push. | Cross-dissolve ~f423-f432 | weirder. He bolts |
| S07 | 14.20 | 20.20 | Cart on grass, then macro on the board | Board snaps onto cart frame with a gold outline highlight; arrows with paper tubes fly in and slot into holes (one, then many, with glints); a gold fuse string drops from each. | Slow push 14.4-15.5; fast push-in 15.5-16.2; continuous macro orbit from front to behind the board with tilt-down along the shafts 16.0-20.2. | No cut (continuous) | the wood onto a cart and into every hole goes something long and thin. Wrapped in paper, each with a string. |
| S08 | 20.20 | 24.00 | Cart rear / grass, courtyard | Pull back reveals inventor twisting strings; onlookers gather; fuse bundle sweeps over the grass and coils into a rope coil; inventor stands over it glaring. | Pull-back + orbit right 20.2-21.9; tilt down/up on rope 22.0-22.4; ~120 degree orbit around inventor 22.4-24.0 while sky turns dusk purple. | No cut (continuous) | Then he twists all the strings into one rope nobody's allowed to touch. |
| S09 | 24.00 | 26.00 | Same, dusk | Kettle-hat soldier bends and reaches; anger FX on inventor (red lightning lines, black aura, ground cracks, rocks fly); slap = pink/red shockwave ring f777-f780; helmet flies off. | Slow drift, then pulling back from 25.1; begins fast pull-back at 25.9. | No cut (continuous) | One soldier reaches for it and he slaps |
| S10 | 26.00 | 28.95 | Wide of fort exterior, cracked ground slabs, dusk | Fast pull-back and rise reveals whole fort, ground split into slabs, crack up the wall, helmet tumbling to f809, onlookers on wall and ground react; inventor holds rope coil. | Fast dolly-out + crane up 26.0-27.0 (ease-out), settle 27.0-28.3, slight push-in 28.3-28.9. Peripheral blur at frame edges. | Cross-dissolve f866-f873 (~0.23s), day to night | his hand so hard the whole fort hears it. That night, |
| S11 | 28.95 | 33.70 | Wall-walk at night in rain, pagoda, lanterns | Push to face: raindrop hits forehead f880-f885, eyes pop wide; coat comes off in one frame (f915), flies as cloth over the cart f915-f930; he hops onto the cart and lies on it. | Fast push-in to CU 29.1-29.5, hold CU 29.5-30.2, fast pull-back/crane 30.2-32.4, near-hold 32.4-33.6. | No cut (continuous) | it pours. So he throws his coat over the cart and lies on top of it like a human umbrella. |
| S12 | 33.70 | 36.80 | Same, closer low angle | Kettle-hat soldier rises into frame with a lantern; inventor rants from the cart ('we're all dead'), throws arm out. | Orbit right + push-in 33.7-34.3, then two-shot hold with slow drift 34.3-36.7. | Cross-dissolve f1100-f1108 (~0.27s), night to sunrise | One drop gets in there and we're all dead. The next morning, |
| S13 | 36.80 | 39.05 | Wall-walk at sunrise | Inventor asleep on the cart; ladder tops pop up over the parapet one by one; he wakes at 38.0. | Very slow push (second-lowest motion in the video). | Cross-dissolve ~f1167-f1173 | ladders slam against the walls and the |
| S14 | 39.05 | 40.40 | Field, low in the grass | Army charges at camera; general screaming under parasol; yellow chevron shields, flags, dust haze. | Low dolly-in + tilt up. | Cross-dissolve ~f1209-f1215 | army charges. Everyone |
| S15 | 40.40 | 43.40 | Wall-walk, bright day | Commander (with torch) and red-bearded soldier yell at deadpan inventor (now in cream tunic); kettle-hat soldier behind; cart behind. | Continuous slow push-in from full-body four-shot to MCU two-shot, slight orbit; wide lens low. | Cross-dissolve f1300-f1305 | screams at him to do something, but he just watches them get |
| S16 | 43.40 | 45.10 | Over the parapet looking down at the field | Dense army band with flags; enemy soldier pops up over the ledge 44.0-44.3 with arm overshoot, grins. | Slow push/tilt. | Cross-dissolve ~f1350-f1356 | closer and closer until they're |
| S17 | 45.10 | 46.90 | Field, low in grass | Army packed in rows; big yellow boar flags slide into right foreground. | Slow truck right + push. | Cross-dissolve ~f1404-f1410 | packed shoulder to shoulder, close enough |
| S18 | 46.90 | 48.40 | Front rank close-up, low angle | Four soldiers grin and laugh, teeth showing; sun flare upper left. | Slow push-in to faces. | Cross-dissolve ~f1449-f1455 | to see their teeth. That's when |
| S19 | 48.40 | 50.80 | Wall-walk, day | Inventor rips coat off the cart (cloth flies out of frame in ~8 frames) revealing rocket box; commander's eyes pop; torch lights the rope at f1514-f1516. | Slow push-in. | Cross-dissolve f1521-f1527 with a radial light-streak overlay at f1521 | he rips off the coat and lights the rope. The spark |
| S20 | 50.80 | 55.30 | Macro behind the cart | Spark climbs the twisted rope (rope chars black behind it), splits into ~82 glowing points racing along the fan of strings; camera flies through the fan among the rocket ends. | Slow push/tilt 50.9-52.0; accelerating push + tilt up 52.0-53.5; push-through the fan 53.5-55.2 (second-fastest motion, f1616-f1620); whip tilt back 55.2-55.4. | No cut (continuous) | races down it and splits into 82 tiny flames, and each one hits |
| S21 | 55.30 | 58.60 | Behind the board looking over the wall to mountains | One rocket-arrow rises out of the board as an explainer prop: cutaway windows show powder; arrowhead glows gold on 'arrow,'; it shrinks back into its hole with a star glint. | Push-in on rocket 55.4-56.0, slow pull-back/down 56.0-57.7, hold with slow push 57.8-58.5. | Cross-dissolve f1755-f1761 | a tube of gunpowder strapped to an arrow, turning every one of them |
| S22 | 58.60 | 60.40 | Wall-walk, day | Inventor and nervous commander beside the cart; board face blooms white-yellow, spark shower, tan smoke puff. | Slow push/drift, very wide lens. | Cross-dissolve f1810-f1814 | into a rocket. All 82 |
| S23 | 60.40 | 63.65 | Behind the cart, then out over the parapet and valley | Rockets blast through the crenel; white smoke cone with gold heads; sky fills with criss-crossing white ribbon trails over the valley. | Hold 60.5-60.7; whip forward through the crenel following the rockets 60.7-61.4; slows and tilts up 61.5-63.5. | Cross-dissolve f1907-f1913 | blast off the card at once, flying every which way. But with the army |
| S24 | 63.65 | 65.40 | High view from the wall onto the army line | Small orange explosions pop along the line f1916-f1928, merge, one big central blast f1931-f1938; gold zigzag spark rises; ladder hooks in foreground. | Slow push, then pull-back/tilt-up with the blast. | Cross-dissolve f1958-f1965 | packed that tight. Not a single |
| S25 | 65.40 | 66.80 | Battlement, inventor centred, mushroom cloud behind | Inventor stands arms crossed, half-lidded, smirk and brow shift at f1989; cloud boils slowly. | Very slow push-in; holds to last frame f2003, no fade, no end card. | End of file (hard end) | one misses. |

Dissolves verified frame-by-frame at 30 fps: f140-f146, f174-f180, f866-f873, f1100-f1108, f1300-f1305, f1521-f1527, f1810-f1814, f1907-f1913, f1958-f1965. The other nine (marked "~") were located on 10 fps sheets, where one or two blended tiles are visible; their exact first/last frame is not determined.

Take lengths: shortest 1.1 s (S03), longest 14.75 s (S07-S10, 14.20-28.95 s), mean 3.5 s.

## 2. Camera

### Move catalogue

| Move | Count | Typical duration | Where |
|---|---|---|---|
| Slow push-in (creep) on a staged group or prop | ~14 | 1.0-3.0 s | S01 start, S05, S06, S13, S15, S16, S18, S19, S21 end, S22, S24, S25 |
| Fast push-in / snap to close-up or macro | 4 | 0.25-0.7 s | f30-f39 (drill), ~15.5-16.2 (board), 29.1-29.5 (face), ~55.4-56.0 (rocket) |
| Fast pull-back / crane-out reveal | 3 | 0.5-1.0 s, then 1-2 s settle | ~20.2-21.9, 26.0-27.0, 30.2-32.4 |
| Orbit around subject | 4 | 1.2-4 s | ~8.0-9.2, 16.0-20.2 (macro, front to back of board), ~22.4-24.0, 33.7-34.3 |
| Lateral truck / pan | 3 | 1.1-2.0 s | S03, S04, S17 |
| Low dolly-in with tilt-up | 1 | 1.3 s | S14 |
| Hyper fly-through (crane + travel through space) | 3 | 0.6-1.7 s | f60-f78 wall to valley; ~53.5-55.2 through the fuse fan; 60.7-61.4 through the crenel after the rockets |
| Tilt down/up on a prop | 2 | 0.4 s | ~22.0-22.4 (rope), ~55.2-55.4 |
| Near-hold (drift only) | 5 | 0.7-1.8 s | 10-12 s, 29.5-30.2, 32.4-33.6, 34.3-36.6, 37.0-38.9, 49.2-50.6 |

### Stillness

- Fully still: **never**. Minimum masked frame difference is 0.35 (scale 0-255), median 8.6. No duplicated frames, so the picture is rendered on ones at 30 fps.
- Lowest-motion seconds (mean diff): 11-12 s (1.7), 35-36 s (1.9), 37-38 s (1.9), 66 s (2.3), 49-50 s (2.4), 10-11 s (2.6). In these the camera still creeps; characters hold poses.
- Longest near-hold: about 1.8-2.0 s (10.4-12.4 s two-shot, and 37.0-38.9 s sunrise).
- Highest-motion seconds: 2-3 s (25.4), 53-54 s (24.2), 20-21 s (21.7), 19-20 s (19.0).

### Character of the moves

- Frame 0 is already moving (slow push with slight orbit, visible parallax between character, board and wall across f0-f29).
- Moves are smooth, spline-like virtual camera paths. No handheld shake, no visible roll. Mild dutch only as a by-product of low wide-angle orbits (S15, S22).
- Fast moves ease out into a slow creep rather than stopping (f30-f36 accelerate, f39-f45 settle). The final frame f2003 is still creeping.
- **No motion blur on camera moves.** Every frame of the 0.6 s wall-to-valley flight (f60-f78) is sharp. The only softness on fast moves is at 26.0-26.2, where the image looks low-detail/smeared for ~6 frames.
- Lens feel: wide (roughly 18-24 mm equivalent) almost everywhere, with strong perspective convergence on the wall-walk and macro shots; camera usually low (knee to chest height) looking slightly up. Close-ups are done by moving the wide camera close, not by a long lens. Exact focal length: not determinable from frames.

## 3. Motion and micro-interactions

- **Two clocks.** Camera, 3D props, cloth, particles and grass update every frame (30 fps). Characters are pose-to-pose: a pose holds for 5-30+ frames with no in-betweens, then pops to the next pose in a single frame. Examples: eyes half-lid to wide at f884-f885; coat on/off at f915; commander's eyes pop at ~48.9.
- **Idle:** none visible. Across f1512-f1521 both characters are pixel-stable apart from camera motion. No breathing, no sway.
- **Blinks:** rare and drawn as an expression swap (eyes become flat lines for 2-3 frames at f1094-f1096; ~32.5-32.6). No regular blink cycle.
- **Mouths:** small set of swapped shapes, changed every 2-3 frames during on-screen speech (commander 9.9-12.4 s; inventor 34.0-36.3 s; soldiers 41-43 s). Shapes seen: short flat line, small "o", tongue-out concentration dot, open D with red interior + teeth row + pink tongue, gritted-teeth bar, wide grin with teeth, curved smirk line. Lip-sync is approximate.
- **Limbs:** arms and legs are single black strokes that re-draw per pose (bend at one elbow/knee). Walks are a 2-4 pose leg swap with vertical body bob (soldier at 5.0-5.5 s changes leg pose every 1-2 frames; crowd at 39-40 s bobs).
- **Whole-body transforms** do the acting: lean/tilt of the entire sprite (commander tilts toward inventor at 13.0-13.9; reaching soldier rotated ~45 degrees at 24.4-25.0), translate-in from off-screen (commander walks in at 9.3; soldier rises from bottom edge 34.2-34.4 and 44.0-44.2).
- **Anticipation/overshoot:** one clear case, the enemy pop-up at 44.0-44.3 (arms fling up at 44.2, settle on ledge at 44.3). Squash/stretch: not observed beyond that; heads keep their shape.
- **Props (3D, on ones):** drill crank rotates smoothly; board flips and snaps to the cart with a gold outline highlight (~14.3); arrows fly in and seat into holes with white star glints (15.9-19.4); fuse strings drop as glowing gold lines (19.4-20.2); strings gather into a coil (22.0-22.4); helmet tumbles for ~1 s (f777-f809); coat is a simulated-looking cloth that arcs over the cart in 15 frames (f915-f930) and whips away in ~8 frames (~48.9-49.1); explainer rocket rises, opens cutaway windows, arrowhead flashes gold, sinks back (55.4-57.7).
- **Secondary/background life:** dense 3D grass with per-frame shimmer; torch flame flickers every frame; lantern glow constant; banners/flags mostly rigid (large boar flags sway slightly at 45.6-46.8); clouds static or very slow; dust haze behind the army is a soft static-looking volume.
- **FX:**
  - Wood chips: small white quads plus tan streaks falling from the bit (1.3-1.9 s); gold spiral shavings rising (11.3-12.6 s).
  - Grindstone sparks (S04).
  - Anger: red hand-drawn jagged lightning lines over body and ground, black soft aura ~40 px wide, headband tails stand up, ground cracks, low-poly rocks fly, grass darkens (f753-f777).
  - Slap: expanding pink/red ring over 4 frames (f777-f780).
  - Rain: thin vertical streaks, roughly 2 px wide and 40-250 px long, semi-transparent blue-white, ~25 visible per frame, drawn in front of characters; faint ripple rings on the stone; one hero raindrop as a grey glossy sphere sliding down the face (f880-f897).
  - Fuse spark: white-hot point with star glints; rope swaps from gold to charred dark grey behind it (51.3-52.0); the split becomes many glowing dots with bloom halos.
  - Launch: overexposed white-yellow board face, orange spark shower with gravity, tan smoke puff, horizontal blast streak (60.7), white smoke cone.
  - Rocket trails: thick white soft ribbons with tiny glowing heads; trail ends show angular polyline kinks (62-63.5 s), i.e. ribbon/trail geometry.
  - Explosions: orange cel-banded puff clouds with white-yellow core; small ones pop along the line f1916-f1928, big one f1931-f1938; gold zigzag rising spark; final mushroom cloud with white base ring.
  - Speed lines: none as overlays. Smears: none on characters.
- **Crowds:** identical character sprites instanced in rows; near ranks are full sprites with individual expressions, mid ranks repeat 3-4 variants, far ranks collapse to a textured band of tiny figures with flags (43.5-45.0, 61-64 s). Crowd motion is a small per-sprite jitter/bob.

## 4. Characters

- **2D or 3D:** 2D drawn sprites placed in the 3D scene as flat planes. Evidence: always drawn front/three-quarter with no perspective change when the camera orbits; grass blades overlap their feet; they cast soft blob shadows on the ground; outline thickness scales with distance. Whether the planes are strict camera-facing billboards: not determinable, but no edge-on foreshortening is ever visible.
- **Turning:** they do not rotate in 3D. Direction changes are sprite swaps or mirror flips, plus in-plane tilt.
- **Construction:**
  - Head: near-perfect circle, white fill, the largest element.
  - Torso: elongated capsule/bean, about 0.75 head wide and 1.2 heads tall, filled with a fabric texture (diamond quilt, ribbing, studs, lamellar) and a soft vertical highlight.
  - Arms: black strokes ending in a round black ball fist. No fingers.
  - Legs: two black strokes with a knee bend and a short foot tick. No shoes.
  - Face: solid black oval eyes (about 8% of head diameter wide), separate thick brow strokes, tiny mouth, no nose, no ears. Hair/beard are hatched scribble patches with spiky edges.
- **Proportions:** about 3 heads tall (head 1.0, torso ~1.2, visible legs ~0.9). In MS the head is ~230 px across (still 0.67 s); in CU ~380 px (still 29.7 s).
- **Expression list:** half-lid deadpan (default for the hero), concentration (half-lid + tongue-out mouth), angry V-brows, surprised (white circle eyes with black ring and dot pupil, raised brow arcs, open mouth), wide-eyed worry with small "o", shouting (open mouth with teeth/tongue), nervous gritted teeth, evil grin with teeth and slanted lids, asleep (blank disc with small marks), final smirk with one brow raised.
- **Lighting on characters:** mostly flat, with a soft airbrushed shadow gradient on one side of the head and under hats/hair. They take the scene grade: head fill is #f5eee8 in day (0.67 s), #f9dfce with #d9bcbd shadow side in the night close-up (29.7 s), and hair picks up an orange edge tint in front of the explosion (66.3 s). They do not receive hard cast shadows from the world as far as visible.
- **Cast and identifiers:**
  - Inventor: brown scribble hair, white headband with knot tails, crimson diamond-quilted robe, brown belt with hammer and pouch; after 30.5 s a cream tunic (coat removed).
  - Commander: grey dome helmet with gold studded rim and red plume, brown beard, navy brigandine with yellow studs, red pleated skirt, carries a torch from 40.5 s.
  - Kettle-hat soldier: wide grey brimmed helmet, green ribbed tunic with yellow lacing, ring eyes.
  - Others in the fort: red-bearded soldier with blue cap and green tunic; blond in blue; white turban/robe; mail-hood pair.
  - Enemy general: black helmet with gold horns, black lamellar flared body with red sash, moustache, red palanquin, parasol.
  - Enemy soldiers: grey spiked helmet with mail, yellow tunic with black boar emblem, yellow shields with black chevrons, yellow boar flags.
- **Palette (sampled):** head #f5eee8; ink #2e2334 (reads black); robe crimson #ad2150 (night #941637); belt #6f4b30; hair #a4896a mid-tone; headband #e5ded0; commander helmet #9da9b7, plume #e33c4d, armour #313a4d, skirt #a42538, beard #4a352f; green tunic #6e8257 (night); wet coat purple #5c3c85; cream tunic #e0dac9; enemy tunic yellow-ochre #8b6a32 (shaded sample), palanquin red #d70936; banner blue #173ec0.

## 5. Outlines / ink

- Characters: uniform black line, slightly wobbly, no taper, closed shapes. Head outline ~6-7 px when the head is ~230 px wide (about 3% of head diameter) and ~10 px in close-up, so the line scales with the sprite. Limb strokes ~6-8 px at MS. Inner lines (brows, lids, belt stitches, quilt pattern) are 2-6 px; fabric pattern lines are thin and darker than the fill rather than black.
- Character-held 2D props (hammer, pouch, torch, sword, rope coil in hand) share the black outline.
- 3D props (cart, board, arrows, drill, parasol, palanquin, lanterns): **no outline**; edges come from shading and dark trim pieces.
- Environment: **no outlines at all**. Stone block joints are dark mortar in the texture, not ink.
- FX lines: red anger lightning ~3-5 px; gold fuse strings ~2-3 px with glow.

## 6. World, environment, textures

- Look: stylised game-engine 3D (clean low-to-mid poly shapes, PBR-like materials, real-time-style lighting). Specific engine: not determinable from frames.
- Fort: grey ashlar wall with tiling block texture, bevelled blocks, crenellations, arch gates, crack decal after the slap; pagoda gatehouse with dark tiled roof, red columns and red lanterns; red cone-roof round tower; wooden palisade; blue banners (white tiger, gold chevron and trim), striped blue pennants.
- Wall-walk: large flagstones (tan in daylight, blue-grey when wet at night), stone parapet with ladder hooks.
- Ground: very dense 3D grass blades, bright yellow-green tips (#97c255, #90d04c) to dark base (#2b5520); brown dirt road (#543f15 shaded) with pale pebble flecks; after the slap, terrain breaks into flat-topped slabs with plain brown sides.
- Landscape: rolling bright-green hills (#89ce5e) with darker forest patches (#437c49), flat-coloured patchwork fields, a winding road, a few simple trees, pale-topped mountains.
- Sky: saturated blue (#458de2) with soft painterly cumulus by day; mauve-to-peach gradient at dusk (#aa8ca0 to #efdcce); blue-violet fog at night (#434c73, #5c5d7a); pink-orange sunrise.
- Texture style: clean, lightly painted PBR; no visible hand-brushed strokes on the world; wood has simple grain; fabrics on characters carry the most pattern detail.
- Level of detail is high near camera (grass, arrows with wire bindings) and simplified far away (fields as flat colour blocks).

## 7. Lighting and glow

- Day key: warm sun from high and behind/side, giving long soft-edged shadows across grass and flagstones (8-9 s, 40-50 s). Shadows are cool dark green/blue-grey, fairly dark, soft penumbra.
- Volumetrics: warm light shaft through the arch (9.8 s, #caad83 inside the shaft); dust haze behind the army; fog at night.
- Bloom: moderate to strong and warm. Lanterns (#fefae1 core, halo ~60 px), torch flame, fuse sparks (#fdf5be core, halo 30-50 px), launch board (clips to white), sun flare (47 s), explosion core (#fffffe). Glowing objects also light nearby surfaces (board #fee473 under the sparks; rocket shafts under the lantern).
- Rim light: no consistent rim on characters; only the warm hair-edge tint in the final shot.
- Grade: high saturation, warm highlights by day; near-monochrome blue-violet at night with warm lantern accents; pink-gold at sunrise; mauve at dusk.
- Vignette: no strong dark vignette. Instead a **peripheral blur**: corners and top/bottom edges are soft in wides (3.6 s, 27.5 s).
- Anger beat adds a local black aura (#150923) rather than a global darkening.

## 8. Depth

- Depth of field: used often, moderate strength. Backgrounds soften behind mid-shots (fort at 4.9-5.8 s, hills at 66 s); foreground grass, rocks, cart wheel and ledge go out of focus in low shots (25.5 s, 29.0 s, 39-40 s). Macro shots keep the subject sharp with soft surroundings.
- Parallax: real 3D parallax between foreground grass/props, character planes and far landscape on every move.
- Atmosphere: distance haze toward blue on hills by day; heavy fog at night; dust volume behind the army.
- Lens: wide-angle perspective, noticeable stretch near frame edges on the wall-walk; barrel distortion: not determinable.
- Motion blur: effectively none on camera or characters. Fast FX (blast streak at 60.7, trails) are drawn as streaks.

## 9. Captions

- Font look: heavy geometric sans, rounded bowls (Poppins/Montserrat ExtraBold-to-Black class; exact family not determinable). Sentence case as spoken, mostly lowercase; capitals only at sentence starts. Numerals used for "82".
- Colour: white (#fffeff) fill, black stroke ~4 px, plus a soft black drop shadow/glow of ~6 px below. **No emphasis colours, no highlighted words, no emoji.**
- Position: horizontally centred, single line, vertical centre at ~70.5% of frame height (y~903 of 1280), identical on every card.
- Size: cap height ~44 px, x-height ~34 px (cap height ~3.4% of frame height, ~6% of frame width). "commander" spans ~300 px = 42% of frame width; one-word cards are typically 8-30% of width.
- Words per card: 190 cards; 148 one-word, 39 two-word, 3 three-word ("for his fort.", "with a string.", "one of them"). Mean 1.24 words per card; mean card duration 0.35 s; shortest cards 2-4 frames ("the" at f53-f54, "his" at f783-f785).
- Change: **hard swap on a single frame**. Checked at 30 fps across 16 sheets: no scale pop, no fade, no slide, no per-word highlight. Captions sit above the picture dissolves and are not blended by them (f141-f146 shows a crisp caption over a blended picture).
- Punctuation is kept: commas and full stops appear on the card that ends the clause; one question mark ("cheese?").
- Other on-screen text: none. No title card, watermark, logo or end card. Banner and flag artwork contains emblems only.
- One caption error: "the card" at 61.2 s where the story means "the cart".

### Full caption transcript (start time in seconds, card text)

Times at 0-2 s, 25-31 s, 36.4-37.2 s, 43.0-43.5 s, 50.4-51.0 s, 60.0-61.0 s and 63.3-66.8 s are frame-accurate; the rest are +/-0.1 s.

| t | card |
|---|---|
| 0.00 | He |
| 0.13 | drilled |
| 0.47 | 82 |
| 1.10 | holes |
| 1.57 | into |
| 1.77 | the |
| 1.83 | wood |
| 2.27 | because |
| 2.57 | down |
| 2.87 | the |
| 2.97 | hill |
| 3.30 | an army |
| 4.00 | is |
| 4.10 | marching |
| 4.50 | straight |
| 4.87 | for his fort. |
| 5.60 | And |
| 5.70 | while |
| 5.90 | everyone |
| 6.30 | else |
| 6.50 | sharpens |
| 6.90 | swords, |
| 7.50 | he's in |
| 7.80 | the corner, |
| 8.40 | still |
| 8.80 | drilling. |
| 9.30 | His |
| 9.50 | commander |
| 9.90 | asks, |
| 10.40 | Are we |
| 10.70 | fighting |
| 11.10 | them or |
| 11.60 | grating |
| 12.00 | cheese? |
| 12.60 | But |
| 12.90 | it gets |
| 13.30 | weirder. |
| 13.90 | He |
| 14.10 | bolts |
| 14.40 | the wood |
| 14.80 | onto |
| 15.00 | a cart |
| 15.50 | and |
| 15.70 | into |
| 15.90 | every |
| 16.30 | hole |
| 16.60 | goes |
| 16.80 | something |
| 17.20 | long |
| 17.60 | and |
| 17.80 | thin. |
| 18.20 | Wrapped |
| 18.60 | in |
| 18.70 | paper, |
| 19.20 | each |
| 19.50 | with a string. |
| 20.20 | Then |
| 20.50 | he twists |
| 21.10 | all |
| 21.40 | the strings |
| 21.90 | into |
| 22.10 | one |
| 22.40 | rope |
| 22.70 | nobody's |
| 23.30 | allowed |
| 23.60 | to |
| 23.70 | touch. |
| 24.10 | One |
| 24.40 | soldier |
| 24.70 | reaches |
| 25.13 | for it |
| 25.47 | and he |
| 25.63 | slaps |
| 26.10 | his |
| 26.20 | hand |
| 26.43 | so hard |
| 27.10 | the whole |
| 27.50 | fort |
| 28.00 | hears |
| 28.30 | it. |
| 28.50 | That |
| 28.73 | night, |
| 29.10 | it |
| 29.37 | pours. |
| 30.00 | So he |
| 30.30 | throws |
| 30.60 | his |
| 30.73 | coat |
| 31.03 | over |
| 31.27 | the cart |
| 31.70 | and |
| 31.90 | lies on |
| 32.40 | top |
| 32.70 | of it |
| 32.90 | like a |
| 33.10 | human |
| 33.50 | umbrella. |
| 34.00 | One |
| 34.30 | drop |
| 34.50 | gets |
| 34.80 | in there |
| 35.20 | and |
| 35.40 | we're |
| 35.60 | all |
| 36.00 | dead. |
| 36.40 | The |
| 36.53 | next |
| 36.77 | morning, |
| 37.20 | ladders |
| 37.70 | slam |
| 38.10 | against |
| 38.40 | the walls |
| 38.90 | and the |
| 39.10 | army |
| 39.50 | charges. |
| 40.10 | Everyone |
| 40.60 | screams |
| 41.10 | at him |
| 41.30 | to do |
| 41.70 | something, |
| 42.20 | but |
| 42.40 | he just |
| 42.70 | watches |
| 43.17 | them |
| 43.30 | get |
| 43.47 | closer |
| 44.00 | and closer |
| 44.70 | until |
| 45.00 | they're |
| 45.10 | packed |
| 45.40 | shoulder |
| 45.90 | to |
| 46.00 | shoulder, |
| 46.40 | close |
| 46.80 | enough |
| 47.00 | to see |
| 47.30 | their |
| 47.40 | teeth. |
| 48.00 | That's |
| 48.30 | when |
| 48.50 | he rips |
| 48.90 | off |
| 49.10 | the |
| 49.20 | coat |
| 49.50 | and |
| 49.60 | lights |
| 50.00 | the rope. |
| 50.43 | The spark |
| 51.00 | races |
| 51.50 | down it |
| 51.90 | and |
| 52.00 | splits |
| 52.50 | into 82 |
| 53.40 | tiny |
| 53.80 | flames, |
| 54.30 | and |
| 54.50 | each |
| 54.80 | one |
| 55.10 | hits |
| 55.30 | a tube |
| 55.70 | of |
| 55.80 | gunpowder |
| 56.40 | strapped |
| 56.70 | to an |
| 57.00 | arrow, |
| 57.40 | turning |
| 57.80 | every |
| 58.20 | one of them |
| 58.70 | into a |
| 59.10 | rocket. |
| 59.70 | All 82 |
| 60.53 | blast |
| 60.97 | off |
| 61.20 | the card |
| 61.50 | at |
| 61.60 | once, |
| 61.90 | flying |
| 62.30 | every |
| 62.70 | which |
| 63.00 | way. |
| 63.30 | But |
| 63.43 | with |
| 63.57 | the army |
| 63.97 | packed |
| 64.30 | that |
| 64.60 | tight. |
| 65.00 | Not a |
| 65.30 | single |
| 65.80 | one |
| 66.13 | misses. |

Running text: He drilled 82 holes into the wood because down the hill an army is marching straight for his fort. And while everyone else sharpens swords, he's in the corner, still drilling. His commander asks, Are we fighting them or grating cheese? But it gets weirder. He bolts the wood onto a cart and into every hole goes something long and thin. Wrapped in paper, each with a string. Then he twists all the strings into one rope nobody's allowed to touch. One soldier reaches for it and he slaps his hand so hard the whole fort hears it. That night, it pours. So he throws his coat over the cart and lies on top of it like a human umbrella. One drop gets in there and we're all dead. The next morning, ladders slam against the walls and the army charges. Everyone screams at him to do something, but he just watches them get closer and closer until they're packed shoulder to shoulder, close enough to see their teeth. That's when he rips off the coat and lights the rope. The spark races down it and splits into 82 tiny flames, and each one hits a tube of gunpowder strapped to an arrow, turning every one of them into a rocket. All 82 blast off the card at once, flying every which way. But with the army packed that tight. Not a single one misses.

## 10. Script / story structure

- **Hook (0-2 s):** no title, no establishing shot. Frame 0 is the hero mid-action drilling, with the first word on screen at f0. "He drilled 82 holes into the wood" is complete by 2.0 s, with a snap-in to the drill at 1.0 s. The odd specific number is the hook; the stakes ("an army is marching straight for his fort") land by 5.5 s via the wall-to-valley flight.
- **Escalation:** mockery from peers and commander (5.6-12.4 s); "But it gets weirder" pivot (12.6 s); mystery build of the device without naming it (13.9-24.0 s); character beat showing how seriously he takes it (slap, 24-28.5 s); obstacle (rain, 28.5-36.3 s); threat arrives (36.4-40 s); tension by inaction (40-47.9 s, "close enough to see their teeth").
- **Payoff:** "That's when" (48.0 s) coat off, rope lit; mechanism explained in motion (50.4-59.5 s, the word "rocket" withheld until 59.1 s); launch (60.5 s); punchline in two short sentences (63.3-66.8 s).
- **Ending:** hero smirk in front of a mushroom cloud, last word "misses." appears at f1984 and holds 0.67 s to the final frame. No fade, no call to action, no end card. The last frame does not match frame 0 (different location, costume and framing), so it is not a visual loop.
- **Pacing:** 235 words in 66.8 s = 3.5 words/s; 2.8 caption cards/s. Words per 10 s: 34, 34, 34, 39, 37, 35, 22 (last block is 6.8 s). Roughly 3.7 beats per 10 s (25 beats) and 2.7 dissolves per 10 s; a new visual event (pose pop, prop action or camera change) occurs about every 0.5-1 s.

## 11. Replication notes for Three.js

Values are measured where stated above; items marked "suggested" are my choices to reproduce the look, not measurements.

**Format:** 720x1280 (or 1080x1920), 30 fps, render every frame (no frame holds on the camera).

**Camera**
- PerspectiveCamera, vertical FOV 55-70 degrees for a 9:16 frame (suggested, to match the wide feel). Height 0.4-1.2 m for character shots.
- Never set zero velocity. Minimum creep: push 1-3% of subject distance per second.
- Drive from spline paths (CatmullRomCurve3) with ease-out into a creep. Fast push: 8-10 frames. Fly-through: 18-50 frames with no motion blur.
- Transitions: 6-frame linear cross-dissolve between two rendered scenes/cameras (range 4-8). No hard cuts, no wipes. Captions composited after the dissolve.
- Take length 1.1-4 s for simple setups, up to 8-15 s for a continuous "process" take; about 19 takes per 67 s.

**Characters**
- Textured planes (alpha-tested sprites), head diameter ~1/3 of total height, 3 heads tall. Y-axis billboarding (suggested).
- Line: black #1a1420-#2e2334, width 3% of head diameter, baked into the sprite.
- Pose library per character with instant swaps; hold 5-30 frames; no tweening of limbs. Mouth swap every 2-3 frames while that character is speaking. No idle loop.
- Whole-sprite transforms for acting: in-plane tilt up to ~45 degrees, translate in from frame edges, one overshoot frame on pop-ups.
- Unlit or lightly lit material multiplied by a per-scene tint (day #ffffff, night approx #f9dfce with cool shadow side, dusk slightly mauve). Soft blob shadow on the ground.
- Crowds: InstancedMesh of 3-4 sprite variants in rows with small phase-offset vertical bob; far crowd as a single textured strip.

**World**
- No outline pass on environment or props.
- MeshStandardMaterial throughout; tiling ashlar stone with normal map; instanced grass blades (very dense near camera) with tip/base gradient #97c255 to #2b5520.
- Day sky #458de2 with soft cloud sprites; dusk gradient #aa8ca0 to #efdcce; night fog #434c73-#5c5d7a (FogExp2); sunrise pink-orange.
- Directional sun with soft shadows (PCFSoft), warm key and cool ambient; one volumetric shaft card where a doorway is backlit.

**Post**
- Bloom (UnrealBloomPass): threshold ~0.85, strength ~0.6-0.9, radius ~0.5 (suggested); emissive cores #fdf5be-#fffffe.
- Depth of field (BokehPass) at moderate aperture, focus on the main character or prop.
- Edge softness: blur increasing toward corners instead of a dark vignette.
- No motion blur, no film grain, no chromatic aberration observed.

**FX recipes**
- Rain: ~25 line sprites per frame, 2 px x 40-250 px, alpha ~0.3-0.5, in front of characters; ripple ring decals.
- Sparks: additive points with gravity. Trails: ribbon/trail meshes, white, wide and soft, with small emissive heads.
- Explosions: clustered spheres or sprites with 3-tone orange toon ramp (#c14f18, #ee9220, white-yellow core) and a pale base ring (#fcf1d8).
- Emphasis: gold outline highlight on a prop when it is named; white 4-point star glints when parts seat; emissive flash on the named part (arrowhead at 57.0 s).
- Impact: 4-frame expanding ring, debris of flat-shaded low-poly rocks, 1 s tumbling prop.

**Captions**
- Heavy geometric sans (Poppins ExtraBold/Black as stand-in), white, 4 px black stroke at 720 wide, soft shadow ~6 px.
- Cap height 3.4% of frame height; centre at 70.5% of frame height; single centred line.
- 1 word per card by default, 2 for short function-word pairs, 3 rarely; hard swap, no animation, no colour emphasis; keep punctuation.
- About 2.8 cards/s at 3.5 words/s narration.

**Structure**
- Start mid-action at frame 0 with the first caption on f0; a concrete odd number in sentence one; stakes by 5 s.
- Withhold the name of the device until ~88% through; end on a 1.4 s hero hold with the last word up for ~0.7 s; no outro.
