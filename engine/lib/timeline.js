// Shots and joins. Pure data: no three.js, usable in Node (lint) and in the page.
//
// A shot starts at `start` (video seconds) and runs until the next shot starts.
// The join INTO a shot is a cross-dissolve of `transition.frames` frames
// (default 6, allowed 4-12) centred on `start`, during which BOTH shots render
// and BOTH cameras keep moving. `transition: 'cut'` gives a hard cut.

export const frameOf = (t, fps) => Math.floor(t * fps + 1e-4);

/**
 * @param {object[]} shots   [{ id, set, start, transition?, ... }]
 * @param {number} duration  video length in seconds
 * @param {number} fps
 */
export function buildTimeline(shots, duration, fps = 30) {
  if (!shots?.length) throw new Error('timeline: no shots');
  const list = shots.map((s, i) => {
    const tr = s.transition === 'cut' ? { type: 'cut', frames: 0 }
      : { type: 'dissolve', frames: 6, ...(typeof s.transition === 'object' ? s.transition : {}) };
    if (i === 0) { tr.type = 'cut'; tr.frames = 0; }
    if (tr.type === 'cut') tr.frames = 0;
    return { ...s, index: i, startFrame: Math.round((s.start ?? 0) * fps), transition: tr };
  });
  list.sort((a, b) => a.startFrame - b.startFrame);
  list.forEach((s, i) => { s.index = i; s.endFrame = i + 1 < list.length ? list[i + 1].startFrame : Math.round(duration * fps); s.end = s.endFrame / fps; s.start = s.startFrame / fps; });
  if (list[0].startFrame !== 0) throw new Error(`timeline: the first shot must start at 0 (got ${list[0].start})`);

  /**
   * Shots visible on the frame containing t, with blend weights that sum to 1.
   * A dissolve of N frames gives N mixed frames with weights k/(N+1), k = 1..N,
   * so neither shot is ever at 0 or 1 inside the join.
   */
  function active(t) {
    const f = frameOf(t, fps);
    let i = 0;
    for (let k = 0; k < list.length; k++) if (list[k].startFrame <= f) i = k;
    const cur = list[i], next = list[i + 1];
    // inside the tail half of the dissolve into `cur`
    if (cur.transition.frames > 0 && i > 0) {
      const n = cur.transition.frames, f0 = cur.startFrame - Math.floor(n / 2);
      if (f < f0 + n) { const w = (f - f0 + 1) / (n + 1); return [{ shot: list[i - 1], w: 1 - w }, { shot: cur, w }]; }
    }
    // inside the head half of the dissolve into `next`
    if (next && next.transition.frames > 0) {
      const n = next.transition.frames, f0 = next.startFrame - Math.floor(n / 2);
      if (f >= f0) { const w = (f - f0 + 1) / (n + 1); return [{ shot: cur, w: 1 - w }, { shot: next, w }]; }
    }
    return [{ shot: cur, w: 1 }];
  }

  return { shots: list, active, fps, duration };
}

/**
 * Resolve a stepped track at frame f: every key whose frame <= f is merged in
 * order, so a key only needs the fields that change.
 *   track: [{ t, pose?, expr?, mouth?, at?, face?, rot?, scale?, look?, hold?, tint?, visible? }]
 */
export function trackAt(track, f, fps, base = {}) {
  const out = { ...base };
  if (!track) return out;
  for (const k of track) {
    if (Math.round((k.t ?? 0) * fps) > f) break;
    Object.assign(out, k);
  }
  delete out.t;
  return out;
}

/** Is frame f inside one of the [t0, t1] windows? Returns the window's first frame, or -1. */
export function windowAt(windows, f, fps) {
  if (!windows) return -1;
  for (const w of windows) {
    const f0 = Math.round(w[0] * fps), f1 = Math.round(w[1] * fps);
    if (f >= f0 && f < f1) return f0;
  }
  return -1;
}

/**
 * Talk windows from a word-timed transcript: merges words closer than `gap`
 * seconds into one window. talkWindows(words, 2.0, 6.5) -> [[2.04, 3.1], [3.4, 6.4]]
 */
export function talkWindows(words, from = 0, to = Infinity, gap = 0.22) {
  const out = [];
  for (const w of words) {
    if (w.end <= from || w.start >= to) continue;
    const last = out[out.length - 1];
    if (last && w.start - last[1] <= gap) last[1] = w.end; else out.push([w.start, w.end]);
  }
  return out;
}
