# mine-salting.mp4 — frame-accurate style analysis

Source: `reference/source/mine-salting.mp4`, 1080x1920, 30 fps, 1832 frames (f0–f1831), 61.07 s. Title: "How Mine Salting Worked".
Evidence used: all 31 10fps sheets; 24 30fps sheets in `reference/sheets/mine-salting/30fps/` (19 moments); 14 full-res stills in `reference/sheets/mine-salting/stills/` (8 inspected visually, all sampled numerically); a per-frame caption-band scan (all 1832 frames) and a per-frame motion measurement (108x192 greyscale frame differencing). Frame numbers are source frames (t = f/30).

Characters referred to as: **Miner** (brown ranger hat with brass lamp badge, red plaid vest), **Buddy** (mustard beanie, teal sweater), **Rich guy** (white top hat, white double-breasted suit, curled moustache, red rose), **Expert** (black bowler, round glasses, purple coat), **Clerk** (green visor, assay office only).

## 0. Headline finding: this video DOES cut

Unlike the sibling videos, this one is edited as 21 shots. Every one of the 14 ffmpeg-flagged times is a **true hard cut** (frame N and N+1 are different set-ups, no blended frame, no flash, no blur frame). There are additionally 1 unflagged hard cut, 3 short crossfades, 1 dust-cloud wipe, 1 muzzle-flash-masked continuation and 1 in-shot whip pan. Inside each shot the camera still behaves like the "travelling camera" style: it is never locked off and several shots contain a fast in-shot push/whip that re-frames from wide to macro without cutting.

| Flagged t | Frames | Classification | What is on either side |
|---|---|---|---|
| 9.20 | f275 → f276 | Hard cut | Buddy medium close-up at crate table → wide high-angle Miner on the tunnel tracks |
| 10.70 | f320 → f321 | Hard cut | Tunnel interior → bright exterior, Miner pushing cart |
| 16.10 | f482 → f483 | Hard cut | Newspaper two-shot exterior → assay office interior |
| 21.47 | f643 → f644 | Hard cut | Car close-up → mine entrance, Rich guy in profile |
| 24.53 | f735 → f736 | Hard cut | Group on tracks at entrance → Expert at rock wall inside |
| 27.47 | f823 → f824 | Hard cut | Expert with pickaxe → Expert bent over bucket, high angle |
| 28.87 | f865 → f866 | Hard cut | Wide of Expert + bucket → top-down macro of the pan |
| 35.67 | f1069 → f1070 | Hard cut | Expert single → low-angle Rich guy + Expert two-shot |
| 43.17 | f1294 → f1295 | Hard cut | Buddy + Miner two-shot → Rich guy opening cash briefcase (three-shot) |
| 45.33 | f1359 → f1360 | Hard cut | Interior, pair bolting off-frame → exterior entrance, pair running out |
| 46.23 | f1386 → f1387 | Hard cut | Exterior runners → Rich guy alone inside |
| 51.20 | f1535 → f1536 | Hard cut | Rich guy sniffing dynamite → macro of fuse in dark tunnel |
| 53.77 | f1612 → f1613 | Hard cut | Dynamite on tunnel floor → Rich guy framed in timber doorway |
| 54.73 | f1641 → f1642 | Hard cut | Empty tunnel (he has just exited past lens) → exterior cliff wide |

Scene changes NOT flagged by ffmpeg:

| t | Frames | Type | Detail |
|---|---|---|---|
| 1.93–2.00 | f58–f60 | Flash-masked continuation | Muzzle flash grows f58, fills ~60% of frame near-white at f59; f60 is already the nugget in flight in the same tunnel. Same space, so it reads as one move. |
| 18.83–19.07 | f565–f572 | Crossfade, 8 frames | Top-down gold-dust dish dissolves to the exterior road with the car. |
| 31.00 | f929 → f930 | Hard cut | Macro pan with knife → high-angle Expert holding pan. (Missed by scene detection.) |
| 31.57–31.87 | f947–f956 | In-shot through-object move | Camera whips past the Expert's head and through the magnifying-glass ring, which fills the frame at ~f955, landing on the knife blade. No cut. |
| 33.43–33.60 | f1003–f1008 | Crossfade, 6 frames | Dark tunnel/knife blade dissolves to macro gravel wall. |
| 34.57–34.73 | f1037–f1042 | Crossfade, 6 frames (match dissolve) | The flattened gold splat sits exactly where the Expert's face fades in. |
| 40.20–40.80 | f1206–f1224 | Whip pan, ~18 frames | Pans right from Rich guy to Buddy + Miner in the same room. No cut. |
| 55.30–55.90 | f1659–f1677 | Dust wipe | Explosion dust billows from the doorway, covers the frame by ~f1669–f1677, then thins to reveal the blasted tunnel interior. The exact swap frame is hidden inside the dust: not determinable from frames. |

Totals: 15 hard cuts, 3 crossfades (6–8 frames), 1 dust wipe, 1 flash-masked join. 21 shots in 61.07 s = mean 2.9 s per shot; longest shot S14 = 7.5 s, shortest S16 = 0.9 s.

## 1. Shot / beat list

Times in seconds. Captions are the on-screen words that start inside the shot (caption cards are timed to speech, not to cuts, so a card often straddles a cut).

| id | t_start | t_end | Location | What happens | Camera | Transition out | Caption words |
|---|---|---|---|---|---|---|---|
| S01 | 0.00 | 2.00 | Mine tunnel interior (rail track, timber sets, ceiling lamp) | Miner (ranger hat with lamp badge, red plaid vest) stands in a light cone holding a break-action shotgun; drops a gold nugget into the breech; snaps it shut; aims at lens; fires (muzzle flash f58-59). | Hold/creep f0-15, then ONE continuous move: fast push-in + tilt down to breech macro (f16-25, 10 frames), macro hold f26-43, whip back out along barrel (f44-54), barrel points into lens f55-57. | Muzzle flash white-out f58-59 (flash-masked continuation, same space) | He loaded the shotgun with gold and fired it |
| S02 | 2.00 | 9.20 | Mine tunnel interior, side chamber with crate table | Gold nugget flies with orange light-cone trail and shock rings, hits rock wall (impact f94: starburst, chips, dust puff). Camera pans to buddy (yellow beanie, teal sweater) seated eating bread; he talks; at f235 glasses-eyes + 4-point sparkles on the embedded gold. | Projectile-follow push toward wall (f60-94, fast, decelerates on impact), settle f95-112, pan left/pull back to buddy f113-130, then slow continuous push-in from wide to medium close-up f130-275. | HARD CUT at f276 (9.20s) | into the walls of the mine. His buddy just watches the gold vanish into the rock. So we're shooting gold into a gold mine? You see, |
| S03 | 9.20 | 10.70 | Mine tunnel interior, wide high angle | Miner on tracks pours sparkling gold dust from pouch into shotgun. | Slow push-in, already moving on first frame. | HARD CUT at f321 (10.70s) | it's called salting. He's |
| S04 | 10.70 | 16.10 | Exterior daytime: raised mine track, sandstone mesa, mining town with flags | Miner pushes red cart 'NELLIE', tips it (rocks + dust), holds a lone rock looking sad; buddy pops in f409 with newspaper 'THE HOPEFUL HERALD - MILLIONAIRE DUE TO-MORROW'; faces go suspicious -> wide-eyed -> huge grin. | Low wide slow drift f321-368; crane up/forward over rock pile to medium f369-384; slow push; second push to tight two-shot f429-450; creep to end. | HARD CUT at f483 (16.10s) | dug this mine for ten years and found nothing but rock. And tomorrow, a rich guy is coming to buy it. So |
| S05 | 16.10 | 19.07 | Assay/gold-dealer office interior (plank floor, counter, scales, chalkboard '$20.67') | Miner at counter with clerk (green visor); $100 bill swapped for a dish of gold dust. | Slow push f483-523, then fast push-in + tilt down to top-down macro of gold dish f524-540 (16 frames, ease-out), near-still hold f540-565. | CROSSFADE f565-572 (8 frames, 0.27s) | he spent his last hundred bucks on gold dust instead. Next |
| S06 | 18.83 | 21.47 | Exterior mountain road: pine forest, waterfall, cliff | White brass-era touring car drives up with wheel dust; rich guy (white top hat, white suit, curled moustache, red rose) stands arms up; expert (bowler, glasses, purple coat) rides along; two bystanders gape. | Low wide tracking, then push-in/arc to close on car side f612-643; out-of-focus rail in foreground. | HARD CUT at f644 (21.47s) | morning, the rich guy rolls up in a white suit |
| S07 | 21.47 | 24.53 | Exterior mine entrance 'SURE THING MINE EST. 1899' with bunting | Rich guy walks in profile and bangs head on beam (f652-654): hat accordion-crushed, X eyes, tongue; recovers f675; expert, buddy, miner gather on the tracks. | Close profile follow f644-660, then slow dolly back along the rails (centre one-point perspective) with slight lateral drift. | HARD CUT at f736 (24.53s) | and bangs his head on the first beam. But he's brought an expert. And the expert |
| S08 | 24.53 | 27.47 | Mine interior, rock wall on left, lantern, bucket | Expert leans on wall with cane, smug; raises pickaxe (anticipation f780-785, manic grin), strikes f790; rock chips fly; gold pan on floor. | Slow push + slight arc, wide-angle high view. | HARD CUT at f824 (27.47s) | isn't stupid. He smashes a chunk of wall, swirls |
| S09 | 27.47 | 28.87 | Mine interior, timber-lined chamber, wooden bucket | Expert bends over bucket swirling the pan; water drips. | High-angle wide, slow push. | HARD CUT at f866 (28.87s) | it in a pan and gold |
| S10 | 28.87 | 31.00 | Macro: gold pan over bucket | Water, black sand, gold flakes and a white quartz chip swirl; ripples; knife blade enters f912 and lifts flakes. | Top-down macro, continuous push-in to extreme macro f882-905, slow drift. | HARD CUT at f930 (31.00s) | flakes spin to the bottom. But under his |
| S11 | 31.00 | 33.60 | Mine tunnel interior, darker | Expert holds pan and raises magnifying glass; camera flies past his head THROUGH the magnifier ring (f947-956) to a knife blade carrying flattened gold flakes. | High-angle medium f930-936, fast push/arc f937-956 through the lens ring, slow drift on blade f960-1002. | CROSSFADE f1003-1008 (6 frames) | magnifying glass, every flake is flat. |
| S12 | 33.43 | 34.73 | Macro: gravelly rock-wall texture | Gold pellet streaks in f1017-1018, star flash f1019-1020, flattened gold splat remains. | Near-static macro, tiny drift. | CROSSFADE f1037-1042 (6 frames), match-dissolve: splat sits where expert's face appears | Somebody shot this gold |
| S13 | 34.57 | 35.67 | Mine interior by rock wall and crates | Expert addresses camera, angry brows, points at bullet-hole in wall. | Medium full-body, slow push. | HARD CUT at f1070 (35.67s) | into the wall, but |
| S14 | 35.67 | 43.17 | Mine interior, timber-plank wall, lantern jar, bucket | Rich guy laughs (bounce, leg kick f1096, head back), gestures; expert small behind. Whip pan to buddy + miner with gritted-teeth nervous faces under an 1899 calendar; buddy says 'Completely insane.' | Low angle slow push f1070-1125, creep; WHIP PAN right f1206-1224 (~18 frames, no cut); slow push on two-shot. | HARD CUT at f1295 (43.17s) | the rich guy just laughs. Why would anyone shoot gold into a wall? That's insane. And his buddy nods. Completely insane. So |
| S15 | 43.17 | 45.33 | Same chamber | Rich guy opens briefcase of cash on a crate, hands stacks over; briefcase drops shut; buddy+miner bolt right with smear legs f1352-1357, miner's hat hangs in the air f1358, bills flutter. | Medium three-shot, slow push then slight pull/tilt down to briefcase. | HARD CUT at f1360 (45.33s) | the rich guy pays up. And while those two bottles, |
| S16 | 45.33 | 46.23 | Exterior mine entrance | Buddy and miner sprint out carrying cash stacks on their heads, wheel-blur legs. | Pan/track right following them, they fill frame by f1380. | HARD CUT at f1387 (46.23s) | the money, he stays |
| S17 | 46.23 | 51.20 | Mine interior, plank wall | Rich guy alone, bills settling. Opens jacket (red lining with rows of dynamite) f1413-1432, pulls a stick labelled TIMBERLINE, sniffs it under his moustache like a cigar. | Slow push from full-body to medium close-up over ~3s, then creep. | HARD CUT at f1536 (51.20s) | behind and pulls a stick of dynamite out of his suit. He's never mind a day in his life, so |
| S18 | 51.20 | 53.77 | Mine tunnel, macro on fuse then down the tunnel | Match flame enters f1539, fuse ignites f1547-1551 (star + radial streaks); reveal of rich guy's wide-eyed face; he tosses the stick; it tumbles down the tunnel past a red cart and lands by rocks, fuse sparking. | Macro hold f1536-1551; whip pull-back/tilt up f1552-1556; then camera FOLLOWS the thrown dynamite down the tunnel f1560-1600 (continuous whip), settles low on the stick. | HARD CUT at f1613 (53.77s) | he just lights it, tosses it down the tunnel like a firecracker |
| S19 | 53.77 | 54.73 | Tunnel, framed by dark timber doorway | Rich guy with fingers in ears, eyes pop open f1625, lunges at camera and exits f1636-1639; empty tunnel f1640-1641. | Static-ish locked frame with slight drift; character does the motion. | HARD CUT at f1642 (54.73s) | and runs. |
| S20 | 54.73 | 55.90 | Exterior cliff face with small mine entrance | He runs out f1643-1649; explosion f1650 (white doorway, orange fireballs); he is flung horizontally, sign knocked askew, lands face-down f1657-1661; dust cloud billows. | Wide low static with slight push; minor shake not determinable from frames. | DUST WIPE: cloud fills frame f1669-1677, clears onto next scene (swap frame hidden in dust) | When the dust clears, |
| S21 | 55.63 | 61.07 | Blasted tunnel end: rubble, glowing gold vein, measuring tape | Dust clears; dust-grey rich guy peeks in, admires a gold vein (glow, sparkles); camera pulls back to reveal an abandoned pickaxe with a hat on it, a yellow tape on the floor and chalk '10 FT' arrow. | Fog-clear reveal, push-in to medium close on vein f1725-1765, pull back/tilt down f1770-1815, near-still last ~0.5s. | Ends on last frame f1831 (no end card, no fade, no loop cut) | there's a vein of real gold as thick as your arm. Ten feet past where the last guy gave up. |

## 2. Camera

Measured: across all 1831 frame pairs there is **no pair with zero change in the non-caption environment bands** and no run of even 6 frames below a "locked-off" threshold. The camera is never fully still. The quietest stretches are slow creeps, not holds.

Move catalogue (counts are occurrences over the 21 shots):

| Move | Count | Typical duration | Notes |
|---|---|---|---|
| Slow creep push-in (dolly forward, a few % scale per second) | ~17 (default state of almost every shot) | 1–7 s | Starts already moving on the first frame after a cut and is still moving on the last. No visible ease-in at shot start. |
| Fast push-in + tilt-down to macro (wide → insert without cutting) | 4 | 10–24 frames (0.33–0.8 s) | f16–25 to shotgun breech (10 frames); f524–540 to gold dish (16 frames); f882–905 into the pan; f937–956 through the magnifier. Ease-out into the hold; the start is abrupt. |
| Whip pull-back / reveal | 3 | 5–11 frames | f44–54 back out along the barrel; f1552–1556 from fuse up to the face; f1770–1815 slower pull-back for the final "10 FT" reveal (1.5 s). |
| Object-follow (camera rides with a thrown/fired object) | 2 | 1.1–1.8 s | Nugget f60–94; dynamite f1560–1600. Highest-energy moves in the video. |
| Whip pan | 1 | 18 frames | f1206–1224. |
| Pan/track with running characters | 1 | 0.9 s | f1360–1386. |
| Dolly back along rails (one-point perspective) | 1 | 3 s | f660–735. |
| Crane up/over foreground | 1 | 0.5 s | f369–384 over the dumped rock pile. |
| Arc/orbit component | several, mild | — | Visible as parallax between character and wall in S08, S06, S14. Exact angle not determinable from frames. |

- Longest quiet stretches (lowest measured motion, still creeping): f134–185 (1.7 s, Buddy), f205–235 (1.0 s), f1295–1324 (1.0 s, briefcase), f1131–1156 (0.8 s), f540–551 (0.4 s, gold dish), f1821–1831 (0.3 s, final frame group). Longest thing that reads as a "hold" to the eye: about 1.7 s.
- Fully still: never.
- Handheld shake / roll / dutch: no roll or dutch angle seen in any sheet. No handheld jitter visible at 10 or 30 fps. Camera shake on the explosion (f1650+): not determinable from frames.
- Start/end of moves: every shot is already in motion at its first frame. Fast moves begin abruptly (1–2 frames to full speed) and ease out over ~4–6 frames into a creep.
- Lens feel: wide-angle throughout the interiors (strong convergence on rails and plank walls, big foreground wall in S08, high-angle shots where the floor fills the lower half). Characters are usually framed full-body or cowboy; close-ups are reached by pushing in, and macro inserts by an in-shot push or a cut. Approximate equivalent: 20–28 mm full-frame for wides, same lens moved close for inserts. Exact focal length not determinable from frames.
- Angle habit: slightly high (looking down ~10–25°) for interior character shots; low angle for the Rich guy's entrance/laugh (S14) and for exteriors.

## 3. Motion and micro-interactions

Camera and world render at a true 30 fps (no duplicated frames). Character animation is layered on top and is pose-to-pose.

- Character timing: poses are held 3–15 frames and swapped in 1–2 frames with no in-betweens. Examples: Miner's gun arm pops f12→13; newspaper faces pop at f474 and f480; Rich guy's hat crush f652–654; jacket opens within f1413–1415. Strict "on twos" is not determinable; holds are irregular.
- Mouths: discrete mouth-shape sprites swapped every 1–3 frames while talking (seen frame by frame f1044–1068: closed line, small o, wide open with tongue, teeth-bared, D-shape). Shape set observed: flat line, small smile curve, open oval (dark red interior, pink tongue), wide toothy grin (white teeth with vertical lines), gritted-teeth rectangle, small "o", frown arc.
- Eyes: default is two solid black dots/short vertical ovals. Variants: half-lidded (line across top), wide round white eyes with pupils (shock), happy closed arcs (Rich guy default), X eyes (head bang), one eye squinted (manic), angled brow strokes (anger), "glasses" round outlines (Expert permanently; Buddy gets them as a gag at f235). Blinks: a few 2–3 frame closed-eye swaps are visible on the Rich guy (around f1621–1624 one eye opens); a regular blink cycle is not determinable.
- Squash/stretch: used on impacts only. Top hat accordion-crushes then pops back (f652–675); Rich guy's body scales up towards lens in 4 frames (f1636–1639); body bounce during the laugh (f1091–1111) with one leg kicked up at f1096.
- Limbs: single-stroke arms and legs bend as smooth curves (no elbows/knees), re-posed per key. Run cycles use smeared, multi-leg "wheel" blur (f1352–1357, f1370–1386). Legs drag as loose curves when a body is flung (f1650–1656).
- Anticipation/overshoot: pickaxe wind-up f780–785 before the strike at f790; dynamite toss has a small wind-up. Overshoot/settle after pose changes is minimal.
- Gags: hat hangs in the air for a frame or two after its owner bolts (f1358); cash stacks ride on heads; sparkle stars beside gold (f235).
- Idle motion: between keys the characters are not perfectly frozen; small head bobs while talking. A continuous breathing loop is not determinable from frames.
- Props: shotgun breaks open and closes; cart tips and dumps rocks with a dust puff (f359–369); newspaper swings in rotated at f414 and settles by f419; briefcase opens, closes and drops; car wheels spin with dust trails; pan water has concentric ripples and orbiting streaked flecks.
- FX inventory:
  - Muzzle flash: near-white/yellow bloom filling ~60% of frame for 2 frames (f58–59).
  - Projectile: gold nugget with a long tapered orange-yellow light cone behind it and 2–3 thin translucent shock rings expanding around it (f60–91).
  - Impact (f94–99): yellow starburst spikes, cracked rock plates lifting, small yellow droplets, grey dust puff that lingers ~1.5 s as soft haze.
  - Gold sparkle: small 4-point white stars popping near gold (f235), floating bright motes around the final vein.
  - Gold dust pour: fine bright particles falling (f276–320).
  - Pellet splat: streak in 2 frames, star flash 2 frames, flat irregular yellow blob stays (f1017–1021).
  - Fuse: match flame teardrop with soft halo, then a white-hot star with ~15 radial glowing dashes (orange outer glow) and ember particles (f1547–1556); fuse keeps sparking in flight.
  - Explosion (f1650–1660): doorway goes pure white, 3–5 soft orange fireball spheres, sign knocked askew, then tan dust billows to full frame.
  - Speed lines: none drawn. Motion is sold by smears on limbs and by camera speed.
- Background life: dust motes in light cones, candle and lantern flames, steam/smoke wisps outdoors, drifting bills, lingering dust haze.

## 4. Characters

- Construction: head = perfect circle, near-white fill, thick dark outline. Body = bean/capsule torso wearing the costume, roughly 1 head wide. Arms and legs = single dark strokes of the same colour and thickness as the outline. Hands = solid dark circles (no fingers), about 2–2.5x the stroke width. Feet = short curled end of the leg stroke. No neck: head overlaps the top of the torso.
- Proportions (measured on f0008, full figure): head diameter ≈ 336 px, total height hat-brim to feet ≈ 1150 px → about 3.3–3.5 heads tall without hat. Torso ≈ 1.1 heads tall, legs ≈ 1.4 heads. Rich guy is drawn taller (longer legs, ~4 heads) and towers over the Expert, who is ~0.7x his height in S14.
- 2D or 3D: characters are flat 2D vector-style drawings composited into a 3D world. They show no perspective change on the head as the camera arcs, and the outline scales with the sprite. They do cast shadows on the ground and walls (long shadows in S14, wall shadow at the entrance in S07), so they behave like camera-facing cards inside the 3D scene.
- Turning: by swapping drawings (front, 3/4, profile). The Rich guy is in true profile for the head bang (f644–660) and front-on elsewhere. No rotation in-betweens.
- Shading on characters: flat fills plus a soft darker gradient hugging one side of the head (lower right) and one soft highlight band on torsos and hats. They stay bright even in dark tunnels (largely self-lit), with only mild scene tinting. Exception: after the blast the Rich guy is recoloured dust-grey (suit and hat #c8beb4 / #c3bbb0).
- Costume identifiers: Miner = wide brown ranger hat with brass lamp disc, red plaid vest, tan suspenders. Buddy = ribbed mustard beanie, black fringe of hair, teal sweater with small collar buttons. Rich guy = tall white top hat with black band, white double-breasted suit with 6 black buttons, red rose with green leaves, dark curled moustache, pink cheek blush. Expert = black bowler, round wire glasses, visible ears, purple coat with gold fastenings, cane. Clerk = green visor.
- Sampled colours (median of 12x12 px patches on full-res stills):
  - Head fill #fbfaf5 (lit) to #fcead9 (warm interior close-up)
  - Outline / limbs #2c1821 (dark aubergine; reads #311b24 on legs in f0008)
  - Miner hat #7c5930, hat band #3d2921, vest red #c84b3c
  - Buddy beanie #d5a32d, sweater #4fa699, hair #423634
  - Rich guy hat #f8e7d2, suit #f2e1cd, hat band #1b1519, rose #930021, leaf #489c30, moustache #402b1b, buttons #100d0f
  - Dynamite red #a61710, dynamite paper #f2d475
- Expressions seen: neutral dots, smirk, half-lid smug, wide-eyed shock, toothy grin, gritted teeth, sad frown, angry brows, happy closed arcs, X-eyes with tongue, manic one-eye squint, fingers-in-ears wince.

## 5. Outlines / ink

- Character outline colour is dark aubergine (#2c1821), not pure black.
- Weight (measured across the head edge): 16 px on a 336 px head at full-figure framing (f0008) ≈ 4.8% of head diameter; 38 px on a 554 px head in close-up (f1470) ≈ 6.9%. So weight scales with the sprite; the Rich guy's stroke is proportionally heavier than the Miner's. Limb strokes match the head outline weight.
- Line quality: uniform width, round caps and joins, no taper, very slight hand-drawn wobble.
- Inner lines: thinner (roughly 1/3 of the outline) for lapels, pockets, plaid, hat creases, moustache curls, in a slightly lighter/browner tone.
- Props: hand props are 3D/realistically shaded with **no ink outline** (shotgun, dynamite, pickaxe, pan, knife, briefcase, car). Paper props (newspaper, cash) are textured planes without outline.
- Environment: no ink outlines on geometry. Rock surfaces carry thin dark painted crack/strata lines in the texture (1–3 px at 1080p) that give a drawn feel.

## 6. World / environment and textures

- Modelling: full 3D sets, stylised and chunky. Rock is large faceted/sculpted masses; loose rocks are low-poly faceted stones; timber sets, plank walls, crates, barrels, rails and ties are clean bevelled meshes.
- Texture: hand-painted look. Sandstone has a fine speckle/noise plus thin drawn crack lines and darker painted strata; wood has smooth painted grain with dark gaps between planks; ground is soft sandy noise with scattered pebbles; metal is simple glossy (brass, steel) with strong speculars.
- Detail level: medium-high set dressing. Interiors: CANDLES crates, blue enamel kettle, tin cups, red lanterns on posts, wall candles on iron brackets, lantern jars, wooden buckets, shovels, pickaxes, spent fuse sticks, a red mine cart, an 1899 wall calendar. Assay office: plank floor, counter, scales, chalkboard. Exteriors: mesa/cliff with strata, pines, yellow aspens, waterfall, wooden town buildings, US flags, bunting.
- Signage and text props (all legible, in-world): mine sign "SURE THING MINE / EST. 1899" (serif caps, cream on tan board); cart lettering "NELLIE"; crate stencils "CANDLES"; newspaper "THE HOPEFUL HERALD", headline "MILLIONAIRE DUE TO-MORROW", subheads "WILL INSPECT THE SURE THING MINE", "TEN YEARS OF DIGGING AND NOT AN OUNCE", photo caption "MR. J. WHITLOCK, OF NEW YORK", ads "GOLD DUST BOUGHT & SOLD", "PICKS SHARPENED 10c"; chalkboard "$20.67"; calendar "SEPTEMBER 1899"; dynamite label "TIMBERLINE"; chalk tallies on tunnel walls ("'05", "'07" with arrows); floor chalk "10 FT" with an up arrow; a yellow measuring tape with numerals on the floor in the last shot.

## 7. Lighting and glow

- Interiors: warm, low-key, practical-motivated. Sources are ceiling lamps, lanterns, candles; pools of warm light with fast falloff into brown-black. Sampled: rock in light #92571f / #73462e, rock in shadow #44220e, deep tunnel #221812, lit floor #7b6e65, plank wall #8c4e1d.
- Volumetrics: a clear visible light cone from the ceiling lamp in the opening shot (cone colour ≈ #9e8a67 over dark rock), with bright dust motes inside it and an elliptical light pool on the floor. Softer haze shafts appear elsewhere; after impacts, dust haze catches the light.
- Bloom: moderate, warm. Strongest on the muzzle flash, impact starburst, fuse sparks, the explosion doorway (clips to white) and the final gold vein (glowing translucent band, gold #d5a913 / #e6b51c, quartz glow #e1b362). Candles and lanterns have small soft halos. Gold objects have hot specular highlights rather than large bloom.
- Shadows: real-time-style shadows, fairly crisp edges with slight softening, colour a warm dark brown, never pure black. Characters cast them.
- Exteriors: hard sunny key from upper left/behind camera, saturated blue sky, sandstone #c3a38a, warm haze near the horizon (#cdad6f), ground #6b6259 in shade.
- Rim light: none on characters (the ink outline does that job).
- Grade: warm amber overall, lifted blacks towards brown, high saturation on reds/yellows/teal costume colours.
- Vignette: yes, noticeable indoors. Corner luminance is roughly 30–40% of centre in interior frames (f0540: corners ≈ 55 vs centre 187; f1100: ≈ 68 vs 182 on a 0–255 scale). Part of that is lighting falloff rather than a post vignette; the split is not determinable from frames. Exteriors show little vignette.

## 8. Depth

- Depth of field: shallow DOF is used on macro inserts and close-ups (soft background behind the breech, the gold dish, the pan, the fuse; blurred rail in the foreground of the car shot at f585–615). Wides are essentially deep-focus. Strength is mild to moderate; exact aperture not determinable.
- Foreground layers: frequent foreground occluders for depth: rock wall filling the left third (S08), dark timber doorway frame (S19), rails/ties at frame bottom (S06, S07), rock pile (S04), bucket rim.
- Parallax: strong, because of the wide lens plus constant camera travel; characters slide against walls during pushes and arcs.
- Atmosphere: warm dust haze in tunnels, thicker after impacts and the blast; aerial haze on the far forest outdoors.
- Lens distortion: wide-angle perspective stretch at the edges; true barrel distortion not determinable from frames.
- Motion blur: present on fast camera moves and on fast props (streaked flecks in the pan, smeared background during the whip pan and the dynamite follow). Slow shots are crisp. Characters use drawn smears rather than optical blur.

## 9. Captions

- Font look: very heavy geometric/grotesque sans (extra-bold to black weight), tight tracking. Exact typeface not determinable from frames.
- Case: sentence case exactly as spoken; capitals only at sentence starts. Punctuation kept (commas, periods, question marks, apostrophes).
- Colour: pure white fill (#ffffff), black outline about 6 px at 1080p, plus a soft black drop shadow extending about 8 px below/right. No coloured emphasis words anywhere; no highlight box.
- Position: horizontally centred; vertical centre at about y = 1345 px = 70% of frame height (measured white-pixel extents y 1306–1389 across five stills). Fixed position for the whole video.
- Size: ascender-to-baseline height ≈ 70 px (3.6% of frame height); "loaded" spans 250 px = 23% of frame width; the widest card ("Completely insane.") spans roughly 65% of width. Always a single line.
- Words per card: 179 cards, 229 words, 3.75 words/s, mean card duration 0.34s; words-per-card distribution: 1 word: 134, 2 word: 40, 3 word: 5. The five three-word cards: "into the rock.", "up in a", "into the wall,", "the rich guy", "in his life,". The widest card is the two-word "Completely insane.".
- Card changes: hard swap on a single frame. Checked at 30 fps around several changes (f854–866, f918–930, f1067–1071): no scale pop, no fade, no slide. Cards are continuous (next card replaces the previous on the same frame); the only gap found is a single blank frame at f1286.
- Timing: synced to speech per word/phrase, independent of cuts (cards regularly straddle hard cuts).
- Other on-screen text: none added in post. All other text is in-world props (section 6). No title card, no watermark, no end card.
- Likely transcription artefacts (reported as shown): "bottles," at 45.20 (context suggests "bolt with") and "never mind" at 49.33 (context suggests "never mined").

Full caption script in order (start time, start frame, card text):

| t (s) | frame | card |
|---|---|---|
| 0.00 | f0 | He |
| 0.13 | f4 | loaded |
| 0.43 | f13 | the |
| 0.53 | f16 | shotgun |
| 0.97 | f29 | with |
| 1.13 | f34 | gold |
| 1.60 | f48 | and |
| 1.80 | f54 | fired it |
| 2.33 | f70 | into |
| 2.53 | f76 | the |
| 2.63 | f79 | walls |
| 3.00 | f90 | of the |
| 3.17 | f95 | mine. |
| 3.63 | f109 | His buddy |
| 4.17 | f125 | just |
| 4.37 | f131 | watches |
| 4.77 | f143 | the gold |
| 5.10 | f153 | vanish |
| 5.67 | f170 | into the rock. |
| 6.40 | f192 | So |
| 6.87 | f206 | we're |
| 7.00 | f210 | shooting |
| 7.33 | f220 | gold |
| 7.90 | f237 | into a |
| 8.30 | f249 | gold |
| 8.63 | f259 | mine? |
| 9.00 | f270 | You see, |
| 9.43 | f283 | it's |
| 9.63 | f289 | called |
| 9.97 | f299 | salting. |
| 10.57 | f317 | He's |
| 10.83 | f325 | dug |
| 11.03 | f331 | this |
| 11.20 | f336 | mine |
| 11.43 | f343 | for ten |
| 12.00 | f360 | years |
| 12.40 | f372 | and |
| 12.53 | f376 | found |
| 12.77 | f383 | nothing |
| 13.20 | f396 | but |
| 13.37 | f401 | rock. |
| 13.77 | f413 | And |
| 13.93 | f418 | tomorrow, |
| 14.50 | f435 | a rich |
| 14.93 | f448 | guy is |
| 15.23 | f457 | coming |
| 15.47 | f464 | to buy |
| 15.83 | f475 | it. |
| 15.97 | f479 | So |
| 16.17 | f485 | he spent |
| 16.47 | f494 | his |
| 16.57 | f497 | last |
| 16.87 | f506 | hundred |
| 17.17 | f515 | bucks |
| 17.50 | f525 | on gold |
| 17.97 | f539 | dust |
| 18.27 | f548 | instead. |
| 18.77 | f563 | Next |
| 19.10 | f573 | morning, |
| 19.50 | f585 | the rich |
| 19.87 | f596 | guy |
| 20.10 | f603 | rolls |
| 20.40 | f612 | up in a |
| 20.73 | f622 | white |
| 20.83 | f625 | suit |
| 21.47 | f644 | and |
| 21.53 | f646 | bangs |
| 21.93 | f658 | his head |
| 22.33 | f670 | on the |
| 22.50 | f675 | first |
| 22.80 | f684 | beam. |
| 23.20 | f696 | But |
| 23.37 | f701 | he's |
| 23.50 | f705 | brought |
| 23.73 | f712 | an |
| 23.83 | f715 | expert. |
| 24.30 | f729 | And |
| 24.43 | f733 | the expert |
| 25.03 | f751 | isn't |
| 25.37 | f761 | stupid. |
| 25.93 | f778 | He |
| 26.10 | f783 | smashes |
| 26.60 | f798 | a chunk |
| 26.97 | f809 | of |
| 27.07 | f812 | wall, |
| 27.43 | f823 | swirls |
| 27.93 | f838 | it in |
| 28.13 | f844 | a pan |
| 28.57 | f857 | and |
| 28.77 | f863 | gold |
| 29.10 | f873 | flakes |
| 29.60 | f888 | spin to |
| 30.00 | f900 | the bottom. |
| 30.47 | f914 | But |
| 30.63 | f919 | under |
| 30.90 | f927 | his |
| 31.00 | f930 | magnifying |
| 31.57 | f947 | glass, |
| 32.00 | f960 | every |
| 32.40 | f972 | flake |
| 32.73 | f982 | is |
| 32.90 | f987 | flat. |
| 33.43 | f1003 | Somebody |
| 33.90 | f1017 | shot |
| 34.20 | f1026 | this |
| 34.40 | f1032 | gold |
| 34.80 | f1044 | into the wall, |
| 35.57 | f1067 | but |
| 35.70 | f1071 | the rich guy |
| 36.30 | f1089 | just |
| 36.53 | f1096 | laughs. |
| 37.13 | f1114 | Why |
| 37.40 | f1122 | would |
| 37.57 | f1127 | anyone |
| 38.00 | f1140 | shoot |
| 38.23 | f1147 | gold |
| 38.70 | f1161 | into a |
| 39.00 | f1170 | wall? |
| 39.50 | f1185 | That's |
| 39.63 | f1189 | insane. |
| 40.33 | f1210 | And his |
| 40.63 | f1219 | buddy |
| 40.93 | f1228 | nods. |
| 41.43 | f1243 | Completely insane. |
| 42.90 | f1287 | So |
| 43.30 | f1299 | the rich |
| 43.67 | f1310 | guy |
| 43.87 | f1316 | pays |
| 44.20 | f1326 | up. |
| 44.43 | f1333 | And |
| 44.60 | f1338 | while |
| 44.77 | f1343 | those |
| 45.00 | f1350 | two |
| 45.20 | f1356 | bottles, |
| 45.60 | f1368 | the money, |
| 46.03 | f1381 | he stays |
| 46.53 | f1396 | behind |
| 47.00 | f1410 | and |
| 47.10 | f1413 | pulls |
| 47.37 | f1421 | a stick |
| 47.77 | f1433 | of |
| 47.87 | f1436 | dynamite |
| 48.47 | f1454 | out |
| 48.60 | f1458 | of his |
| 48.77 | f1463 | suit. |
| 49.13 | f1474 | He's |
| 49.33 | f1480 | never mind |
| 50.03 | f1501 | a day |
| 50.47 | f1514 | in his life, |
| 51.10 | f1533 | so |
| 51.27 | f1538 | he just |
| 51.53 | f1546 | lights |
| 51.90 | f1557 | it, |
| 52.00 | f1560 | tosses |
| 52.47 | f1574 | it down |
| 52.77 | f1583 | the tunnel |
| 53.10 | f1593 | like a |
| 53.37 | f1601 | firecracker |
| 54.17 | f1625 | and runs. |
| 55.03 | f1651 | When |
| 55.20 | f1656 | the dust |
| 55.60 | f1668 | clears, |
| 56.10 | f1683 | there's |
| 56.37 | f1691 | a vein |
| 56.77 | f1703 | of real |
| 57.33 | f1720 | gold |
| 57.70 | f1731 | as |
| 57.90 | f1737 | thick |
| 58.20 | f1746 | as your |
| 58.47 | f1754 | arm. |
| 58.83 | f1765 | Ten |
| 59.17 | f1775 | feet |
| 59.47 | f1784 | past |
| 59.80 | f1794 | where |
| 59.93 | f1798 | the |
| 60.00 | f1800 | last |
| 60.27 | f1808 | guy |
| 60.47 | f1814 | gave |
| 60.70 | f1821 | up. |

## 10. Script / story structure

- Hook (0–2.0 s): opens mid-action on the oddest image in the story, with no title or intro: a cartoon miner under a spotlight loads a shotgun with gold and fires it straight at the lens. Words in the first 2 s: "He loaded the shotgun with gold and fired it". The first camera whip starts at f16 (0.53 s) and the muzzle flash lands at 1.93 s.
- Question beat (2–10.5 s): the buddy voices the viewer's confusion ("So we're shooting gold into a gold mine?"), then the term is named ("You see, it's called salting.").
- Backstory (10.5–19 s): ten years of digging, nothing but rock, a rich buyer arrives tomorrow, last hundred bucks spent on gold dust.
- Escalation (19–35.5 s): rich guy arrives (head-bang gag), brings an expert, the expert tests the wall, pans, and catches the fraud ("every flake is flat. Somebody shot this gold into the wall").
- Reversal 1 (35.5–45 s): the rich guy laughs it off ("Why would anyone shoot gold into a wall? That's insane."), pays up; the cons flee with the cash.
- Reversal 2 / payoff (46–59 s): rich guy pulls dynamite from his suit, lights it, tosses it, runs; the blast exposes "a vein of real gold as thick as your arm."
- Button (58.8–61.07 s): "Ten feet past where the last guy gave up." with the visual reveal of "10 FT" chalk, pickaxe and abandoned hat. Ends on the last word; no outro, no call to action. Loop: the last frame (lit vein chamber) and first frame (miner in a light cone in a tunnel) are both warm tunnel interiors, but there is no engineered match cut; whether it is intended as a loop is not determinable.
- Pacing: 229 words in 61.07 s = 3.75 words/s, narration essentially gapless. Visual beats per 10 s (cuts/dissolves/whips + major actions): 0–10 s: 2 scene changes, ~6 action beats; 10–20 s: 3 changes; 20–30 s: 4; 30–40 s: 5; 40–50 s: 4 (plus whip pan); 50–61 s: 5. Cutting accelerates through the middle and again at the climax (three cuts in 3.5 s at 51.2–54.7 s).

## 11. Replication notes (Three.js parameters)

Scene and camera
- Canvas 1080x1920, 30 fps. PerspectiveCamera vertical FOV ≈ 55–65° for wides (wide-angle feel on a 9:16 frame); keep the same FOV and move the camera close for inserts rather than zooming.
- Never leave the camera static. Baseline per shot: constant-velocity dolly-in giving ~2–5% subject scale growth per second, plus a small lateral drift/arc (1–3° over the shot). Start the move before the shot's first frame so frame 0 is already moving.
- Fast re-frame: 10–18 frames, abrupt start, ease-out (e.g. cubic-out) into the creep. Use it to go wide → macro inside a shot (push + tilt down 40–70°).
- Object-follow shots: parent the camera target to the projectile for 1.0–1.8 s, with motion blur.
- Whip pan: ~18 frames, heavy directional blur in the middle 8–10 frames.
- Editing grammar for this video: hard cuts are allowed and frequent (15 in 61 s, shots 0.9–7.5 s, mean 2.9 s). Crossfades are short: 6–8 frames. One thematic wipe (dust). Cut on action or mid-phrase; do not wait for caption boundaries.
- Camera height: slightly above head height looking down 10–25° for interiors; low angle for power/arrival shots.

Characters
- Flat 2D sprites on camera-facing planes inside the 3D scene; enable shadow casting (alpha-tested) so they drop shadows on floor and walls. Use unlit or mostly-unlit material (MeshBasicMaterial, or toon with emissive ≈ 0.8) so they stay bright in dark sets; allow an overall tint for story states (dust-grey).
- Head circle fill #fbfaf5, outline #2c1821 at 5–7% of head diameter, round caps. Limbs as strokes of the same width; hands as filled circles 2–2.5x stroke width. Height 3.3–4 heads.
- Animate pose-to-pose: hold 3–15 frames, swap in 1–2 frames. Mouth sprite swap every 1–3 frames while speaking (7 shapes listed in section 3). Eye variants as sprite swaps. Squash/stretch only on impacts (2–4 frames). Run = smear-leg sprite.
- Hand props are real 3D meshes with PBR-ish shading and no outline, attached at the hand circle.

World
- Stylised 3D with hand-painted textures: sandstone speckle + thin dark crack lines; clean wood grain; no outline pass on the environment.
- Palette: rock lit #92571f, rock mid #73462e, rock shadow #44220e, tunnel black #221812, plank #8c4e1d, lit floor #7b6e65, exterior cliff #c3a38a, ballast #b58c68, gold #d5a913–#e6b51c, paper #faf2ca.

Lighting and post
- Interiors: 1–3 warm point/spot lights (≈ 2700–3200 K look), strong falloff, low warm ambient so blacks sit at dark brown. Shadow maps with slightly soft edges.
- Volumetric cone under ceiling lamps: additive cone mesh at ~35–45% opacity, colour ≈ #9e8a67, with 20–40 slow dust-mote points inside.
- Bloom (UnrealBloomPass): threshold ≈ 0.85, strength ≈ 0.4–0.6 baseline, radius ≈ 0.5; spike strength to 1.5–2.5 for 2 frames on gunshot/explosion flashes.
- Vignette: darken corners to ~40–50% indoors, ~85–90% outdoors. Warm grade (slight amber lift).
- DOF (BokehPass) only on macro inserts and close-ups; off or minimal on wides.
- Motion blur on fast camera moves only.
- Particles: dust motes (always), impact chips + dust puff (lingers ~1.5 s), 4-point sparkle sprites near gold, fuse sparks (radial dashes, 12–16, white core with orange glow), fireball spheres + full-frame dust for the wipe.

Captions
- HTML/canvas overlay, heavy sans (e.g. an extra-bold/black geometric sans), white fill, 6 px black stroke, soft shadow ~8 px down-right; font size so ascender height ≈ 3.6% of frame height; single line, centred at 70% of frame height.
- 1–2 words per card (75% one word, 22% two, 3% three), mean card length 0.34 s, hard swap with no animation, no gaps, no colour emphasis.
- Script density target: ~3.75 words/s, ~230 words for 61 s.
