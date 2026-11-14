# Camera and scene joins

Evidence: "Camera" and the shot lists in `reference/analysis/<video>.md` and `<video>.shots.json`.

## Rule one: the camera never stops [measured]

- pink-prison: 4 of 1,956 frame pairs show under 0.5 % change. Longest near-hold about 6 frames.
- one-cart: no run of even 6 near-static frames. Still creeping on the last frame.
- mine-salting: no locked-off run. Quietest stretch about 1.7 s of slow creep.

Never give the camera zero velocity. Not at the start of a shot, not at the end, not during a dissolve.

## The baseline move

Every setup, when nothing else is happening, has a slow creep:

- Dolly in so the subject grows 2 to 5 % per second (up to 8 % in pink-prison) **[measured]**.
- Plus a slight arc or sideways drift: 1 to 3 degrees per second around the subject.
- It is already running on the shot's first frame.

## Move catalogue

| Move | Length | Easing | Seen in |
| --- | --- | --- | --- |
| Creep push with arc | whole shot | constant | all |
| Fast push, wide to close or macro, often with a 40 to 70 degree tilt down | 8 to 24 frames | abrupt start, ease out into the creep | all |
| Whip pan | 12 to 18 frames, blurred in the middle 8 to 10 | fast in, fast out | pink-prison, mine-salting |
| Orbit around a subject or prop | 2 to 5 s | constant | one-cart |
| Object follow (camera rides with a nugget, a stick of dynamite, a rocket) | 1.0 to 1.8 s | locked to the object | mine-salting, one-cart |
| Fly-over or fly-through (up a wall and over the gatehouse; up through a roof; through a magnifying-glass ring) | 18 to 50 frames | ease in and out | all |
| Push into a screen or prop that becomes the next scene | about 10 frames | accelerating | pink-prison |
| Doorway push-through | 4 to 28 frames | constant | pink-prison |
| Crane to top-down | 1 to 2 s | ease | pink-prison |
| Pull back to reveal the wide | 1 to 3 s | ease out | one-cart |

Roll: only during fast travelling arcs, up to about 15 to 20 degrees, level on landing **[seen in pink-prison]**. No handheld shake and no dutch angles were seen.

## Joining scenes

| Join | Detail | Use |
| --- | --- | --- |
| Cross-dissolve | 4 to 12 frames (one-cart 4 to 8, pink-prison 7 to 12). Both cameras keep moving through it. Often composition-matched: a pink paint circle becomes the pink cell; a gold splat lands where a face will be | Default |
| Travel join | The camera physically goes there: through the roof, over the wall, through a door, into a monitor | One or two per video, at the biggest location change |
| Whip pan | Hides the change in the blur | Occasionally |
| Effect-masked | A muzzle flash or a full-frame dust cloud covers the swap | When the story supplies one |
| Hard cut | mine-salting has 15; the other two have none | Only for a deliberate jolt **[choice: default off, for continuity]** |

Captions sit above the join and are not dissolved. Narration runs straight across it.

## Pacing

- A new setup or a major camera event about every 3 s. Reference shot lengths: mean 2.9 to 3.5 s, range 0.9 to 14.75 s.
- For a 30 to 40 s video, plan 10 to 14 setups.
- One long continuous take (5 to 10 s) for the "process" part of the story, where the camera travels from wide to macro to wide while the character builds or does the thing.
- Open: one continuous move for the first 2 s that ends on the odd detail (push to the shotgun breech; the roller stroke up the wall).
- Close: the references end either mid-effect (pink-prison), on a 1.4 s creeping hero hold in front of the payoff (one-cart), or on a slow push at the revealed vein (mine-salting). Still moving on the last frame in every case.

## Planning a shot

For each row of the shot plan write: start pose and end pose of the camera, the fast event (if any) and the frame it lands on, the join out. Land fast moves on the stressed word of the narration. Then check the join: the next shot's camera must already be moving in a compatible direction.

## Checks

- Frame differencing over the whole render: no static pairs.
- Scrub each join frame by frame: both sides moving, no pop in brightness.
- Count setups: 10 to 14 for 30 to 40 s.
