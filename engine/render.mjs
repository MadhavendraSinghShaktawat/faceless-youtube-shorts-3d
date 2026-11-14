#!/usr/bin/env node
// node engine/render.mjs videos/<slug> [--draft] [--snap 1.0,3.5] [--workers N]
//
// (a) transcribe audio/vo.* -> words.json (only if a VO exists and words.json does not)
// (b) build caption cards        (c) bundle video.js      (d) lint
// (e) render with HyperFrames    (f) mix + master audio   (g) validate -> out/final.mp4 + out/report.json
// --snap writes stills to out/snaps/ and stops (no video, no audio).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import { buildCards, cardStats, captionCss } from './lib/captions.js';
import { buildTimeline } from './lib/timeline.js';
import { cameraPath } from './lib/camera.js';
import { resolvePose } from './lib/poses.js';
import { EXPRESSIONS } from './lib/faces.js';
import { mixAudio, measure, TARGETS } from './lib/audio.mjs';

const ENGINE = path.dirname(fileURLToPath(import.meta.url));
const HF = path.join(ENGINE, 'node_modules', '.bin', 'hyperframes');
const ENV = { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1', DO_NOT_TRACK: '1' };
const W = 1080, H = 1920;

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
const flags = { draft: false, snap: null, workers: null };
let videoArg = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--draft') flags.draft = true;
  else if (a === '--snap') flags.snap = (argv[++i] ?? '').split(',').map(Number).filter((n) => Number.isFinite(n));
  else if (a.startsWith('--snap=')) flags.snap = a.slice(7).split(',').map(Number).filter((n) => Number.isFinite(n));
  else if (a === '--workers') flags.workers = argv[++i];
  else if (a === '-h' || a === '--help') { usage(0); }
  else if (!a.startsWith('-') && !videoArg) videoArg = a;
  else { console.error(`unknown argument: ${a}`); usage(1); }
}
function usage(code) {
  console.log('usage: node engine/render.mjs videos/<slug> [--draft] [--snap 1.0,3.5] [--workers N]');
  process.exit(code);
}
if (!videoArg) usage(1);
if (flags.snap && !flags.snap.length) { console.error('--snap needs a comma-separated list of seconds, e.g. --snap 1.0,3.5'); process.exit(1); }

const VIDEO = path.resolve(videoArg);
const SRC = path.join(VIDEO, 'video.js');
const BUILD = path.join(VIDEO, '.build');
const OUT = path.join(VIDEO, 'out');
if (!fs.existsSync(SRC)) { console.error(`no video.js in ${VIDEO}`); process.exit(1); }
if (!fs.existsSync(HF)) { console.error(`engine dependencies missing. Run: (cd ${ENGINE} && npm ci)`); process.exit(1); }
fs.mkdirSync(BUILD, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const t00 = Date.now();
const times = {};
const step = async (name, fn) => { const t0 = Date.now(); const r = await fn(); times[name] = +((Date.now() - t0) / 1000).toFixed(2); return r; };
const log = (...a) => console.log(...a);
const die = (msg) => { console.error(`\nFAILED: ${msg}`); process.exit(1); };
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', env: ENV, maxBuffer: 1 << 28, ...opts });
const rel = (p) => path.relative(process.cwd(), p) || '.';

const aliasPlugin = (videoEntry) => ({
  name: 'acs-alias',
  setup(b) {
    b.onResolve({ filter: /^acs$/ }, () => ({ path: path.join(ENGINE, 'lib', 'index.js') }));
    b.onResolve({ filter: /^acs-video$/ }, () => ({ path: videoEntry }));
  },
});
const esCommon = { bundle: true, logLevel: 'warning', nodePaths: [path.join(ENGINE, 'node_modules')], plugins: [aliasPlugin(SRC)] };

// ---------------------------------------------------------------- manifest (video.js evaluated in Node)
const video = await step('manifest', async () => {
  const outfile = path.join(BUILD, 'video.node.mjs');
  await esbuild.build({ ...esCommon, entryPoints: [SRC], outfile, format: 'esm', platform: 'node' });
  let mod;
  try { mod = await import(`${pathToFileURL(outfile).href}?v=${Date.now()}`); }
  catch (e) { die(`video.js could not be evaluated in Node (${e.message}).\nKeep DOM / canvas / texture work inside set, prop and cast builders, not at module top level.`); }
  const v = mod.default;
  if (!v || !v.shots || !v.sets) die('video.js must `export default defineVideo({ sets, shots, ... })`');
  return v;
});
const fps = video.fps ?? 30;
if (fps !== 30) log(`note: fps ${fps} (the references are 30)`);
const A = video.audio ?? {};
const resolveIn = (p) => (p ? path.resolve(VIDEO, p) : null);

// ---------------------------------------------------------------- (a) transcript
const voFile = (() => {
  if (A.vo === false) return null;
  if (A.vo) { const p = resolveIn(A.vo); if (!fs.existsSync(p)) die(`audio.vo not found: ${p}`); return p; }
  const dir = path.join(VIDEO, 'audio');
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).find((n) => /^vo\.(wav|mp3|m4a|aac|flac|ogg|aiff?)$/i.test(n));
  return f ? path.join(dir, f) : null;
})();
const WORDS = path.join(VIDEO, 'words.json');
let transcribed = false;
await step('transcribe', async () => {
  if (fs.existsSync(WORDS) || !voFile) return;
  const dir = path.join(BUILD, 'transcribe');
  fs.mkdirSync(dir, { recursive: true });
  log(`transcribing ${rel(voFile)} (whisper ${A.whisperModel ?? 'small.en'}) ...`);
  const r = run(HF, ['transcribe', voFile, '--dir', dir, '--model', A.whisperModel ?? 'small.en']);
  const tj = path.join(dir, 'transcript.json');
  if (r.status !== 0 || !fs.existsSync(tj)) die(`transcription failed:\n${(r.stdout + r.stderr).split('\n').slice(-12).join('\n')}`);
  const words = JSON.parse(fs.readFileSync(tj, 'utf8')).map((w) => ({ text: w.text, start: w.start, end: w.end }));
  fs.writeFileSync(WORDS, JSON.stringify(words, null, 1));
  transcribed = true;
});
const voOffset = A.voOffset ?? 0;
const rawWords = fs.existsSync(WORDS) ? JSON.parse(fs.readFileSync(WORDS, 'utf8')) : [];
const words = rawWords.map((w) => ({ text: w.text ?? w.word, start: w.start + (voFile ? voOffset : 0), end: w.end + (voFile ? voOffset : 0) }));

// ---------------------------------------------------------------- duration
const lastWord = words.length ? Math.max(...words.map((w) => w.end)) : null;
let duration = video.duration ?? (voFile && lastWord != null ? lastWord + (A.tail ?? 0.3) : null);
if (duration == null) die('no duration: set `duration` in video.js (required when there is no voiceover)');
duration = Math.round(duration * fps) / fps;
const frames = Math.round(duration * fps);

// ---------------------------------------------------------------- (b) caption cards
const cards = buildCards(words, { fps, ...(video.captions ?? {}) });
const cstats = cardStats(cards, fps);
fs.writeFileSync(path.join(BUILD, 'cards.json'), JSON.stringify(cards, null, 1));

// ---------------------------------------------------------------- (d) lint (ours; HyperFrames' lint runs after the bundle exists)
const errors = [], warnings = [];
await step('lint', async () => {
  const banned = [
    [/Math\.random\s*\(/, 'Math.random() -> use rng (mulberry32 / hash)'],
    [/Date\.now\s*\(/, 'Date.now() -> use the t you are given'],
    [/performance\.now\s*\(/, 'performance.now() -> use t'],
    [/requestAnimationFrame|setAnimationLoop/, 'requestAnimationFrame -> the host calls renderAt(t)'],
    [/\bset(Timeout|Interval)\s*\(/, 'timers -> not available during a render'],
    [/new\s+(THREE\.)?(Clock|Timer)\b/, 'THREE.Clock -> use t'],
    [/mixer\.update\s*\(/, 'mixer.update(dt) -> mixer.setTime(t)'],
  ];
  const scan = (dir) => {
    for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['.build', 'out', 'assets', 'audio', 'node_modules'].includes(n.name)) continue;
      const p = path.join(dir, n.name);
      if (n.isDirectory()) scan(p);
      else if (/\.(m?js)$/.test(n.name)) {
        fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
          if (/^\s*\/\//.test(line)) return;
          for (const [re, msg] of banned) if (re.test(line)) errors.push(`${rel(p)}:${i + 1}: ${msg}`);
        });
      }
    }
  };
  scan(VIDEO);
  let tl;
  try { tl = buildTimeline(video.shots, duration, fps); } catch (e) { errors.push(e.message); return; }
  const cast = video.cast ?? {}, props = video.props ?? {};
  for (const s of tl.shots) {
    const id = `shot "${s.id ?? s.index}"`;
    if (!video.sets[s.set]) errors.push(`${id}: unknown set "${s.set}"`);
    if (s.endFrame - s.startFrame < 6) errors.push(`${id}: shorter than 6 frames`);
    if (s.startFrame >= frames) errors.push(`${id}: starts at ${s.start}s, after the video ends (${duration}s)`);
    if (s.transition.type === 'dissolve' && (s.transition.frames < 4 || s.transition.frames > 12)) warnings.push(`${id}: dissolve of ${s.transition.frames} frames (references use 4-12)`);
    if (s.index > 0 && s.transition.type === 'cut') warnings.push(`${id}: hard cut (allowed, but dissolve is the default join)`);
    if (!s.camera) { errors.push(`${id}: no camera`); continue; }
    try {
      const p = Array.isArray(s.camera) ? cameraPath(s.camera, s.cameraDefaults) : s.camera;
      for (const k of p.keys) {
        if (k.push === 0 && k.arc === 0 && k.rise === 0) warnings.push(`${id}: camera key at ${k.t}s has no creep (push, arc and rise are all 0): the camera must never be still`);
        if (k.t > s.end) warnings.push(`${id}: camera key at ${k.t}s is after the shot ends (${s.end}s)`);
      }
      const a = p.at(s.start, fps), b = p.at(s.start + 1 / fps, fps);
      if (a.pos.distanceTo(b.pos) < 1e-5) warnings.push(`${id}: camera does not move on its first frame`);
    } catch (e) { errors.push(`${id}: ${e.message}`); }
    for (const [name, a] of Object.entries(s.actors ?? {})) {
      if (!cast[name]) { errors.push(`${id}: unknown actor "${name}"`); continue; }
      for (const k of a.track ?? []) {
        try { if (k.pose != null) resolvePose(k.pose); } catch (e) { errors.push(`${id} ${name}: ${e.message}`); }
        if (k.expr != null && !EXPRESSIONS[k.expr]) errors.push(`${id} ${name}: unknown expression "${k.expr}"`);
        for (const pn of Object.values(k.hold ?? {})) if (pn && !props[pn]) errors.push(`${id} ${name}: holds unknown prop "${pn}"`);
      }
      for (const pn of Object.values(a.hold ?? {})) if (pn && !props[pn]) errors.push(`${id} ${name}: holds unknown prop "${pn}"`);
    }
  }
  for (const c of cards) if (c.words > 3) warnings.push(`caption "${c.text}" has ${c.words} words`);
  if (cards.length && cstats.one < 0.5) warnings.push(`only ${(cstats.one * 100).toFixed(0)} % of caption cards are one word (references: 71-75 %)`);
  if (voFile && lastWord != null) {
    const tail = duration - lastWord;
    if (tail < 0.1 - 1e-6 || tail > 0.4 + 1e-6) warnings.push(`video ends ${tail.toFixed(2)} s after the last word (target 0.1-0.4 s)`);
  }
  if (voFile && !fs.existsSync(WORDS)) warnings.push('voiceover present but no words.json: no captions');
  for (const cue of A.sfx ?? []) if (!fs.existsSync(resolveIn(cue.file))) errors.push(`sfx file not found: ${cue.file}`);
  if (A.music?.file && !fs.existsSync(resolveIn(A.music.file))) errors.push(`music file not found: ${A.music.file}`);
});

// ---------------------------------------------------------------- (c) bundle + project files
await step('bundle', async () => {
  await esbuild.build({ ...esCommon, entryPoints: [path.join(ENGINE, 'lib', 'runtime.js')], outfile: path.join(BUILD, 'bundle.js'), format: 'iife', platform: 'browser', target: 'chrome120', legalComments: 'none' });
  fs.cpSync(path.join(ENGINE, 'assets', 'fonts'), path.join(BUILD, 'fonts'), { recursive: true });
  const assets = path.join(VIDEO, 'assets');
  fs.rmSync(path.join(BUILD, 'assets'), { recursive: true, force: true });
  if (fs.existsSync(assets)) fs.cpSync(assets, path.join(BUILD, 'assets'), { recursive: true });
  const cap = video.captions ?? {};
  const weight = cap.weight ?? 800;
  const cfg = { duration, fps, width: W, height: H, cards: cards.map((c) => ({ text: c.text, f0: c.f0, f1: c.f1 })) };
  const html = `<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <style>
      /* Poppins (OFL), served locally under a private family name: HyperFrames rewrites well-known
         family names to its own Google Fonts download, which needs the network and swapped the face. */
      @font-face { font-family: "ACS Caption"; font-weight: 800; font-style: normal; src: url("fonts/Poppins-ExtraBold.ttf") format("truetype"); }
      @font-face { font-family: "ACS Caption"; font-weight: 900; font-style: normal; src: url("fonts/Poppins-Black.ttf") format("truetype"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; }
      #gl { position: absolute; inset: 0; width: ${W}px; height: ${H}px; display: block; }
      ${captionCss({ width: W, height: H, weight, sizePct: cap.sizePct, strokePct: cap.strokePct, yPct: cap.yPct })}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${duration}" data-fps="${fps}" data-width="${W}" data-height="${H}" data-no-timeline>
      <canvas id="gl" class="clip" data-start="0" data-duration="${duration}" data-track-index="0" width="${W}" height="${H}"></canvas>
      <div id="captions" class="clip" data-start="0" data-duration="${duration}" data-track-index="1"><div id="caption"></div></div>
    </div>
    <script>window.__ACS = ${JSON.stringify(cfg)};</script>
    <script src="./bundle.js"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(BUILD, 'index.html'), html);
});

await step('hf-lint', async () => {
  const r = run(HF, ['lint', BUILD]);
  const text = (r.stdout + r.stderr).trim();
  fs.writeFileSync(path.join(BUILD, 'hf-lint.txt'), text);
  if (r.status !== 0) errors.push(`hyperframes lint failed:\n${text.split('\n').slice(0, 30).join('\n')}`);
});

for (const w of warnings) log(`warn  ${w}`);
if (errors.length) { for (const e of errors) console.error(`error ${e}`); die(`${errors.length} lint error(s)`); }

// ---------------------------------------------------------------- --snap
if (flags.snap) {
  const dir = path.join(OUT, 'snaps');
  fs.mkdirSync(dir, { recursive: true });
  const at = flags.snap.map((t) => Math.min(Math.max(0, t), duration - 0.5 / fps));
  const t0 = Date.now();
  const r = run(HF, ['snapshot', BUILD, '--at', at.join(','), '--no-end', '--keep', '-o', dir]);
  if (r.status !== 0) die(`snapshot failed:\n${(r.stdout + r.stderr).split('\n').slice(-20).join('\n')}`);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).map((f) => path.join(dir, f));
  log(`snap  ${at.length} still(s) in ${((Date.now() - t0) / 1000).toFixed(1)} s -> ${rel(dir)}`);
  for (const t of at) { const f = path.join(dir, `at-${String(+t.toFixed(3))}s.png`); log(`      ${fs.existsSync(f) ? rel(f) : `(missing) ${rel(f)}`}`); }
  void files;
  process.exit(0);
}

// ---------------------------------------------------------------- (e) render
const silent = path.join(BUILD, 'video.mp4');
await step('render', async () => {
  fs.rmSync(silent, { force: true });
  const args = ['render', BUILD, '--gpu', '--output', silent, '--quality', flags.draft ? 'draft' : 'looks'];
  if (flags.workers) args.push('--workers', String(flags.workers));
  else if (video.workers) args.push('--workers', String(video.workers));
  log(`rendering ${frames} frames (${duration.toFixed(2)} s @ ${fps} fps, ${W}x${H}${flags.draft ? ', draft' : ''}) ...`);
  const r = run(HF, args);
  fs.writeFileSync(path.join(BUILD, 'hf-render.log'), r.stdout + r.stderr);
  if (r.status !== 0 || !fs.existsSync(silent)) die(`hyperframes render failed (log: ${rel(path.join(BUILD, 'hf-render.log'))}):\n${(r.stdout + r.stderr).split('\n').slice(-25).join('\n')}`);
});

// ---------------------------------------------------------------- (f) audio
const final = path.join(OUT, 'final.mp4');
let audio = null;
await step('audio', async () => {
  const music = A.music?.file ? { ...A.music, file: resolveIn(A.music.file) } : null;
  const sfx = (A.sfx ?? []).map((c) => ({ ...c, file: resolveIn(c.file) }));
  if (voFile || music || sfx.length) {
    // leave 0.5 dB for the AAC encoder's overshoot; the final file is re-measured below
    audio = mixAudio({ vo: voFile, voOffset, music, sfx, duration, out: path.join(BUILD, 'mix.wav'), tmp: path.join(BUILD, 'audio'), targets: { truePeakDb: TARGETS.truePeakDb - 0.5, ...(A.targets ?? {}) } });
  }
  const args = ['-hide_banner', '-nostats', '-y', '-i', silent];
  if (audio) args.push('-i', path.join(BUILD, 'mix.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000');
  else args.push('-map', '0:v:0', '-an');
  args.push('-c:v', 'copy', '-map_metadata', '-1', '-movflags', '+faststart', '-t', duration.toFixed(4), final);
  const r = run('ffmpeg', args);
  if (r.status !== 0) die(`mux failed:\n${r.stderr.split('\n').slice(-12).join('\n')}`);
});

// ---------------------------------------------------------------- (g) validate
const report = await step('validate', async () => {
  const p = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', final]).stdout);
  const v = p.streams.find((s) => s.codec_type === 'video'), a = p.streams.find((s) => s.codec_type === 'audio');
  const checks = [];
  const check = (name, ok, got) => checks.push({ name, ok: !!ok, got });
  check('video codec h264', v?.codec_name === 'h264', v?.codec_name);
  check(`size ${W}x${H}`, v?.width === W && v?.height === H, `${v?.width}x${v?.height}`);
  check(`fps ${fps}`, v?.r_frame_rate === `${fps}/1`, v?.r_frame_rate);
  check('pix_fmt yuv420p', v?.pix_fmt === 'yuv420p', v?.pix_fmt);
  check(`frames ${frames}`, +v?.nb_frames === frames, +v?.nb_frames);
  check(`duration ${duration.toFixed(3)} s`, Math.abs(+p.format.duration - duration) < 1.5 / fps, +(+p.format.duration).toFixed(3));
  // every frame must differ from the one before it (the camera never stops)
  const md5 = run('ffmpeg', ['-hide_banner', '-nostats', '-i', final, '-map', '0:v:0', '-f', 'framemd5', '-']).stdout.split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split(',').pop().trim());
  let same = 0; for (let i = 1; i < md5.length; i++) if (md5[i] === md5[i - 1]) same++;
  check('no two consecutive frames identical', same === 0, `${same} repeat(s) in ${md5.length}`);
  let loud = null;
  if (audio) {
    loud = measure(final);
    check('audio aac 48 kHz stereo', a?.codec_name === 'aac' && +a?.sample_rate === 48000 && a?.channels === 2, `${a?.codec_name} ${a?.sample_rate} ${a?.channels}ch`);
    check(`integrated ${TARGETS.masterLufs} LUFS +-0.5`, Math.abs(loud.lufs - TARGETS.masterLufs) <= 0.5, `${loud.lufs} LUFS`);
    check(`true peak <= ${TARGETS.truePeakDb} dBTP`, loud.truePeak <= TARGETS.truePeakDb, `${loud.truePeak} dBTP`);
    if (voFile && lastWord != null) check('hard end 0.1-0.4 s after the last word', duration - lastWord >= 0.1 - 1e-6 && duration - lastWord <= 0.4 + 1e-6, `${(duration - lastWord).toFixed(2)} s`);
  } else {
    check('no audio stream (nothing supplied)', !a, a ? a.codec_name : 'none');
  }
  return { file: final, ok: checks.every((c) => c.ok), checks, loudness: loud, bitrateMbps: +(+p.format.bit_rate / 1e6).toFixed(2), sizeMB: +(fs.statSync(final).size / 1e6).toFixed(2) };
});

const total = +((Date.now() - t00) / 1000).toFixed(2);
const full = { video: path.basename(VIDEO), duration, frames, fps, draft: flags.draft, seconds: { ...times, total }, captions: { ...cstats, transcribed, wordsFile: fs.existsSync(WORDS) ? rel(WORDS) : null }, audio, ...report, warnings };
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(full, null, 1));

log('');
log(`${report.ok ? 'OK    ' : 'CHECK '}${rel(final)}  ${duration.toFixed(2)} s, ${frames} frames, ${report.sizeMB} MB, ${report.bitrateMbps} Mb/s`);
log(`time  total ${total} s  (render ${times.render} s = ${(frames / times.render).toFixed(0)} fps, bundle ${times.bundle} s, audio ${times.audio} s, validate ${times.validate} s${times.transcribe > 0.05 ? `, transcribe ${times.transcribe} s` : ''})`);
log(`caps  ${cstats.cards} cards: ${(cstats.one * 100).toFixed(0)} % one word, ${(cstats.two * 100).toFixed(0)} % two, ${(cstats.three * 100).toFixed(0)} % three; mean ${cstats.meanSeconds.toFixed(2)} s`);
if (audio) {
  const t = audio.tracks;
  if (t.vo) log(`audio VO ${t.vo.measuredLufs} -> ${t.vo.targetLufs} LUFS (${t.vo.gainDb >= 0 ? '+' : ''}${t.vo.gainDb} dB)`);
  if (t.music) log(`      music ${t.music.measuredLufs} -> ${t.music.targetLufs} LUFS${t.music.underVoDb != null ? ` (${t.music.underVoDb} dB under VO, no ducking)` : ''}`);
  if (t.sfx.length) log(`      ${t.sfx.length} sfx cue(s), peaks ${t.sfx.map((s) => s.peakDb).join(', ')} dBFS`);
  log(`      master ${report.loudness.lufs} LUFS, true peak ${report.loudness.truePeak} dBTP (measured on final.mp4; ${audio.passes.length} master pass(es))`);
} else log('audio none supplied -> silent file');
for (const c of report.checks) if (!c.ok) log(`FAIL  ${c.name}: got ${c.got}`);
log(`      ${report.checks.filter((c) => c.ok).length}/${report.checks.length} checks passed; report: ${rel(path.join(OUT, 'report.json'))}`);
process.exit(report.ok ? 0 : 2);
