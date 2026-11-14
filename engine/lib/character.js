// The character rig: a procedural 3D stick figure that reads as a flat 2D ink
// drawing from any camera angle, but casts real shadows and foreshortens.
//
//   head   unlit off-white sphere + inverted-hull ink outline
//   face   canvas drawing on a camera-facing decal (slides with the head turn)
//   torso  unlit capsule with a costume texture + ink outline
//   limbs  thin unlit ink tubes with round joints, ball hands
//   hair / hat / hand props: simple outlined meshes
//
// All sizes below are in HEAD DIAMETERS; the root group is scaled by `size`
// (world units per head diameter). The figure is ~3.6 heads tall.
import * as THREE from 'three';
import { createOutlineMaterial, solidify } from './outline.js';
import { resolvePose } from './poses.js';
import { drawFace, faceKey, EXPRESSIONS, TALK_CYCLE } from './faces.js';
import { hash, seedOf } from './rng.js';

export const INK = '#2c1821';
export const SKIN = '#fbfaf5';

const LEG = [0.84, 0.84];
const ARM = [0.56, 0.56];
const LIMB_R = 0.031;
const HAND_R = 0.078;
const TORSO_R = 0.3;

const D2R = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3();

const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true);
const unitBall = new THREE.SphereGeometry(1, 14, 10);

function segDir(a, f, side, out) {
  const ar = a * D2R, fr = f * D2R;
  return out.set(side * Math.sin(ar) * Math.cos(fr), -Math.cos(ar) * Math.cos(fr), Math.sin(fr));
}

// ---------------------------------------------------------------- costumes

/**
 * Paint a torso texture. The canvas wraps once around the body; x = w/2 is the
 * centre of the chest, the visible front is roughly x in [w/4, 3w/4], and the
 * straight part of the torso is y in [h*0.33, h*0.67] (top third = shoulders).
 */
function paintCostume(body) {
  const w = 512, h = 512;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const col = body.color ?? '#f4f1ea';
  g.fillStyle = col; g.fillRect(0, 0, w, h);
  const ink = body.ink ?? INK;
  const cx = w / 2;
  const pat = body.pattern ?? 'plain';
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (typeof pat === 'function') {
    pat(g, w, h);
  } else if (pat === 'tie') {
    const tie = body.accent ?? '#8a5326', stripe = body.accent2 ?? '#e0a55a';
    const top = h * 0.14, knot = h * 0.2, bottom = h * 0.66, hw = 30;
    const path = () => { g.beginPath(); g.moveTo(cx - 13, top); g.lineTo(cx + 13, top); g.lineTo(cx + 16, knot); g.lineTo(cx + hw, bottom - 46); g.lineTo(cx, bottom); g.lineTo(cx - hw, bottom - 46); g.lineTo(cx - 16, knot); g.closePath(); };
    path(); g.fillStyle = tie; g.fill();
    g.save(); path(); g.clip(); g.strokeStyle = stripe; g.lineWidth = 9;
    for (let y = knot + 26; y < bottom; y += 44) { g.beginPath(); g.moveTo(cx - 50, y + 14); g.lineTo(cx + 50, y - 14); g.stroke(); }
    g.restore();
    path(); g.strokeStyle = ink; g.lineWidth = 7; g.stroke();
  } else if (pat === 'stripes') {
    const n = body.count ?? 7; g.fillStyle = body.accent ?? '#2b2b33';
    for (let i = 0; i < n; i++) g.fillRect(0, h * 0.1 + (i * h * 0.8) / n, w, (h * 0.8) / n / 2);
  } else if (pat === 'buttons') {
    const acc = body.accent ?? '#c23b2e';
    g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, h * 0.2); g.lineTo(cx, h * 0.44); g.stroke();
    // collar
    g.fillStyle = acc; g.beginPath(); g.moveTo(cx - 62, h * 0.12); g.lineTo(cx, h * 0.22); g.lineTo(cx + 62, h * 0.12); g.lineTo(cx + 40, h * 0.07); g.lineTo(cx - 40, h * 0.07); g.closePath(); g.fill();
    g.fillStyle = body.accent2 ?? '#f4ecd8';
    for (const y of [0.27, 0.34, 0.41]) { g.beginPath(); g.arc(cx, h * y, 8, 0, 7); g.fill(); g.stroke(); }
  } else if (pat === 'grid') {
    g.strokeStyle = body.accent ?? '#00000055'; g.lineWidth = 4;
    for (let y = h * 0.1; y < h * 0.9; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let x = 0; x < w; x += 26) { g.beginPath(); g.moveTo(x, h * 0.1); g.lineTo(x, h * 0.9); g.stroke(); }
    if (body.accent2) { g.fillStyle = body.accent2; g.fillRect(0, h * 0.6, w, 22); }
  } else if (pat === 'sash') {
    g.strokeStyle = body.accent ?? '#c23b2e'; g.lineWidth = 46; g.beginPath(); g.moveTo(cx - 150, h * 0.12); g.lineTo(cx + 150, h * 0.7); g.stroke();
  } else if (pat === 'belt') {
    g.fillStyle = body.accent ?? '#3b2a20'; g.fillRect(0, h * 0.56, w, 30);
    g.fillStyle = body.accent2 ?? '#e6b51c'; g.fillRect(cx - 16, h * 0.56 - 3, 32, 36);
  } else if (pat === 'apron') {
    g.fillStyle = body.accent ?? '#f4ecd8'; g.beginPath(); g.roundRect(cx - 70, h * 0.24, 140, h * 0.6, 16); g.fill(); g.strokeStyle = ink; g.lineWidth = 5; g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.offset.x = 0.25; // u = 0.25 is the +Z (front) side of the capsule
  t.anisotropy = 4;
  return t;
}

// ---------------------------------------------------------------- the rig

/**
 * @param {object} o
 * @param {string} [o.name]
 * @param {number} [o.size=0.5]      world units per head diameter (figure height = ~3.6 * size)
 * @param {string} [o.skin]          head colour, default #fbfaf5
 * @param {string} [o.ink]           outline / limb colour, default #2c1821
 * @param {number} [o.outline=0.048] outline width as a fraction of the head diameter (0.04-0.06)
 * @param {object} [o.body]          { color, pattern, accent, accent2, width=0.6, height=1.08, depth }
 *                                   pattern: plain | tie | stripes | buttons | grid | sash | belt | apron | (g,w,h)=>void
 * @param {object} [o.hair]          { style: cap | bowl | bun | long | none, color }
 * @param {object} [o.hat]           { style: beanie | helmet | hardhat | tophat | cap | crown | cone, color, band }
 * @param {string} [o.expr]          default expression
 */
export class Character {
  constructor(o = {}) {
    this.name = o.name ?? 'character';
    this.size = o.size ?? 0.5;
    this.seed = seedOf(this.name);
    this.ink = new THREE.Color(o.ink ?? INK);
    this.inkCss = o.ink ?? INK;
    this.outlineFrac = o.outline ?? 0.048;
    this.defaultExpr = o.expr ?? 'neutral';
    this._tint = new THREE.Color(1, 1, 1);
    this._mats = []; // [material, baseColor]
    this._faceCache = new Map();
    this._attached = {};

    const body = { color: '#f4f1ea', width: 0.6, height: 1.08, ...(o.body ?? {}) };
    this.body = body;
    this.hipHalf = Math.min(0.13, body.width * 0.26);
    this.shoulderHalf = body.width / 2 - 0.03;
    this.shoulderY = body.height - 0.34;
    this.headY = body.height + 0.5 - 0.15;

    this.root = new THREE.Group(); this.root.name = `char:${this.name}`;
    this.root.userData.character = this;
    this.upper = new THREE.Group(); this.root.add(this.upper);   // torso, arms, head: leans from the hip
    this.lower = new THREE.Group(); this.root.add(this.lower);   // legs
    this.headGroup = new THREE.Group(); this.headGroup.position.y = this.headY; this.upper.add(this.headGroup);

    this.outlineMat = createOutlineMaterial({ mode: 'world', thickness: this.outlineFrac * this.size, color: this.ink, useOutlineNormal: true });
    this.inkMat = this._mat(this.ink);

    // head
    this.head = this._mesh(new THREE.SphereGeometry(0.5, 40, 28), this._mat(o.skin ?? SKIN), this.headGroup, true);

    // torso
    const tg = new THREE.CapsuleGeometry(TORSO_R, body.height - TORSO_R * 2, 10, 32);
    const tm = this._mat('#ffffff', paintCostume(body));
    this.torso = this._mesh(tg, tm, this.upper, true);
    this.torso.position.y = body.height / 2 - 0.04;
    this.torso.scale.set(body.width / (TORSO_R * 2), 1, (body.depth ?? body.width) / (TORSO_R * 2));

    // limbs: [upper segment, lower segment, joint ball, end ball]
    const limb = (parent, hand) => {
      const s1 = new THREE.Mesh(unitCyl, this.inkMat), s2 = new THREE.Mesh(unitCyl, this.inkMat);
      const j0 = new THREE.Mesh(unitBall, this.inkMat), j1 = new THREE.Mesh(unitBall, this.inkMat), j2 = new THREE.Mesh(unitBall, this.inkMat);
      j0.scale.setScalar(LIMB_R); j1.scale.setScalar(LIMB_R); j2.scale.setScalar(hand ? HAND_R : LIMB_R);
      const anchor = new THREE.Group();
      for (const m of [s1, s2, j0, j1, j2]) { m.castShadow = true; parent.add(m); }
      parent.add(anchor);
      return { s1, s2, j0, j1, j2, anchor };
    };
    this.limbs = { armL: limb(this.upper, true), armR: limb(this.upper, true), legL: limb(this.lower, false), legR: limb(this.lower, false) };
    this.hands = { L: this.limbs.armL.anchor, R: this.limbs.armR.anchor };

    if (o.hair && o.hair.style !== 'none') this._buildHair(o.hair);
    this.faceDrop = 0;
    if (o.hat) this._buildHat(o.hat);

    // face decal
    this.faceMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, fog: true });
    this.face = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.faceMat);
    this.face.renderOrder = 5;
    this.face.userData.noOutline = true; this.face.userData.noDepth = true;
    this.root.add(this.face);

    this.state = { expr: this.defaultExpr, mouth: null, blink: false, scale: 1 };
    this.root.scale.setScalar(this.size);
    this.applyPose('stand');
    this._setFace(this.state);
  }

  _mat(color, map = null) {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), map, toneMapped: false });
    this._mats.push([m, m.color.clone()]);
    return m;
  }

  _mesh(geo, mat, parent, outlined) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    parent.add(m);
    if (outlined) solidify(m, { material: this.outlineMat, smoothNormals: true });
    return m;
  }

  /** A thin ink ring: the drawn edge of an open cap (hair line, hat rim). */
  _rim(parent, radius, y, tilt = 0) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, this.outlineFrac * 0.5, 6, 48), this.inkMat);
    ring.rotation.x = Math.PI / 2; ring.position.y = y;
    const g = new THREE.Group(); g.rotation.x = tilt; g.add(ring); parent.add(g);
    return g;
  }

  _buildHair(h) {
    const mat = this._mat(h.color ?? '#6b4226');
    const style = h.style ?? 'cap';
    const R = 0.522;
    const theta = style === 'bowl' ? 1.42 : 1.3;        // how far down the cap reaches
    const tilt = style === 'bowl' ? -0.16 : -0.32;       // tipped back: high on the forehead, low at the nape
    const cap = this._mesh(new THREE.SphereGeometry(R, 40, 16, 0, Math.PI * 2, 0, theta), mat, this.headGroup, true);
    cap.rotation.x = tilt;
    this._rim(this.headGroup, R * Math.sin(theta), R * Math.cos(theta), tilt);
    if (style === 'bun') {
      const bun = this._mesh(new THREE.SphereGeometry(0.17, 20, 14), mat, this.headGroup, true);
      bun.position.set(0, 0.5, -0.2);
    } else if (style === 'long') {
      const back = this._mesh(new THREE.CapsuleGeometry(0.4, 0.5, 8, 24), mat, this.headGroup, true);
      back.position.set(0, -0.22, -0.2); back.scale.set(1.12, 1, 0.62);
    }
    this.hair = cap;
  }

  _buildHat(h) {
    const style = h.style ?? 'beanie';
    const mat = this._mat(h.color ?? '#d9a531');
    const band = this._mat(h.band ?? h.color ?? '#b98a22');
    const g = new THREE.Group(); this.headGroup.add(g); this.hat = g;
    const R = 0.535;
    const dome = (rimY, squashY = 1) => {
      // hemisphere whose rim sits at rimY above the head centre
      const theta = Math.acos(THREE.MathUtils.clamp(rimY / R, -1, 1));
      const m = this._mesh(new THREE.SphereGeometry(R, 40, 18, 0, Math.PI * 2, 0, theta), mat, g, true);
      m.scale.y = squashY;
      return { m, rimR: R * Math.sin(theta) };
    };
    if (style === 'beanie') {
      const { rimR } = dome(0.2, 1.06);
      const cuff = this._mesh(new THREE.CylinderGeometry(rimR + 0.035, rimR + 0.045, 0.13, 40), band, g, true);
      cuff.position.y = 0.2 + 0.03;
      this.faceDrop = 0.05;
    } else if (style === 'helmet') {
      dome(0.14, 1.0);
      const brim = this._mesh(new THREE.CylinderGeometry(0.66, 0.7, 0.05, 40), band, g, true);
      brim.position.y = 0.16;
      const spike = this._mesh(new THREE.ConeGeometry(0.06, 0.2, 12), band, g, true);
      spike.position.y = R + 0.08;
      this.faceDrop = 0.05;
    } else if (style === 'hardhat') {
      dome(0.2, 1.0);
      const brim = this._mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.045, 32), mat, g, true);
      brim.position.set(0, 0.2, 0.22); brim.scale.set(1.12, 1, 1);
      const ridge = this._mesh(new THREE.BoxGeometry(0.1, 0.06, 0.8), band, g, true);
      ridge.position.y = R - 0.02;
      this.faceDrop = 0.05;
    } else if (style === 'tophat') {
      const brim = this._mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 40), mat, g, true);
      brim.position.y = 0.36;
      const tube = this._mesh(new THREE.CylinderGeometry(0.36, 0.34, 0.56, 32), mat, g, true);
      tube.position.y = 0.36 + 0.28;
      const b = this._mesh(new THREE.CylinderGeometry(0.352, 0.352, 0.1, 32), band, g, false);
      b.position.y = 0.36 + 0.08;
      g.rotation.x = -0.08;
    } else if (style === 'cap') {
      const { rimR } = dome(0.2, 1.0);
      this._rim(g, rimR, 0.2);
      const visor = this._mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 28), band, g, true);
      visor.position.set(0, 0.2, 0.42); visor.scale.set(1.05, 1, 0.8);
      this.faceDrop = 0.05;
    } else if (style === 'crown') {
      const ring = this._mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.22, 10, 1, false), mat, g, true);
      ring.position.y = 0.52;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const p = this._mesh(new THREE.ConeGeometry(0.075, 0.16, 8), mat, g, true);
        p.position.set(Math.sin(a) * 0.36, 0.7, Math.cos(a) * 0.36);
      }
    } else if (style === 'cone') {
      const cone = this._mesh(new THREE.ConeGeometry(0.82, 0.42, 36), mat, g, true);
      cone.position.y = 0.48;
      this.faceDrop = 0.03;
    } else {
      throw new Error(`unknown hat style "${style}"`);
    }
  }

  /** Multiply every colour of the figure by a tint (scene light colour / story state). */
  setTint(color) {
    this._tint.set(color ?? '#ffffff');
    for (const [m, base] of this._mats) m.color.copy(base).multiply(this._tint);
    this.faceMat.color.copy(this._tint);
    this.outlineMat.uniforms.uColor.value.copy(this.ink).multiply(this._tint);
    return this;
  }

  /**
   * Put an object in a hand (or on the head). The object keeps its own
   * transform relative to the hand; hands do not rotate, so props stay upright.
   * @param {'L'|'R'|'head'} where
   */
  attach(where, object) {
    if (this._attached[where] === object) return;
    this.detach(where);
    if (!object) return;
    const parent = where === 'head' ? this.headGroup : this.hands[where];
    if (!parent) throw new Error(`attach: unknown slot "${where}"`);
    // props are authored in world units; undo the rig's head-unit scale
    const holder = new THREE.Group(); holder.scale.setScalar(1 / this.size); holder.add(object);
    parent.add(holder);
    this._attached[where] = object; this._attached[where + '_holder'] = holder;
  }

  detach(where) {
    const h = this._attached[where + '_holder'];
    if (h) { h.removeFromParent(); h.clear(); }
    delete this._attached[where]; delete this._attached[where + '_holder'];
  }

  /** Set the joint angles. Instant: stepping is done by the caller's track. */
  applyPose(ref) {
    const p = resolvePose(ref);
    this.pose = p;
    // upper body
    this.upper.rotation.set(p.lean * D2R, p.twist * D2R, p.tilt * D2R, 'YXZ');
    this.headGroup.rotation.set(p.headNod * D2R, p.headTurn * D2R, p.headTilt * D2R, 'YXZ');

    const place = (L, origin, angles, side, len) => {
      segDir(angles[0], angles[1], side, _a).multiplyScalar(len[0]).add(origin);   // elbow / knee
      segDir(angles[2], angles[3], side, _b).multiplyScalar(len[1]).add(_a);       // hand / foot
      this._seg(L.s1, origin, _a); this._seg(L.s2, _a, _b);
      L.j0.position.copy(origin); L.j1.position.copy(_a); L.j2.position.copy(_b);
      L.anchor.position.copy(_b);
      return _b.y;
    };
    const sh = this.shoulderY;
    place(this.limbs.armL, _c.set(this.shoulderHalf, sh, 0), p.armL, 1, ARM);
    place(this.limbs.armR, _c.set(-this.shoulderHalf, sh, 0), p.armR, -1, ARM);
    const fl = place(this.limbs.legL, _c.set(this.hipHalf, 0.03, 0), p.legL, 1, LEG);
    const fr = place(this.limbs.legR, _c.set(-this.hipHalf, 0.03, 0), p.legR, -1, LEG);
    // plant the lowest foot on the ground
    const stand = LEG[0] + LEG[1] + LIMB_R - 0.03;
    this.hipY = (p.ground === false ? stand : -Math.min(fl, fr) + LIMB_R) + p.dy;
    this._squash = [p.sx ?? 1, p.sy ?? 1];
    this._layout();
    return this;
  }

  _seg(mesh, a, b) {
    _d.subVectors(b, a); const len = Math.max(1e-4, _d.length());
    mesh.position.addVectors(a, b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, _d.divideScalar(len));
    mesh.scale.set(LIMB_R, len, LIMB_R);
  }

  _layout() {
    const s = this.size * (this.state?.scale ?? 1);
    const [sx, sy] = this._squash ?? [1, 1];
    this.root.scale.set(s * sx, s * sy, s * sx);
    this.upper.position.y = this.hipY;
    this.lower.position.y = this.hipY;
    this.outlineMat.uniforms.uThickness.value = this.outlineFrac * s;
  }

  /**
   * Apply a resolved actor state (all optional): { pose, expr, mouth, blink, at:[x,y,z], face: yawDeg, rot:[x,y,z]deg, scale, look:[x,y] }
   * `face` 0 = looking down +Z, 90 = looking down +X.
   */
  setState(st) {
    const prev = this.state;
    this.state = { ...prev, ...st };
    this.applyPose(this.state.pose ?? 'stand');
    if (st.at) this.root.position.set(st.at[0], st.at[1], st.at[2]);
    const r = this.state.rot ?? [0, 0, 0];
    this.root.rotation.set(r[0] * D2R, (this.state.face ?? 0) * D2R + r[1] * D2R, r[2] * D2R, 'YXZ');
    this._setFace(this.state);
    return this;
  }

  _setFace(st) {
    const s = { expr: st.expr ?? this.defaultExpr, mouth: st.mouth ?? null, blink: !!st.blink, lookX: st.look?.[0] ?? 0, lookY: st.look?.[1] ?? 0, ink: this.inkCss };
    if (!EXPRESSIONS[s.expr]) throw new Error(`unknown expression "${s.expr}". Known: ${Object.keys(EXPRESSIONS).join(', ')}`);
    const key = faceKey(s);
    let tex = this._faceCache.get(key);
    if (!tex) {
      const c = document.createElement('canvas'); c.width = c.height = 384;
      drawFace(c.getContext('2d'), 384, s);
      tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      this._faceCache.set(key, tex);
    }
    if (this.faceMat.map !== tex) { this.faceMat.map = tex; this.faceMat.needsUpdate = true; }
  }

  /** Mouth shape for frame `f` of a talk window that began at frame `f0` (swaps every 2-3 frames). */
  talkMouth(f, f0 = 0) {
    const n = Math.max(0, f - f0);
    // 2,3,2,3... frames per shape = 2 shapes per 5 frames
    const i = Math.floor(n / 5) * 2 + (n % 5 >= 2 ? 1 : 0);
    return TALK_CYCLE[(i + (this.seed % TALK_CYCLE.length)) % TALK_CYCLE.length];
  }

  /** Deterministic blink: 2 frames, roughly every 2-4 s, offset per character. */
  blinkAt(f) {
    const period = 84;
    const slot = Math.floor(f / period);
    const start = slot * period + Math.floor(hash(this.seed, slot) * (period - 12)) + 6;
    return f >= start && f < start + 2;
  }

  /** Orient the face decal toward the camera. Call after the camera and the state are set, every frame. */
  faceCamera(camera) {
    this.root.updateWorldMatrix(true, true);
    const hw = this.headGroup.getWorldPosition(_a);
    this.root.getWorldScale(_s);
    const r = 0.5 * _s.x;
    const toCam = _b.subVectors(camera.position, hw); const d = toCam.length(); toCam.divideScalar(d);
    const camQ = camera.getWorldQuaternion(_q);
    const camQi = _q2.copy(camQ).invert();
    const headQ = this.headGroup.getWorldQuaternion(new THREE.Quaternion());
    const fwd = _c.set(0, 0, 1).applyQuaternion(headQ).applyQuaternion(camQi);   // view space: z > 0 faces the camera
    const up = _d.set(0, 1, 0).applyQuaternion(headQ).applyQuaternion(camQi);
    const facing = THREE.MathUtils.smoothstep(fwd.z, -0.05, 0.75);
    this.face.visible = fwd.z > -0.12;
    const roll = Math.atan2(-up.x, up.y);
    const k = (d - r * 1.02) / d;
    // position in world: in front of the sphere, slid sideways by the head turn
    const ox = fwd.x * r * 0.6 - Math.sin(roll) * -this.faceDrop * 2 * r;
    const oy = fwd.y * r * 0.6 - Math.cos(roll) * this.faceDrop * 2 * r;
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camQ), cup = new THREE.Vector3(0, 1, 0).applyQuaternion(camQ);
    const wp = hw.clone().addScaledVector(toCam, r * 1.02).addScaledVector(right, ox * k).addScaledVector(cup, oy * k);
    const rootQi = this.root.getWorldQuaternion(new THREE.Quaternion()).invert();
    this.face.position.copy(this.root.worldToLocal(wp));
    this.face.quaternion.copy(rootQi).multiply(camQ).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll));
    const w = 2 * r * k;
    this.face.scale.set((w * (0.5 + 0.5 * facing)) / _s.x, w / _s.y, 1);
  }

  /** World position of the head centre (for camera targets, focus distance). */
  headWorld(out = new THREE.Vector3()) {
    this.root.updateWorldMatrix(true, true);
    return this.headGroup.getWorldPosition(out);
  }
}

export const createCharacter = (o) => new Character(o);
