// Camera paths. The rule from the references: the camera is NEVER still.
// Every framing carries a baseline creep (dolly-in + slight arc) that is
// already running on the shot's first frame, and fast re-frames ease OUT into
// the next framing's creep.
//
// A path is a list of keys. Times are video seconds.
//   { t, pos:[x,y,z], look:[x,y,z], fov?, roll?, frames?, ease?, push?, arc?, rise?, blur? }
//   t       when the move TO this framing starts (first key: the framing the shot opens on)
//   frames  length of that move in frames (default 14; 10-18 = fast re-frame, 12-18 = whip pan)
//   ease    easing name for the move (default 'outCubic': abrupt start, soft landing)
//   push    creep: fraction of the camera-to-target distance closed per second (default 0.035)
//   arc     creep: degrees per second of yaw around the target (default 1.5; sign = direction)
//   rise    creep: world units per second of vertical drift (default 0)
//   blur    sub-frame samples of motion blur during the move (0 = off; 6 is plenty)
import * as THREE from 'three';

export const ease = {
  linear: (u) => u,
  inQuad: (u) => u * u,
  outQuad: (u) => 1 - (1 - u) * (1 - u),
  inOutQuad: (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2),
  inCubic: (u) => u * u * u,
  outCubic: (u) => 1 - Math.pow(1 - u, 3),
  inOutCubic: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  outQuart: (u) => 1 - Math.pow(1 - u, 4),
  outExpo: (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u)),
  outBack: (u) => 1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2),
  step: (u) => (u < 1 ? 0 : 1),
};

export const clamp01 = (u) => Math.min(1, Math.max(0, u));
export const lerp = (a, b, u) => a + (b - a) * u;

const DEFAULTS = { fov: 60, roll: 0, frames: 14, ease: 'outCubic', push: 0.035, arc: 1.5, rise: 0, blur: 0 };

const _off = new THREE.Vector3();
const _Y = new THREE.Vector3(0, 1, 0);

/** One framing with its creep applied for `tau` seconds (tau may be negative). */
function creepPose(key, tau, out) {
  _off.set(key.pos[0] - key.look[0], key.pos[1] - key.look[1], key.pos[2] - key.look[2]);
  _off.multiplyScalar(Math.exp(-key.push * tau));
  _off.applyAxisAngle(_Y, THREE.MathUtils.degToRad(key.arc * tau));
  out.pos.set(key.look[0] + _off.x, key.look[1] + _off.y + key.rise * tau, key.look[2] + _off.z);
  out.look.set(key.look[0], key.look[1], key.look[2]);
  out.fov = key.fov;
  out.roll = key.roll;
  return out;
}

const mkPose = () => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 60, roll: 0, blur: 0, moving: 0 });

/**
 * Build a camera path.
 * @param {object[]} keys  see the header
 * @param {object} [defaults]  defaults for every key (push, arc, fov, ...)
 * @returns {{keys: object[], at(t:number, fps?:number, out?:object): object, apply(camera, t, fps?): object}}
 */
export function cameraPath(keys, defaults = {}) {
  if (!Array.isArray(keys) || keys.length === 0) throw new Error('cameraPath: at least one key is required');
  const ks = keys.map((k, i) => {
    if (!k.pos || !k.look) throw new Error(`cameraPath: key ${i} needs pos and look`);
    return { ...DEFAULTS, ...defaults, ...k, t: k.t ?? 0 };
  });
  ks.sort((a, b) => a.t - b.t);
  const a = mkPose(), b = mkPose();

  function at(t, fps = 30, out = mkPose()) {
    // Start from the first framing, then fold in every move that has started.
    creepPose(ks[0], t - ks[0].t, out);
    out.blur = 0; out.moving = 0;
    for (let i = 1; i < ks.length; i++) {
      const k = ks[i];
      if (t < k.t) break;
      const dur = Math.max(1, k.frames) / fps;
      const u = clamp01((t - k.t) / dur);
      const e = (ease[k.ease] ?? ease.outCubic)(u);
      creepPose(k, t - k.t, b);
      a.pos.copy(out.pos); a.look.copy(out.look); a.fov = out.fov; a.roll = out.roll;
      out.pos.lerpVectors(a.pos, b.pos, e);
      out.look.lerpVectors(a.look, b.look, e);
      out.fov = lerp(a.fov, b.fov, e);
      out.roll = lerp(a.roll, b.roll, e);
      if (u < 1) { out.blur = k.blur; out.moving = 1; } else { out.blur = 0; out.moving = 0; }
    }
    return out;
  }

  const tmp = mkPose();
  function apply(camera, t, fps = 30) {
    const p = at(t, fps, tmp);
    camera.position.copy(p.pos);
    camera.up.set(0, 1, 0);
    camera.lookAt(p.look);
    if (p.roll) camera.rotateZ(THREE.MathUtils.degToRad(p.roll));
    if (camera.fov !== p.fov) { camera.fov = p.fov; camera.updateProjectionMatrix(); }
    camera.updateMatrixWorld(true);
    return p;
  }

  return { keys: ks, at, apply };
}

/**
 * Convenience: a framing described the way a director would.
 * orbit({ target:[x,y,z], dist, yaw, pitch }) -> { pos, look }
 * yaw 0 looks down -Z at the target (camera on +Z); positive yaw moves the camera toward +X.
 * pitch > 0 puts the camera above the target looking down.
 */
export function orbit({ target, dist, yaw = 0, pitch = 0, ...rest }) {
  const y = THREE.MathUtils.degToRad(yaw), p = THREE.MathUtils.degToRad(pitch);
  return {
    pos: [target[0] + Math.sin(y) * Math.cos(p) * dist, target[1] + Math.sin(p) * dist, target[2] + Math.cos(y) * Math.cos(p) * dist],
    look: [...target],
    ...rest,
  };
}
