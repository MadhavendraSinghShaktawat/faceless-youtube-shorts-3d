// Browser entry. Bundled by render.mjs together with the video's video.js
// (alias "acs-video") into <video>/.build/bundle.js and driven by HyperFrames:
// it gates start-up on window.__hf.buildReady and draws from `hf-seek`.
import video from 'acs-video';
import { createStage } from './stage.js';
import { captionAtFrame } from './captions.js';
import { frameOf } from './timeline.js';

const cfg = window.__ACS; // { duration, fps, width, height, cards } written into index.html by render.mjs
const dom = document.getElementById('caption');
let stage = null;
let last = '';

function renderAt(t) {
  if (!stage) return;
  stage.renderAt(t);
  const text = captionAtFrame(cfg.cards, frameOf(Math.max(0, t), cfg.fps));
  if (text !== last) { dom.textContent = text; last = text; }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady.acs = (async () => {
  try {
    if (document.fonts) { await Promise.all([document.fonts.load('800 64px "ACS Caption"'), document.fonts.load('900 64px "ACS Caption"')]); await document.fonts.ready; }
    stage = createStage({ canvas: document.getElementById('gl'), video, duration: cfg.duration, width: cfg.width, height: cfg.height, fps: cfg.fps });
    await stage.ready;
    window.__acs = { stage, renderAt };
    renderAt(0);
  } catch (err) {
    // Make the failure visible in every captured frame and in the console.
    console.error('[acs] build failed:', err);
    document.body.setAttribute('data-acs-error', String(err && err.stack ? err.stack : err));
    const pre = document.createElement('pre');
    pre.id = 'acs-error';
    pre.style.cssText = 'position:absolute;inset:0;z-index:99;margin:0;padding:40px;background:#300;color:#fff;font:28px/1.3 monospace;white-space:pre-wrap';
    pre.textContent = 'ACS BUILD FAILED\n\n' + (err && err.stack ? err.stack : err);
    document.getElementById('root').appendChild(pre);
    throw err;
  }
})();

window.addEventListener('hf-seek', (e) => renderAt(e.detail.time));
