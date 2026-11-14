// Headless proof: renders each demo variant to out/<variant>.png and checks
// that seeking is deterministic (t=1 -> t=3 -> t=1 gives identical pixels).
// Run: npm i && npm test
import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': mime[path.extname(f)] ?? 'application/octet-stream' }).end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
fs.mkdirSync(path.join(root, 'out'), { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'],
  defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 },
});
let failed = false;
for (const variant of ['video', 'hull', 'edges', 'wobble']) {
  const page = await browser.newPage();
  page.on('console', (m) => { if (['error', 'warn'].includes(m.type()) && !m.text().includes('favicon')) console.log(`[${variant}]`, m.type(), m.text()); });
  page.on('pageerror', (e) => { failed = true; console.log(`[${variant}] pageerror`, e.message); });
  await page.goto(`${base}/demo/index.html?variant=${variant}`);
  await page.waitForFunction('window.demoReady === true || window.demoError', { timeout: 60000 });
  const err = await page.evaluate(() => window.demoError);
  if (err) { failed = true; console.log(`[${variant}] ERROR`, err); continue; }
  const shot = async (t) => {
    const dataUrl = await page.evaluate((tt) => { window.demo.renderAt(tt); return document.getElementById('gl').toDataURL('image/png'); }, t);
    return Buffer.from(dataUrl.split(',')[1], 'base64');
  };
  const a = await shot(1);
  const b = await shot(3);
  const c = await shot(1);
  const h = (x) => crypto.createHash('sha1').update(x).digest('hex').slice(0, 12);
  fs.writeFileSync(path.join(root, 'out', `${variant}.png`), a);
  if (variant === 'hull') fs.writeFileSync(path.join(root, 'out', `${variant}-t3.png`), b);
  const deterministic = h(a) === h(c) && h(a) !== h(b);
  if (!deterministic) failed = true;
  console.log(`${variant}: out/${variant}.png  t1=${h(a)} t3=${h(b)} t1again=${h(c)}  deterministic=${deterministic}`);
  await page.close();
}
await browser.close();
server.close();
process.exit(failed ? 1 : 0);
