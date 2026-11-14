"""Music bed + ducking measurements on the demucs 'no_vocals' stem, cross-checked on the raw mix side channel.
 - tonal notes (stable 12-TET lines) -> presence, pitch classes per section, note length, note level
 - tempo: autocorrelation of spectral-flux onsets (300-4000 Hz) of the bed stem
 - bed level per 5 s (median of 10 ms frames, 250-4000 Hz = music band; SFX spikes ignored by the median)
 - ducking: music-band level while voice active vs in pauses >= 200 ms; pause-aligned average curve
Writes reference/analysis/music_metrics.json"""
import json, sys
from common import *
from tonal import notes, NAMES

def vad(v):
    vl, vr = load_stem(v, "vocals"); fv = frame_db((vl + vr) / 2)
    act = fv > -40
    # fill holes < 60 ms (plosive closures), drop blips < 40 ms
    a = act.copy(); i = 0
    while i < len(a):
        j = i
        while j < len(a) and a[j] == a[i]: j += 1
        if not a[i] and j - i < 6 and i > 0 and j < len(a): a[i:j] = True
        i = j
    return a, fv

def tempo(B):
    mag, f = stft(B, n=1024)
    m = (f >= 300) & (f < 4000)
    lg = np.log1p(200 * mag[:, m])
    flux = np.maximum(lg[1:] - lg[:-1], 0).sum(1)
    flux = flux - np.convolve(flux, np.ones(50) / 50, "same"); flux = np.maximum(flux, 0)
    ac = np.correlate(flux, flux, "full")[len(flux) - 1:]; ac /= ac[0]
    cands = [(float(ac[i]), i * 0.01) for i in range(25, 200) if ac[i] > ac[i - 1] and ac[i] >= ac[i + 1]]
    cands.sort(reverse=True)
    return [{"lag_s": round(l, 2), "bpm": round(60 / l, 1), "r": round(r, 3)} for r, l in cands[:5]], flux

def analyse(v):
    bl, br = load_stem(v, "no_vocals"); B = (bl + br) / 2
    act, fv = vad(v)
    voice = float(10 * np.log10(np.mean(10 ** (fv[act] / 10))))
    mag, f = stft(B, n=1024)
    mus = band_db(mag, f, 250, 4000)[:len(act)]; full = band_db(mag, f, 20, 16000)[:len(act)]
    act = act[:len(mus)]
    res = {"voice_stem_rms_dBFS": round(voice, 1), "bed_stem_rms_dBFS": round(float(db(B)), 1)}
    ns = [n for n in notes(B, lo=250, hi=4000, floor_db=-70)]
    cents = np.abs([n[4] for n in ns])
    res["tonal_notes"] = {"count": len(ns), "median_abs_cents_from_12TET": round(float(np.median(cents)), 1),
                          "median_note_dur_s": round(float(np.median([n[1] for n in ns])), 2),
                          "p90_note_dur_s": round(float(np.percentile([n[1] for n in ns], 90)), 2),
                          "median_note_peak_dB": round(float(np.median([n[5] for n in ns])), 1),
                          "first_note_s": round(min(n[0] for n in ns), 2), "last_note_end_s": round(max(n[0] + n[1] for n in ns), 2)}
    dur = len(B) / SR
    sec = []
    for a in range(0, int(dur), 5):
        sub = [n for n in ns if a <= n[0] < a + 5]
        pcs = {}
        for n in sub: pcs[n[3][:-1]] = pcs.get(n[3][:-1], 0) + n[1]
        top = sorted(pcs.items(), key=lambda kv: -kv[1])[:5]
        fr = slice(a * 100, (a + 5) * 100)
        sec.append({"t": a, "notes": len(sub), "median_dur": round(float(np.median([n[1] for n in sub])), 2) if sub else None,
                    "top_pitch_classes": [k for k, _ in top],
                    "median_fund_Hz": round(float(np.median([n[2] for n in sub]))) if sub else None,
                    "music_band_median_dB": round(float(np.median(mus[fr])), 1), "music_band_p20_dB": round(float(np.percentile(mus[fr], 20)), 1),
                    "full_median_dB": round(float(np.median(full[fr])), 1)})
    res["per_5s"] = sec
    pcs = {}
    for n in ns: pcs[n[3][:-1]] = pcs.get(n[3][:-1], 0) + n[1]
    res["pitch_class_seconds"] = {k: round(x, 1) for k, x in sorted(pcs.items(), key=lambda kv: -kv[1])}
    res["tempo_candidates"], _ = tempo(B)
    # --- level relative to voice
    res["music_band_median_dBFS"] = round(float(np.median(mus)), 1)
    res["bed_full_median_dBFS"] = round(float(np.median(full)), 1)
    res["bed_full_median_rel_voice_dB"] = round(float(np.median(full)) - voice, 1)
    res["bed_full_p90_rel_voice_dB"] = round(float(np.percentile(full, 90)) - voice, 1)
    # --- ducking.  The vocal stem never falls to silence (tails), so: "voice loud" = stem > -22 dBFS,
    # "pause" = stem < -30 dBFS for >= 120 ms (2 frames trimmed each side).
    loud = fv[:len(mus)] > -22; quiet = fv[:len(mus)] < -30
    pauses, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if j - i >= 12: pauses.append((i, j))
            i = j
        else: i += 1
    inner = np.zeros(len(quiet), bool)
    for a, b in pauses: inner[a + 2:b - 2] = True
    d = {"pauses_ge120ms_below_-30dBFS": len(pauses), "pause_frames": int(inner.sum())}
    for nm, x in (("music_band_250-4000Hz", mus), ("bed_full", full)):
        for q in (25, 50, 75):
            d[f"{nm}_p{q}_voice_loud"] = round(float(np.percentile(x[loud], q)), 1)
            d[f"{nm}_p{q}_in_pauses"] = round(float(np.percentile(x[inner], q)), 1)
    d["difference_dB(pause-voice)_median_music_band"] = round(d["music_band_250-4000Hz_p50_in_pauses"] - d["music_band_250-4000Hz_p50_voice_loud"], 1)
    # local comparison: each pause vs the 300 ms of loud voice just before it (removes section-level changes)
    loc = [float(np.median(mus[a + 2:b - 2]) - np.median(mus[max(0, a - 40):a - 10])) for a, b in pauses if a > 40]
    d["per_pause_local_difference_dB"] = {"median": round(float(np.median(loc)), 1), "p25": round(float(np.percentile(loc, 25)), 1),
                                          "p75": round(float(np.percentile(loc, 75)), 1), "n": len(loc)}
    cur = [mus[a - 30:a + 30] for a, b in pauses if b - a >= 15 and a >= 30 and a + 30 < len(mus)]
    if cur:
        c = np.median(np.stack(cur), 0)
        d["pause_aligned_median_curve_dB_every_50ms_from_-300ms"] = [round(float(c[k:k + 5].mean()), 1) for k in range(0, 60, 5)]
        d["pause_aligned_n"] = len(cur)
    res["ducking"] = d; act = loud
    # cross-check on the delivered mix: side channel 300-3000 Hz (voice is centred)
    L, R = load(v); sm, f2 = stft((L - R) / 2, n=1024)
    sd = band_db(sm, f2, 300, 3000)[:len(act)]
    sd_ok = sd > -100   # AAC zeroes the side channel at times; ignore those frames
    res["ducking"]["mix_side_300-3000Hz_median_dB_voice_active"] = round(float(np.median(sd[act & sd_ok])), 1)
    res["ducking"]["mix_side_300-3000Hz_median_dB_in_pauses"] = round(float(np.median(sd[inner & sd_ok])), 1)
    return res

if __name__ == "__main__":
    out = {}
    for v in (sys.argv[1:] or VIDEOS):
        out[v] = analyse(v); r = out[v]
        print("==", v); print({k: r[k] for k in r if k not in ("per_5s",)})
        for s in r["per_5s"]: print("  ", s)
    json.dump(out, open(os.path.join(AN, "music_metrics.json"), "w"), indent=1)
