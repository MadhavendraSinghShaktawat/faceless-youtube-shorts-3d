import puppeteer from '../../outline-shader/node_modules/puppeteer/lib/puppeteer/puppeteer.js';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.resolve(here, '../..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => { const f = path.join(root, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return res.writeHead(404).end(); res.writeHead(200, { 'content-type': mime[path.extname(f)] ?? 'application/octet-stream' }).end(fs.readFileSync(f)); });
await new Promise((r) => server.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${server.address().port}`;
fs.mkdirSync(path.join(here, 'out'), { recursive: true });
const browser = await puppeteer.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-webgpu'], defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 } });
const h = (x) => crypto.createHash('sha1').update(x).digest('hex').slice(0, 12);
for (const [name, q] of [['all', ''], ['nodof', '?dof=0'], ['motionblur', '?mb=1']]) {
  const page = await browser.newPage();
  page.on('console', (m) => { if (['error', 'warn'].includes(m.type()) && !m.text().includes('404')) console.log(`[${name}]`, m.type(), m.text().slice(0, 400)); });
  page.on('pageerror', (e) => console.log(`[${name}] pageerror`, e.message));
  await page.goto(`${base}/_bench/techniques/index.html${q}`);
  await page.waitForFunction('window.demoReady === true || window.demoError', { timeout: 60000 });
  const err = await page.evaluate(() => window.demoError); if (err) { console.log(`[${name}] ERROR`, err); continue; }
  const shot = async (t) => Buffer.from((await page.evaluate((tt) => { const t0 = performance.now(); window.demo.renderAt(tt); const gl = window.demo.renderer.getContext(); gl.finish(); window.__ms = performance.now() - t0; return document.getElementById('gl').toDataURL('image/png'); }, t)).split(',')[1], 'base64');
  const a = await shot(2.0), b = await shot(3.3), c = await shot(2.0);
  fs.writeFileSync(path.join(here, 'out', `${name}.png`), a);
  const ms = await page.evaluate(async () => { const gl = window.demo.renderer.getContext(); const t0 = performance.now(); for (let i = 0; i < 60; i++) window.demo.renderAt(i / 30); gl.finish(); const px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return (performance.now() - t0) / 60; });
  console.log(`${name}: t2=${h(a)} t3.3=${h(b)} t2again=${h(c)} deterministic=${h(a) === h(c) && h(a) !== h(b)} avgFrameMs=${ms.toFixed(1)}`);
  await page.close();
}
// WebGPU availability probe
const page = await browser.newPage(); await page.goto(`${base}/_bench/techniques/index.html`);
console.log('webgpu:', await page.evaluate(async () => { if (!navigator.gpu) return 'navigator.gpu missing'; const a = await navigator.gpu.requestAdapter(); if (!a) return 'no adapter'; const i = a.info ?? {}; return `adapter ok: ${i.vendor} ${i.architecture} ${i.description}`; }));
await browser.close(); server.close();
