import { createBenchScene, captionAt } from '../../shared/scene.js';

const dom = document.getElementById('caption');
function caption(t) {
  const c = captionAt(t);
  dom.innerHTML = c.words
    .map((w, i) => `<span class="${i === c.active ? 'on' : ''}" style="${i === c.active ? `transform:scale(${1 + 0.25 * Math.max(0, 1 - c.pop * 4)})` : ''}">${w}</span>`)
    .join(' ');
}

let bench;
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady['bench'] = (async () => {
  bench = createBenchScene({ canvas: document.getElementById('gl'), preserveDrawingBuffer: true });
  await bench.renderer.compileAsync(bench.scene, bench.camera);
  bench.renderAt(0); // throwaway first frame + readback so the GPU really finishes setup
  const gl = bench.renderer.getContext();
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
})();

function renderAt(t) {
  if (!bench) return;
  bench.renderAt(t);
  caption(t);
}
window.addEventListener('hf-seek', (e) => renderAt(e.detail.time));
window.__hf.buildReady['bench'].then(() => renderAt(0));
