// Captions: 1-3 words per card (mostly 1), hard swap on a single frame, no
// animation, no colour emphasis. Pure data + a CSS string; usable in Node and
// in the page.
//
// Measured style (see reference/analysis/*.md section 11):
//   Poppins ExtraBold, white, black stroke ~0.75 % of frame width, soft shadow,
//   single centred line at 70 % of frame height, font-size ~6.2 % of frame width.

const JOINERS = new Set(['a', 'an', 'the', 'of', 'to', 'in', 'at', 'on', 'is', 'it', 'as', 'by', 'or', 'so', 'he', 'we', 'i', 'no', 'if', 'my', 'be', 'do', 'up', 'his', 'her', 'for', 'and', 'but', 'was', 'had', 'not', 'its', 'are']);
const endsSentence = (s) => /[.!?…:;]["')\]]?$/.test(s);
const bare = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, '');

/**
 * Group word timings into caption cards.
 * @param {{text:string,start:number,end:number}[]} words
 * @param {object} [o]
 * @param {number} [o.fps=30]
 * @param {number} [o.maxWords=3]      hard cap
 * @param {number} [o.maxChars=13]     a merged card may not be longer than this
 * @param {number} [o.joinGap=0.12]    only merge words closer than this (s)
 * @param {number} [o.holdGap=0.45]    a silence longer than this clears the caption...
 * @param {number} [o.holdTail=0.18]   ...this long after the word ended
 * @param {number} [o.minFrames=2]
 * @returns {{text:string,start:number,end:number,f0:number,f1:number,words:number}[]}
 */
export function buildCards(words, o = {}) {
  const { fps = 30, maxWords = 3, maxChars = 13, joinGap = 0.12, holdGap = 0.45, holdTail = 0.18, minFrames = 2 } = o;
  const ws = (words ?? []).filter((w) => w && String(w.text ?? '').trim()).map((w) => ({ text: String(w.text).trim(), start: +w.start, end: +w.end }));
  ws.sort((a, b) => a.start - b.start);
  const groups = [];
  for (let i = 0; i < ws.length; i++) {
    const g = [ws[i]];
    // a short function word pulls the next word onto its card ("at the door")
    while (g.length < maxWords && i + 1 < ws.length) {
      const cur = g[g.length - 1], nxt = ws[i + 1];
      const text = [...g, nxt].map((w) => w.text).join(' ');
      if (!JOINERS.has(bare(cur.text)) || endsSentence(cur.text) || nxt.start - cur.end > joinGap || text.length > maxChars) break;
      g.push(nxt); i++;
    }
    groups.push(g);
  }
  const cards = groups.map((g) => ({ text: g.map((w) => w.text).join(' '), start: g[0].start, end: g[g.length - 1].end, words: g.length }));
  // frame-quantise; each card holds until the next one starts (no gaps while speaking)
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i], n = cards[i + 1];
    c.f0 = Math.round(c.start * fps);
    if (i === 0 && c.f0 <= Math.round(0.3 * fps)) c.f0 = 0;          // first caption is up on frame 0
    if (i > 0 && c.f0 < cards[i - 1].f0 + minFrames) c.f0 = cards[i - 1].f0 + minFrames;
    const nextF = n ? Math.max(Math.round(n.start * fps), c.f0 + minFrames) : Infinity;
    const tail = Math.round((c.end + holdTail) * fps);
    c.f1 = n && n.start - c.end <= holdGap ? nextF : Math.min(nextF, Math.max(tail, c.f0 + minFrames));
  }
  for (let i = 0; i + 1 < cards.length; i++) if (cards[i].f1 > cards[i + 1].f0) cards[i].f1 = cards[i + 1].f0;
  if (cards.length) cards[cards.length - 1].f1 = 1e9;              // the last word stays up until the hard end
  return cards;
}

/** Text on screen at frame f ('' = nothing). Binary search; cards must be in order. */
export function captionAtFrame(cards, f) {
  let lo = 0, hi = cards.length - 1, hit = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (cards[m].f0 <= f) { hit = m; lo = m + 1; } else hi = m - 1; }
  return hit >= 0 && f < cards[hit].f1 ? cards[hit].text : '';
}

/** Share of cards with 1 / 2 / 3 words, mean card length in seconds. */
export function cardStats(cards, fps = 30) {
  const n = cards.length || 1;
  const by = [1, 2, 3].map((k) => cards.filter((c) => c.words === k).length / n);
  const finite = cards.filter((c) => c.f1 < 1e8);   // the last card holds to the end; leave it out of the mean
  const mean = finite.reduce((s, c) => s + (c.f1 - c.f0), 0) / (finite.length || 1) / fps;
  return { cards: cards.length, one: by[0], two: by[1], three: by[2], meanSeconds: mean };
}

/**
 * CSS for the caption overlay. Sizes scale with the frame width.
 * @param {object} [o]  { width=1080, height=1920, weight=800, sizePct=6.2, strokePct=0.75, yPct=70, fontUrl }
 */
export function captionCss(o = {}) {
  const { width = 1080, height = 1920, weight = 800, sizePct = 6.2, strokePct = 0.75, yPct = 70, family = 'ACS Caption' } = o;
  const size = Math.round((width * sizePct) / 100);
  const r = (width * strokePct) / 100;                 // visible stroke width outside the glyph
  // A ring of hard shadows = a round-cornered stroke (CSS text-stroke has mitred, spiky joins).
  const ring = [];
  for (const [rad, n] of [[r, 28], [r * 0.66, 16], [r * 0.33, 8]]) for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; ring.push(`${(Math.cos(a) * rad).toFixed(2)}px ${(Math.sin(a) * rad).toFixed(2)}px 0 #000`); }
  const sh = width * 0.0055;
  ring.push(`${(sh * 0.4).toFixed(1)}px ${(sh + r).toFixed(1)}px ${(sh * 1.6).toFixed(1)}px rgba(0,0,0,0.6)`);
  return `
#captions { position: absolute; left: 0; top: 0; width: ${width}px; height: ${height}px; pointer-events: none; z-index: 5; }
#caption { position: absolute; left: 0; width: ${width}px; top: ${Math.round((height * yPct) / 100)}px; transform: translateY(-50%);
  text-align: center; white-space: nowrap;
  font-family: "${family}", sans-serif; font-weight: ${weight}; font-size: ${size}px; line-height: 1.2; letter-spacing: 0;
  color: #fff; text-shadow: ${ring.join(', ')}; }`;
}

