// Faces are 2D ink drawings on a canvas, shown on a camera-facing decal on the
// head sphere. Expressions and mouth shapes swap in one frame; nothing tweens.
//
// Units inside this file: head diameters, origin at the head centre, +y up.

/** Mouth shapes measured in the references (7) plus two extras. */
export const MOUTHS = ['flat', 'smile', 'frown', 'o', 'open', 'grin', 'teeth', 'smirk', 'none'];

/** The order the mouth cycles through while a character talks (neighbours always differ). */
export const TALK_CYCLE = ['open', 'flat', 'o', 'grin', 'smile', 'open', 'o', 'teeth', 'flat', 'open', 'smile', 'o'];

// eye: dot | half | wide | closed | happy | squint | x
// brow: [angleL, angleR, lift]  (angle + = inner end down = angry; lift in head units) or null
export const EXPRESSIONS = {
  neutral: { eye: 'dot', brow: null, mouth: 'flat' },
  bored: { eye: 'half', brow: [0, 0, 0], mouth: 'flat' },
  angry: { eye: 'half', brow: [20, 20, -0.012], mouth: 'frown' },
  furious: { eye: 'dot', brow: [30, 30, -0.03], mouth: 'teeth' },
  sad: { eye: 'dot', brow: [-20, -20, 0.02], mouth: 'frown' },
  worried: { eye: 'wide', brow: [-18, -18, 0.035], mouth: 'o' },
  surprised: { eye: 'wide', brow: [-4, -4, 0.06], mouth: 'o' },
  happy: { eye: 'happy', brow: null, mouth: 'smile' },
  excited: { eye: 'wide', brow: [-6, -6, 0.05], mouth: 'grin' },
  smug: { eye: 'half', brow: [14, -10, 0.01], mouth: 'smirk' },
  suspicious: { eye: 'squint', brow: [16, 4, -0.01], mouth: 'flat' },
  skeptical: { eye: 'half', brow: [-12, 16, 0.015], mouth: 'flat' },
  closed: { eye: 'closed', brow: null, mouth: 'flat' },
  dead: { eye: 'x', brow: null, mouth: 'open' },
};

export const expressionNames = () => Object.keys(EXPRESSIONS);

/** Register (or replace) an expression. */
export function defineExpression(name, def) {
  EXPRESSIONS[name] = def;
  return def;
}

const EYE_X = 0.135, EYE_Y = 0.085, MOUTH_Y = -0.115;

/**
 * Draw one face state onto a 2D context.
 * @param {CanvasRenderingContext2D} g
 * @param {number} size   canvas size in px (square); the canvas spans exactly one head diameter
 * @param {object} s      { expr, mouth, blink, ink, lineWidth, lookX, lookY }
 */
export function drawFace(g, size, s) {
  const ex = EXPRESSIONS[s.expr] ?? EXPRESSIONS.neutral;
  const mouth = s.mouth ?? ex.mouth;
  const ink = s.ink ?? '#2c1821';
  const lw = (s.lineWidth ?? 0.024) * size;
  const X = (x) => size / 2 + x * size, Y = (y) => size / 2 - y * size, S = (v) => v * size;
  g.clearRect(0, 0, size, size);
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = lw;
  const lx = (s.lookX ?? 0) * 0.03, ly = (s.lookY ?? 0) * 0.025;

  const eyeKind = s.blink ? 'closed' : ex.eye;
  for (const side of [-1, 1]) {
    const cx = side * EYE_X + lx, cy = EYE_Y + ly;
    g.beginPath();
    if (eyeKind === 'dot') {
      g.ellipse(X(cx), Y(cy), S(0.04), S(0.054), 0, 0, Math.PI * 2); g.fill();
    } else if (eyeKind === 'wide') {
      g.ellipse(X(cx), Y(cy), S(0.05), S(0.066), 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(X(cx + 0.016), Y(cy + 0.024), S(0.013), 0, Math.PI * 2); g.fill(); g.fillStyle = ink;
    } else if (eyeKind === 'half' || eyeKind === 'squint') {
      const h = eyeKind === 'half' ? 0.062 : 0.034;
      // half oval hanging under a heavy lid line
      g.ellipse(X(cx), Y(cy + 0.022), S(0.046), S(h), 0, 0, Math.PI); g.fill();
      g.beginPath(); g.moveTo(X(cx - 0.078), Y(cy + 0.022)); g.lineTo(X(cx + 0.078), Y(cy + 0.022)); g.stroke();
    } else if (eyeKind === 'closed') {
      g.moveTo(X(cx - 0.055), Y(cy)); g.lineTo(X(cx + 0.055), Y(cy)); g.stroke();
    } else if (eyeKind === 'happy') {
      g.arc(X(cx), Y(cy - 0.03), S(0.052), Math.PI * 1.12, Math.PI * 1.88); g.stroke();
    } else if (eyeKind === 'x') {
      g.moveTo(X(cx - 0.04), Y(cy + 0.04)); g.lineTo(X(cx + 0.04), Y(cy - 0.04));
      g.moveTo(X(cx + 0.04), Y(cy + 0.04)); g.lineTo(X(cx - 0.04), Y(cy - 0.04)); g.stroke();
    }
    if (ex.brow && !(s.blink && ex.eye === 'happy')) {
      const ang = ((side < 0 ? ex.brow[0] : ex.brow[1]) * Math.PI) / 180;
      const by = EYE_Y + 0.118 + ex.brow[2];
      const half = 0.066;
      // inner end is toward the nose (x -> 0); positive angle drops the inner end
      const ix = cx - side * half, ox = cx + side * half;
      const dyv = Math.tan(ang) * half;
      g.lineWidth = lw * 1.15;
      g.beginPath(); g.moveTo(X(ix), Y(by - dyv)); g.lineTo(X(ox), Y(by + dyv)); g.stroke();
      g.lineWidth = lw;
    }
  }

  const mx = lx * 0.6, my = MOUTH_Y + ly * 0.5;
  g.beginPath();
  switch (mouth) {
    case 'flat':
      g.moveTo(X(mx - 0.05), Y(my)); g.lineTo(X(mx + 0.05), Y(my)); g.stroke(); break;
    case 'smile':
      g.arc(X(mx), Y(my + 0.07), S(0.1), Math.PI * 0.22, Math.PI * 0.78); g.stroke(); break;
    case 'frown':
      g.arc(X(mx), Y(my - 0.105), S(0.1), Math.PI * 1.25, Math.PI * 1.75); g.stroke(); break;
    case 'smirk':
      g.moveTo(X(mx - 0.05), Y(my - 0.008)); g.quadraticCurveTo(X(mx + 0.02), Y(my - 0.03), X(mx + 0.075), Y(my + 0.03)); g.stroke(); break;
    case 'o':
      g.ellipse(X(mx), Y(my), S(0.026), S(0.032), 0, 0, Math.PI * 2); g.fillStyle = '#5a1420'; g.fill(); g.stroke(); g.fillStyle = ink; break;
    case 'open': {
      g.ellipse(X(mx), Y(my - 0.012), S(0.062), S(0.058), 0, 0, Math.PI * 2);
      g.fillStyle = '#6b1422'; g.fill();
      g.save(); g.clip();
      g.fillStyle = '#f08a9a'; g.beginPath(); g.ellipse(X(mx), Y(my - 0.07), S(0.05), S(0.036), 0, 0, Math.PI * 2); g.fill();
      g.restore();
      g.beginPath(); g.ellipse(X(mx), Y(my - 0.012), S(0.062), S(0.058), 0, 0, Math.PI * 2); g.stroke(); g.fillStyle = ink; break;
    }
    case 'grin':
    case 'teeth': {
      const w = mouth === 'grin' ? 0.092 : 0.078, h = mouth === 'grin' ? 0.03 : 0.036;
      const r = mouth === 'grin' ? h : h * 0.45;
      const x0 = X(mx - w), y0 = Y(my + h), ww = S(w * 2), hh = S(h * 2), rr = S(r);
      g.beginPath();
      if (mouth === 'grin') {
        // D-shape: flat top, round bottom
        g.moveTo(x0, y0); g.lineTo(x0 + ww, y0); g.quadraticCurveTo(x0 + ww, y0 + hh * 1.5, x0 + ww / 2, y0 + hh * 1.5); g.quadraticCurveTo(x0, y0 + hh * 1.5, x0, y0); g.closePath();
      } else {
        g.roundRect(x0, y0, ww, hh, rr);
      }
      g.fillStyle = '#ffffff'; g.fill();
      g.save(); g.clip(); g.lineWidth = lw * 0.55;
      for (let i = 1; i < 5; i++) { const x = x0 + (ww * i) / 5; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + hh * 1.6); g.stroke(); }
      if (mouth === 'teeth') { g.beginPath(); g.moveTo(x0, y0 + hh / 2); g.lineTo(x0 + ww, y0 + hh / 2); g.stroke(); }
      g.restore(); g.lineWidth = lw;
      g.beginPath();
      if (mouth === 'grin') {
        g.moveTo(x0, y0); g.lineTo(x0 + ww, y0); g.quadraticCurveTo(x0 + ww, y0 + hh * 1.5, x0 + ww / 2, y0 + hh * 1.5); g.quadraticCurveTo(x0, y0 + hh * 1.5, x0, y0); g.closePath();
      } else g.roundRect(x0, y0, ww, hh, rr);
      g.stroke(); g.fillStyle = ink; break;
    }
    default: break; // 'none'
  }
}

/** Key that identifies a drawn face state (for texture caching). */
export const faceKey = (s) => `${s.expr}|${s.mouth ?? ''}|${s.blink ? 1 : 0}|${s.lookX ?? 0}|${s.lookY ?? 0}`;
