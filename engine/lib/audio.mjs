// Audio mix + master (Node, ffmpeg). The voiceover is ALWAYS supplied by the
// user; nothing here synthesises speech.
//
// Why a final ffmpeg pass and not HyperFrames' mixer: HyperFrames sums the
// tracks at the volumes you give it and stops there (its bench mix measured
// -17.4 LUFS, -5.6 dBTP). The spec needs measured targets: VO at -14.5 LUFS,
// music a fixed 22-25 dB under it with NO ducking, master at -14 LUFS with
// true peak <= -1 dBTP. That takes a measure -> gain -> limit -> re-measure
// loop, which is what this file does.
//
//   VO      mono, centre, linear gain to -14.5 LUFS (no compression)
//   MUSIC   stereo, linear gain to (VO - under) LUFS, looped to length, optional section steps
//   SFX     each cue placed at t, level set by peak (peakDb, dBFS) or raw gainDb
//   MASTER  linear gain to -14 LUFS, 4x-oversampled limiter, hard end (no fade)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const TARGETS = { voLufs: -14.5, musicUnderDb: 23, masterLufs: -14, truePeakDb: -1.0 };

function ff(args, { allowFail = false } = {}) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.error) throw new Error(`ffmpeg not runnable: ${r.error.message}`);
  if (r.status !== 0 && !allowFail) throw new Error(`ffmpeg failed (${r.status}):\nffmpeg ${args.join(' ')}\n${r.stderr.split('\n').slice(-12).join('\n')}`);
  return r.stderr;
}

/** Integrated loudness (LUFS), true peak (dBTP) and loudness range of a file, optionally through a filter chain. */
export function measure(file, pre = '') {
  const err = ff(['-i', file, '-af', `${pre ? pre + ',' : ''}ebur128=peak=true`, '-f', 'null', '-']);
  const tail = err.slice(err.lastIndexOf('Summary:'));
  const num = (re) => { const m = tail.match(re); return m ? parseFloat(m[1]) : NaN; };
  return { lufs: num(/I:\s+(-?[\d.]+|-inf) LUFS/), truePeak: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/), lra: num(/LRA:\s+(-?[\d.]+) LU/) };
}

/** Sample peak in dBFS (for short SFX, where integrated loudness is undefined). */
export function peakDb(file) {
  const err = ff(['-i', file, '-af', 'volumedetect', '-f', 'null', '-']);
  const m = err.match(/max_volume:\s+(-?[\d.]+) dB/);
  return m ? parseFloat(m[1]) : NaN;
}

export function durationOf(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  return parseFloat(r.stdout);
}

const VO_CHAIN = 'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=mono,pan=stereo|c0=c0|c1=c0';
const ST_CHAIN = 'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo';

/**
 * @param {object} o
 * @param {string|null} o.vo            voiceover file (user supplied) or null
 * @param {number} [o.voOffset=0]       seconds the VO starts into the video
 * @param {object|null} o.music         { file, underDb=23, start=0, sections:[{t, gainDb}] }
 * @param {object[]} [o.sfx]            [{ t, file, peakDb | gainDb }]
 * @param {number} o.duration           video length; the mix is cut hard at this point
 * @param {string} o.out                output wav (48 kHz stereo, 24 bit)
 * @param {string} o.tmp                scratch directory
 * @returns {object} report with every measured number
 */
export function mixAudio({ vo = null, voOffset = 0, music = null, sfx = [], duration, out, tmp, targets = {} }) {
  const T = { ...TARGETS, ...targets };
  fs.mkdirSync(tmp, { recursive: true });
  const rep = { targets: T, tracks: {}, passes: [] };
  const inputs = [], chains = [], labels = [];
  let nIn = 0;
  const input = (file, pre = []) => { inputs.push(...pre, '-i', file); return nIn++; };
  const chain = (i, c) => { const lab = `a${labels.length}`; chains.push(`[${i}:a]${c}[${lab}]`); labels.push(`[${lab}]`); };

  if (vo) {
    const m = measure(vo, VO_CHAIN);
    const gain = T.voLufs - m.lufs;
    rep.tracks.vo = { file: path.basename(vo), measuredLufs: m.lufs, gainDb: +gain.toFixed(2), targetLufs: T.voLufs, offset: voOffset, seconds: durationOf(vo) };
    chain(input(vo), `${VO_CHAIN},volume=${gain.toFixed(3)}dB,adelay=${Math.round(voOffset * 1000)}:all=1`);
  }
  if (music?.file) {
    const under = music.underDb ?? T.musicUnderDb;
    const m = measure(music.file, ST_CHAIN);
    const target = (vo ? T.voLufs : T.masterLufs) - (vo ? under : 0);
    const gain = target - m.lufs;
    const start = music.start ?? 0;
    // section steps: 0.15 s ramps between fixed levels (story turns), never ducking
    let expr = '1';
    let prev = 0;
    for (const s of [...(music.sections ?? [])].sort((a, b) => a.t - b.t)) {
      const a = Math.pow(10, prev / 20), b = Math.pow(10, s.gainDb / 20);
      expr += `+(${(b - a).toFixed(5)})*clip((t-${s.t})/0.15\\,0\\,1)`;
      prev = s.gainDb;
    }
    rep.tracks.music = { file: path.basename(music.file), measuredLufs: m.lufs, gainDb: +gain.toFixed(2), targetLufs: +target.toFixed(2), underVoDb: vo ? under : null, sections: music.sections ?? [] };
    chain(input(music.file, ['-stream_loop', '-1']), `${ST_CHAIN},volume=${gain.toFixed(3)}dB${expr !== '1' ? `,volume='${expr}':eval=frame` : ''},adelay=${Math.round(start * 1000)}:all=1`);
  }
  rep.tracks.sfx = [];
  for (const cue of sfx ?? []) {
    if (cue.t >= duration) continue;
    const pk = peakDb(cue.file);
    const gain = cue.gainDb != null ? cue.gainDb : (cue.peakDb ?? -24) - pk;
    rep.tracks.sfx.push({ t: cue.t, file: path.basename(cue.file), sourcePeakDb: pk, gainDb: +gain.toFixed(2), peakDb: +(pk + gain).toFixed(2) });
    chain(input(cue.file), `${ST_CHAIN},volume=${gain.toFixed(3)}dB,adelay=${Math.round(cue.t * 1000)}:all=1`);
  }
  if (!labels.length) return null;

  // pass 1: premix, float, cut hard at the video end
  const pre = path.join(tmp, 'premix.wav');
  // A silent bed of unlimited length is mixed in and the OUTPUT is cut with -t: this ends the
  // run at exactly `duration` whatever the inputs do (a looped music input never ends by itself).
  inputs.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
  chains.push(`[${nIn}:a]aformat=sample_fmts=fltp:channel_layouts=stereo[bed]`); labels.push('[bed]');
  ff([...inputs, '-filter_complex', `${chains.join(';')};${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest[out]`, '-map', '[out]', '-t', duration.toFixed(4), '-c:a', 'pcm_f32le', '-ar', '48000', pre]);
  const m0 = measure(pre);
  rep.premix = m0;

  // pass 2..n: master gain + oversampled limiter until both targets are met
  let gain = T.masterLufs - m0.lufs, limit = T.truePeakDb - 0.3, final = null;
  for (let i = 0; i < 6; i++) {
    const lin = Math.pow(10, limit / 20).toFixed(5);
    ff(['-i', pre, '-af', `volume=${gain.toFixed(3)}dB,aresample=192000,alimiter=limit=${lin}:attack=3:release=60:level=false:asc=true,aresample=48000`, '-c:a', 'pcm_s24le', '-ar', '48000', out]);
    final = measure(out);
    rep.passes.push({ masterGainDb: +gain.toFixed(2), limiterDb: +limit.toFixed(2), lufs: final.lufs, truePeak: final.truePeak });
    const dL = T.masterLufs - final.lufs, over = final.truePeak - T.truePeakDb;
    if (Math.abs(dL) <= 0.15 && over <= 0) break;
    if (over > 0) limit -= over + 0.15;
    if (Math.abs(dL) > 0.15) gain += dL;
  }
  rep.master = { ...final, seconds: durationOf(out) };
  rep.ok = Math.abs(final.lufs - T.masterLufs) <= 0.5 && final.truePeak <= T.truePeakDb + 0.05;
  return rep;
}
