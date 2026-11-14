// Baseline: plain three.js page driven by Puppeteer. Modes:
//   node render.mjs webcodecs   (in-page H.264 via WebCodecs + mediabunny mux)  <- fastest
//   node render.mjs raw         (RGBA frames -> local HTTP -> ffmpeg libx264)
//   node render.mjs shot        (page.screenshot per frame -> ffmpeg; captures DOM)
//   node render.mjs renderonly  (no capture; draw-cost ceiling)
// Flags: --shell (chrome-headless-shell), --swiftshader, --hw=prefer-hardware|prefer-software, --jpeg
import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mode = process.argv[2] ?? 'webcodecs';
const flags = new Set(process.argv.slice(3));
const flagVal = (k, d) => { const f = [...flags].find((x) => x.startsWith(`--${k}=`)); return f ? f.split('=')[1] : d; };
const outFile = path.join(here, 'out', `${mode}${flags.size ? '-' + [...flags].join('').replace(/[^a-z0-9]+/gi, '_') : ''}.mp4`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });

const W = 1080, H = 1920, FPS = 30;
const ffArgsOut = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outFile];
let ff = null;
const startFfmpeg = (inArgs) => {
  ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...inArgs, ...ffArgsOut], { stdio: ['pipe', 'inherit', 'inherit'] });
  return new Promise((res) => ff.on('close', res));
};
let ffDone = null;

const mime = { '.html': 'text/html', '.js': 'text/javascript' };
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    if (req.url === '/upload') fs.writeFileSync(outFile, body);
    else if (req.url === '/frame') { if (!ff.stdin.write(body)) await new Promise((r) => ff.stdin.once('drain', r)); }
    else if (req.url === '/frame-end') ff.stdin.end();
    res.writeHead(200).end('ok');
    return;
  }
  const f = path.join(here, 'public', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(f)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': mime[path.extname(f)] ?? 'application/octet-stream' }).end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/`;

const tStart = performance.now();
const gpuArgs = flags.has('--swiftshader')
  ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : ['--use-gl=angle', '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'];
const browser = await puppeteer.launch({
  headless: flags.has('--shell') ? 'shell' : true,
  args: [...gpuArgs, '--hide-scrollbars', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--force-device-scale-factor=1'],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
  protocolTimeout: 600_000,
});
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') console.log('[page]', m.type(), m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url);
await page.waitForFunction('window.benchReady === true');
const info = await page.evaluate(() => window.bench.info());
const tReady = performance.now();
let stats = {};
if (mode === 'webcodecs') {
  stats = await page.evaluate((hw) => window.bench.renderWebCodecs({ hardwareAcceleration: hw }), flagVal('hw', 'no-preference'));
} else if (mode === 'raw') {
  ffDone = startFfmpeg(['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0']);
  stats = await page.evaluate(() => window.bench.renderRaw());
  await ffDone;
} else if (mode === 'shot') {
  const jpeg = flags.has('--jpeg');
  ffDone = startFfmpeg(['-f', 'image2pipe', '-c:v', jpeg ? 'mjpeg' : 'png', '-r', String(FPS), '-i', 'pipe:0']);
  const total = await page.evaluate(() => window.bench.TOTAL);
  for (let i = 0; i < total; i++) {
    await page.evaluate((n) => window.bench.drawDom(n), i);
    const buf = await page.screenshot(jpeg ? { type: 'jpeg', quality: 92, optimizeForSpeed: true } : { type: 'png', optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await ffDone;
  stats = { frames: total };
} else if (mode === 'renderonly') {
  stats = await page.evaluate(() => window.bench.renderOnly());
}
const tEnd = performance.now();
await browser.close();
server.close();
const frames = stats.frames ?? 150;
console.log(JSON.stringify({
  mode, flags: [...flags], gl: info.renderer,
  wallSec: +((performance.now() - tStart) / 1000).toFixed(2),
  startupSec: +((tReady - tStart) / 1000).toFixed(2),
  renderSec: +((tEnd - tReady) / 1000).toFixed(2),
  fpsRenderPhase: +(frames / ((tEnd - tReady) / 1000)).toFixed(1),
  fpsWall: +(frames / ((performance.now() - tStart) / 1000)).toFixed(1),
  inPage: stats, out: mode === 'renderonly' ? null : outFile,
}));
