"""Loudness via ffmpeg ebur128 (integrated, LRA, true peak, per-second momentary/short-term),
plus stereo width and octave-band spectral balance. Writes reference/analysis/loudness.json."""
import json, re, subprocess, sys
from common import *

def ebur(v):
    src = os.path.join(ROOT, "reference", "source", v + ".mp4")
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-vn", "-i", src, "-af",
                        "ebur128=peak=true:metadata=1,ametadata=print:file=-", "-f", "null", "-"], capture_output=True, text=True)
    meta, p = p.stdout, p.stderr
    f = lambda s: max(-120.0, float(s)) if s not in ("-inf", "nan") else -120.0
    t = np.array([float(x) for x in re.findall(r"pts_time:([\d.]+)", meta)])
    m = np.array([f(x) for x in re.findall(r"lavfi\.r128\.M=(\S+)", meta)])
    s = np.array([f(x) for x in re.findall(r"lavfi\.r128\.S=(\S+)", meta)])
    t = t[:len(m)]
    summ = p[p.rfind("Summary:"):]
    g = lambda k: float(re.search(k + r":\s*(-?[\d.]+)", summ).group(1))
    res = {"integrated_LUFS": g("I"), "LRA_LU": g("LRA"), "LRA_low": g("LRA low"), "LRA_high": g("LRA high"), "true_peak_dBTP": g("Peak")}
    ok = t >= 3.0
    res["short_term_LUFS"] = {"min": float(s[ok].min()), "max": float(s[ok].max()), "range": round(float(s[ok].max() - s[ok].min()), 1)}
    mm = m[t >= 0.4]
    res["momentary_LUFS"] = {"min": float(mm.min()), "max": float(mm.max()), "p5": round(float(np.percentile(mm, 5)), 1), "p95": round(float(np.percentile(mm, 95)), 1)}
    res["momentary_per_second"] = [round(float(m[(t > i) & (t <= i + 1)].max()), 1) for i in range(int(t.max()))]
    return res

def extra(v):
    L, R = load(v); M = (L + R) / 2; S = (L - R) / 2
    r = {"sample_peak_dBFS": round(float(20 * np.log10(np.abs(np.stack([L, R])).max())), 2),
         "rms_dBFS": round(float(db(np.concatenate([L, R]))), 1),
         "crest_dB": round(float(20 * np.log10(np.abs(np.stack([L, R])).max()) - db(np.concatenate([L, R]))), 1),
         "LR_correlation": round(float(np.corrcoef(L, R)[0, 1]), 3),
         "side_minus_mid_dB": round(float(db(S) - db(M)), 1),
         "L_minus_R_dB": round(float(db(L) - db(R)), 2), "dc_offset": float(M.mean())}
    mag, f = stft(M, n=4096, hop=2048)
    P = (mag ** 2).mean(0)
    bands = [(20, 60), (60, 125), (125, 250), (250, 500), (500, 1000), (1000, 2000), (2000, 4000), (4000, 8000), (8000, 16000), (16000, 22050)]
    tot = P.sum()
    r["octave_band_dB_rel_total"] = {f"{lo}-{hi}": round(float(10 * np.log10(P[(f >= lo) & (f < hi)].sum() / tot + 1e-12)), 1) for lo, hi in bands}
    r["spectral_centroid_Hz"] = round(float((P * f).sum() / tot))
    c = np.cumsum(P) / tot
    r["rolloff_95pct_Hz"] = round(float(f[np.searchsorted(c, 0.95)])); r["rolloff_99.9pct_Hz"] = round(float(f[np.searchsorted(c, 0.999)]))
    # per-band L/R correlation (width by frequency)
    ml, _ = stft(L, n=4096, hop=2048); ms, _ = stft(S, n=4096, hop=2048)
    PS = (ms ** 2).mean(0)
    r["side_minus_mid_by_band_dB"] = {f"{lo}-{hi}": round(float(10 * np.log10(PS[(f >= lo) & (f < hi)].sum() / (P[(f >= lo) & (f < hi)].sum() + 1e-20) + 1e-12)), 1) for lo, hi in bands[:-1]}
    return r

if __name__ == "__main__":
    out = {}
    for v in VIDEOS:
        out[v] = {**ebur(v), **extra(v)}
        print(v, json.dumps(out[v]))
    json.dump(out, open(os.path.join(AN, "loudness.json"), "w"), indent=1)
