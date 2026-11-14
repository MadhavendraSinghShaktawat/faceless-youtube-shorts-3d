// The outline-shader demo (skinned glTF + toon + hull outline) as a HyperFrames composition.
import { createDemo } from '../../../outline-shader/demo/demo.js';

let demo;
window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady['outline'] = (async () => {
  demo = createDemo({ canvas: document.getElementById('gl'), variant: 'hull', modelUrl: new URL('../assets/RobotExpressive.glb', document.baseURI).href });
  await demo.ready;               // glTF loaded, shaders compiled
  demo.renderAt(0);
  const gl = demo.renderer.getContext();
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
})();
window.addEventListener('hf-seek', (e) => { if (demo) demo.renderAt(e.detail.time); });
