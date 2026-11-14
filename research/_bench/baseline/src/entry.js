import { createBenchScene, captionAt, WIDTH, HEIGHT, FPS, DURATION } from '../../shared/scene.js';
import { Output, Mp4OutputFormat, BufferTarget, CanvasSource } from 'mediabunny';

const TOTAL = FPS * DURATION;
const glCanvas = document.getElementById('gl');
const bench = createBenchScene({ canvas: glCanvas });
const dom = document.getElementById('caption');

// DOM caption (only visible to page.screenshot capture)
function domCaption(t) {
  const c = captionAt(t);
  dom.innerHTML = c.words
    .map((w, i) => `<span class="${i === c.active ? 'on' : ''}" style="${i === c.active ? `transform:scale(${1 + 0.25 * Math.max(0, 1 - c.pop * 4)})` : ''}">${w}</span>`)
    .join(' ');
}

// Canvas caption (for canvas-only capture: WebCodecs / raw pixels)
const comp = new OffscreenCanvas(WIDTH, HEIGHT);
const ctx = comp.getContext('2d', { alpha: false });
function compose(t) {
  ctx.drawImage(glCanvas, 0, 0);
  const c = captionAt(t);
  ctx.font = '900 68px "Arial Black", "Helvetica Neue", Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const gap = 22;
  const widths = c.words.map((w) => ctx.measureText(w).width);
  let x = (WIDTH - widths.reduce((a, b) => a + b, 0) - gap * (c.words.length - 1)) / 2;
  const y = HEIGHT * 0.74;
  c.words.forEach((w, i) => {
    const s = i === c.active ? 1 + 0.25 * Math.max(0, 1 - c.pop * 4) : 1;
    ctx.save();
    ctx.translate(x + widths[i] / 2, y);
    ctx.scale(s, s);
    ctx.textAlign = 'center';
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#15101c';
    ctx.strokeText(w, 0, 0);
    ctx.fillStyle = i === c.active ? '#ffd23f' : '#ffffff';
    ctx.fillText(w, 0, 0);
    ctx.restore();
    x += widths[i] + gap;
  });
}

const gl = bench.renderer.getContext();
window.bench = {
  TOTAL, WIDTH, HEIGHT, FPS,
  info() {
    const e = gl.getExtension('WEBGL_debug_renderer_info');
    return { renderer: e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'n/a', ua: navigator.userAgent, three: bench.renderer.info.render };
  },
  // 1) screenshot capture: draw + DOM caption, node side screenshots the page
  async drawDom(i) {
    const t = i / FPS;
    bench.renderAt(t);
    domCaption(t);
    gl.finish();
  },
  // 2) WebCodecs: encode H.264 in-page, mux MP4 with mediabunny, upload once
  async renderWebCodecs({ bitrate = 12_000_000, hardwareAcceleration = 'no-preference' } = {}) {
    dom.style.display = 'none';
    const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
    const source = new CanvasSource(comp, { codec: 'avc', bitrate, keyFrameInterval: 2, hardwareAcceleration, latencyMode: 'quality' });
    output.addVideoTrack(source, { frameRate: FPS });
    await output.start();
    const t0 = performance.now();
    for (let i = 0; i < TOTAL; i++) {
      const t = i / FPS;
      bench.renderAt(t);
      compose(t);
      await source.add(t, 1 / FPS);
    }
    const tLoop = performance.now() - t0;
    await output.finalize();
    const tAll = performance.now() - t0;
    const buf = output.target.buffer;
    await fetch('/upload', { method: 'POST', body: buf });
    return { frames: TOTAL, loopMs: tLoop, totalMs: tAll, bytes: buf.byteLength };
  },
  // 3) raw RGBA frames streamed to ffmpeg through the local server
  async renderRaw() {
    dom.style.display = 'none';
    const t0 = performance.now();
    for (let i = 0; i < TOTAL; i++) {
      const t = i / FPS;
      bench.renderAt(t);
      compose(t);
      const img = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      await fetch('/frame', { method: 'POST', body: img.data });
    }
    await fetch('/frame-end', { method: 'POST' });
    return { frames: TOTAL, totalMs: performance.now() - t0 };
  },
  // pure draw cost with no capture at all (upper bound on fps)
  async renderOnly() {
    const t0 = performance.now();
    for (let i = 0; i < TOTAL; i++) { bench.renderAt(i / FPS); }
    gl.finish();
    return { frames: TOTAL, totalMs: performance.now() - t0 };
  },
};
window.benchReady = true;
