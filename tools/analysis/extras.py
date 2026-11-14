"""Extra measurements: music-only level (bed stem with SFX frames removed), stem-leak check,
envelope-based pauses (vocal stem), LPC formants (vocal-tract size hint). -> reference/analysis/extras.json"""
import json
from common import *
ev_all = json.load(open(os.path.join(AN, "sfx_candidates.json")))

def lpc_formants(x, sr, order=12):
    x = np.append(x[0], x[1:] - 0.97 * x[:-1]) * np.hamming(len(x))
    r = np.correlate(x, x, "full")[len(x) - 1:len(x) + order]
    R = np.array([[r[abs(i - j)] for j in range(order)] for i in range(order)])
    try: a = np.linalg.solve(R + 1e-9 * np.eye(order), r[1:order + 1])
    except np.linalg.LinAlgError: return []
    rts = np.roots(np.concatenate([[1], -a])); rts = rts[np.imag(rts) > 0]
    fr = np.angle(rts) * sr / (2 * np.pi); bw = -sr / np.pi * np.log(np.abs(rts))
    return sorted(f for f, b in zip(fr, bw) if 200 < f < 5000 and b < 400)

out = {}
for v in VIDEOS:
    bl, br = load_stem(v, "no_vocals"); B = (bl + br) / 2
    vl, vr = load_stem(v, "vocals"); V = (vl + vr) / 2
    fv = frame_db(V); mag, f = stft(B, n=1024)
    n = min(len(fv), len(mag)); fv = fv[:n]
    ev = np.zeros(n, bool)
    for e in ev_all[v]["events"]: ev[max(0, int(e["t"] * 100) - 10):int((e["t"] + e["dur"]) * 100) + 30] = True
    r = {"sfx_event_frames_pct": round(float(ev.mean() * 100), 1)}
    voice = 10 * np.log10(np.mean(10 ** (fv[fv > -40] / 10)))
    for nm, lo, hi in (("250-8000Hz", 250, 8000), ("20-16000Hz", 20, 16000), ("20-200Hz", 20, 200)):
        b = band_db(mag, f, lo, hi)[:n]
        rms = lambda m: round(float(10 * np.log10(np.mean(10 ** (b[m] / 10)))), 1)
        r[f"bed_{nm}"] = {"rms_no_sfx_dBFS": rms(~ev), "rms_no_sfx_rel_voice_dB": round(rms(~ev) - float(voice), 1),
                          "rms_all_dBFS": rms(np.ones(n, bool)),
                          "median_voice_loud": round(float(np.median(b[(fv > -22) & ~ev])), 1),
                          "median_voice_quiet": round(float(np.median(b[(fv < -30) & ~ev])), 1)}
    # envelope pauses on the vocal stem at two thresholds relative to the voice median level
    med = float(np.median(fv[fv > -40])); r["voice_stem_median_dBFS"] = round(med, 1)
    for rel in (-8, -11, -15):
        q = fv < med + rel; runs = []; i = 0
        while i < n:
            if q[i]:
                j = i
                while j < n and q[j]: j += 1
                if j - i >= 15: runs.append((round(i * .01, 2), round((j - i) * .01, 2)))
                i = j
            else: i += 1
        d = [x[1] for x in runs]
        r[f"pauses_ge150ms_at_median{rel}dB"] = {"count": len(d), "total_s": round(sum(d), 2), "median_s": round(float(np.median(d)), 2) if d else None,
                                                 "max_s": max(d) if d else None, "pct_of_runtime": round(sum(d) / (n / 100) * 100, 1)}
    # decay after sentence ends: time for vocal stem to fall 20 dB (reverb / release hint)
    # formants on loud voiced frames, 11025 Hz
    x = V[::4]; sr = SR / 4; F = []
    for i in range(0, len(x) - 330, 220):
        seg = x[i:i + 330]
        if db(seg) > -20:
            fm = lpc_formants(seg, sr)
            if len(fm) >= 4: F.append(fm[:4])
    F = np.array(F)
    r["lpc_formants_median_Hz"] = [round(float(x)) for x in np.median(F, 0)]; r["lpc_frames"] = len(F)
    r["mean_formant_spacing_F4-F1_over_3_Hz"] = round(float(np.median((F[:, 3] - F[:, 0]) / 3)))
    out[v] = r; print(v, json.dumps(r))
json.dump(out, open(os.path.join(AN, "extras.json"), "w"), indent=1)
