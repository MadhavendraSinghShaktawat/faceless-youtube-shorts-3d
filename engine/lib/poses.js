// Named poses. A pose is a plain object of joint angles in degrees; a pose
// track steps between them with NO interpolation (the references hold a pose
// 2-15 frames and swap it in one frame).
//
// Limb format: [a1, f1, a2, f2]  = upper segment, lower segment, each as
//   a  angle in the character's frontal plane, measured from straight down.
//      positive = away from the body's midline, 90 = horizontal, 180 = straight up,
//      negative = across the body.
//   f  forward tilt toward the character's front (negative = behind).
// Segment angles are absolute (the forearm does not inherit the upper arm),
// which is how you think when drawing a stick figure pose.
//
// Other keys:
//   lean      upper body forward (+) / back (-)
//   tilt      upper body sideways, + toward the character's left
//   twist     upper body yaw
//   headTurn  + toward the character's left;  headNod + looks down;  headTilt + toward left shoulder
//   dy        extra vertical offset in head units (jump +, sink -)
//   ground    false = do not auto-plant the feet (use with dy for flying / falling)
//   sx, sy    squash and stretch of the whole figure (impacts only; 2-4 frames)
//
// L / R are the CHARACTER's own left and right.

const P = (o) => Object.freeze(o);

export const BASE_POSE = P({
  armL: [8, 0, 5, 6], armR: [8, 0, 5, 6],
  legL: [4, 0, 4, 0], legR: [4, 0, 4, 0],
  lean: 0, tilt: 0, twist: 0, headTurn: 0, headNod: 0, headTilt: 0,
  dy: 0, ground: true, sx: 1, sy: 1,
});

export const POSES = {
  stand: P({}),
  idle: P({ armL: [10, 0, 4, 12], armR: [9, 0, 6, 10], tilt: 1.5, headTilt: -2 }),
  // one arm
  holdUp: P({ armR: [72, 25, 172, 12] }),              // forearm vertical, hand at head height: "look at this"
  holdOut: P({ armR: [35, 55, 70, 78] }),              // hand out in front at chest height
  holdLow: P({ armR: [14, 30, 20, 72] }),              // hand in front of the belly
  point: P({ armR: [84, 30, 86, 32], headTurn: -8 }),  // straight arm, out to the side and forward
  pointFwd: P({ armR: [18, 78, 18, 82] }),             // straight at whatever the character faces
  pointUp: P({ armR: [132, 6, 172, 4], headNod: -8 }),
  wave1: P({ armR: [128, 8, 172, 4] }),
  wave2: P({ armR: [128, 8, 128, 4] }),
  think: P({ armR: [22, 48, -166, 30], armL: [16, 30, -70, 55], headTilt: 6, headNod: 4 }),
  facepalm: P({ armR: [30, 55, -172, 38], headNod: 14, lean: 6 }),
  salute: P({ armR: [80, 25, -150, 30] }),
  // both arms
  armsUp: P({ armL: [126, 4, 166, 2], armR: [126, 4, 166, 2] }),
  cheer: P({ armL: [118, 0, 150, 0], armR: [118, 0, 150, 0], dy: 0.12, legL: [9, 0, 6, 0], legR: [9, 0, 6, 0] }),
  shrug: P({ armL: [38, 6, 118, 22], armR: [38, 6, 118, 22], headTilt: 5 }),
  hips: P({ armL: [52, -12, -28, 18], armR: [52, -12, -28, 18] }),
  crossed: P({ armL: [18, 38, -84, 60], armR: [18, 38, -84, 62] }),
  shock: P({ armL: [62, 10, 122, 12], armR: [62, 10, 122, 12], legL: [10, 0, 9, 0], legR: [10, 0, 9, 0], lean: -7 }),
  cower: P({ armL: [34, 60, -150, 44], armR: [34, 60, -150, 44], legL: [8, 32, 8, -34], legR: [8, 32, 8, -34], lean: 22, headNod: 16 }),
  push: P({ armL: [10, 78, 10, 86], armR: [10, 78, 10, 86], legL: [3, 30, 3, 6], legR: [3, -26, 3, -44], lean: 16 }),
  carry: P({ armL: [16, 42, 6, 82], armR: [16, 42, 6, 82] }),
  beg: P({ armL: [20, 60, -10, 110], armR: [20, 60, -10, 110], lean: 8, headNod: -8 }),
  // locomotion (alternate A/B every 4-5 frames; see walk())
  walkA: P({ legL: [2, 30, 2, 8], legR: [2, -22, 2, -48], armL: [8, -24, 8, -4], armR: [8, 26, 8, 48], lean: 4 }),
  walkB: P({ legL: [2, -22, 2, -48], legR: [2, 30, 2, 8], armL: [8, 26, 8, 48], armR: [8, -24, 8, -4], lean: 4 }),
  runA: P({ legL: [2, 58, 2, 4], legR: [2, -38, 2, -96], armL: [10, -50, 10, 30], armR: [10, 55, 10, 120], lean: 16, dy: 0.08 }),
  runB: P({ legL: [2, -38, 2, -96], legR: [2, 58, 2, 4], armL: [10, 55, 10, 120], armR: [10, -50, 10, 30], lean: 16, dy: 0.08 }),
  // seated / low
  sit: P({ legL: [6, 86, 4, 6], legR: [6, 86, 4, 6], armL: [12, 22, 4, 56], armR: [12, 22, 4, 56] }),
  sitSlump: P({ legL: [10, 80, 6, 20], legR: [10, 80, 6, 20], armL: [10, 10, 6, 20], armR: [10, 10, 6, 20], lean: 14, headNod: 18 }),
  crouch: P({ legL: [12, 62, 10, -62], legR: [12, 62, 10, -62], armL: [14, 30, 8, 60], armR: [14, 30, 8, 60], lean: 18 }),
  kneel: P({ legL: [4, 8, 4, -88], legR: [4, 8, 4, -88], lean: 6 }),
  // air
  jump: P({ armL: [126, 0, 160, 0], armR: [126, 0, 160, 0], legL: [14, 12, 10, -40], legR: [14, 12, 10, -40], dy: 0.55, ground: false }),
  fall: P({ armL: [120, 20, 150, 10], armR: [120, 20, 150, 10], legL: [22, 20, 26, 10], legR: [22, 20, 26, 10], lean: -14, ground: false }),
  // impact accents (hold 2-4 frames, then return)
  squash: P({ sx: 1.14, sy: 0.84, legL: [12, 20, 10, -24], legR: [12, 20, 10, -24] }),
  stretch: P({ sx: 0.9, sy: 1.12 }),
};

/** Register (or replace) a named pose. Missing keys fall back to BASE_POSE. */
export function definePose(name, pose) {
  POSES[name] = Object.freeze({ ...pose });
  return POSES[name];
}

/** Swap left and right (limbs, tilt, twist, head turn/tilt). */
export function mirrorPose(pose) {
  const p = resolvePose(pose);
  return {
    ...p, armL: p.armR, armR: p.armL, legL: p.legR, legR: p.legL,
    tilt: -p.tilt, twist: -p.twist, headTurn: -p.headTurn, headTilt: -p.headTilt,
  };
}

/**
 * Turn a pose reference into a full pose object.
 *   'stand' | { armR:[...] } | ['holdUp', { headTurn: 20 }] | ['mirror', 'holdUp']
 */
export function resolvePose(ref) {
  if (ref == null) return BASE_POSE;
  if (typeof ref === 'string') {
    const p = POSES[ref];
    if (!p) throw new Error(`unknown pose "${ref}". Known: ${Object.keys(POSES).join(', ')}`);
    return { ...BASE_POSE, ...p };
  }
  if (Array.isArray(ref)) {
    if (ref[0] === 'mirror') return mirrorPose(ref[1]);
    return { ...resolvePose(ref[0]), ...(ref[1] ?? {}) };
  }
  return { ...BASE_POSE, ...ref };
}

export const poseNames = () => Object.keys(POSES);

/**
 * Stepped walk: returns track keys that alternate walkA / walkB and move the
 * character in discrete jumps, one per pose (no sliding between poses).
 *   walk({ from:[x,y,z], to:[x,y,z], t0, t1, every: 4, fps: 30, run: false })
 * The last key is at t1 with pose `end` (default 'stand').
 */
export function walk({ from, to, t0, t1, every = 4, fps = 30, run = false, end = 'stand', face }) {
  const keys = [];
  const steps = Math.max(1, Math.round(((t1 - t0) * fps) / every));
  const yaw = face ?? (Math.atan2(to[0] - from[0], to[2] - from[2]) * 180) / Math.PI;
  for (let i = 0; i < steps; i++) {
    const u = i / steps;
    keys.push({
      t: t0 + (i * every) / fps,
      pose: (run ? ['runA', 'runB'] : ['walkA', 'walkB'])[i % 2],
      at: [from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, from[2] + (to[2] - from[2]) * u],
      face: yaw,
    });
  }
  keys.push({ t: t1, pose: end, at: [...to], face: yaw });
  return keys;
}
