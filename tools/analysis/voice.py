"""Voice metrics: speech rate, pauses, sentence gaps, pitch (autocorrelation), level."""
import json, re, sys
from common import *

def pitch_track(x, sr=SR, fmin=60, fmax=400, win=0.04, hop=0.01):
    n, h = int(win * sr), int(hop * sr)
    lo, hi = int(sr / fmax), int(sr / fmin)
    out = []
    for i in range(0, len(x) - n - hi, h):
        s = x[i:i + n + hi]
        a = s[:n] - s[:n].mean()
        e0 = (a * a).sum()
        if e0 < 1e-3 * n * 0.01: out.append((i / sr, 0, 0)); continue
        best, bl = 0, 0
        r = np.array([(a * (s[l:l + n] - s[l:l + n].mean())).sum() / np.sqrt(e0 * ((s[l:l + n] - s[l:l + n].mean()) ** 2).sum() + 1e-12)
                      for l in range(lo, hi)])
        k = int(np.argmax(r))
        # prefer the shortest lag within 0.9 of the max (avoid octave-down errors)
        for j in range(1, len(r) - 1):
            if r[j] > 0.9 * r[k] and r[j] >= r[j - 1] and r[j] >= r[j + 1]: k = j; break
        out.append((i / sr, sr / (lo + k), r[k]))
    return np.array(out)

def analyse(v):
    L, R = load(v); M = (L + R) / 2; dur = len(M) / SR
    J = json.load(open(os.path.join(AN, "transcripts", v + ".json")))
    ws, ss = J["words"], J["sentences"]
    n = len(ws); t0, t1 = ws[0]["start"], ws[-1]["end"]
    res = {"video": v, "duration_s": round(dur, 2), "words": n,
           "wpm_overall": round(n / dur * 60, 1), "wpm_speaking_span": round(n / (t1 - t0) * 60, 1)}
    gaps = [(round(ws[i + 1]["start"] - ws[i]["end"], 2), ws[i]["end"], ws[i]["word"], ws[i + 1]["word"]) for i in range(n - 1)]
    big = [g for g in gaps if g[0] > 0.15]
    sent_end = lambda w: bool(re.search(r"[.!?]$", w))
    comma = lambda w: w.endswith(",")
    res["pauses_gt150ms"] = {"count": len(big), "total_s": round(sum(g[0] for g in big), 2),
                             "at_sentence_end": sum(sent_end(g[2]) for g in big),
                             "at_comma": sum(comma(g[2]) for g in big),
                             "mid_phrase": sum(not sent_end(g[2]) and not comma(g[2]) for g in big),
                             "max": max(big), "median_s": float(np.median([g[0] for g in big]))}
    sg = [g[0] for g in gaps if sent_end(g[2])]
    res["sentence_gap_s"] = {"n": len(sg), "median": float(np.median(sg)), "mean": round(float(np.mean(sg)), 3),
                             "min": min(sg), "max": max(sg), "p25": float(np.percentile(sg, 25)), "p75": float(np.percentile(sg, 75))}
    res["articulation_wpm_excl_pauses_gt150ms"] = round(n / ((t1 - t0) - sum(g[0] for g in big)) * 60, 1)
    res["wpm_per_10s"] = [sum(1 for w in ws if a <= w["start"] < a + 10) * 6 for a in range(0, int(dur) - 9, 10)]
    res["wpm_per_5s"] = [sum(1 for w in ws if a <= w["start"] < a + 5) * 12 for a in range(0, int(dur) - 4, 5)]
    syl = lambda w: max(1, len(re.findall(r"[aeiouy]+", re.sub(r"e\b", "", w.lower()))))
    res["syllables_per_s_est"] = round(sum(syl(re.sub(r"\d+", "nineteen", w["word"])) for w in ws) / (t1 - t0), 2)
    # true audio onset / tail (first / last 10 ms frame above -50 dBFS)
    fr = np.array([db(M[i:i + 441]) for i in range(0, len(M) - 441, 441)])
    on = np.where(fr > -50)[0]
    res["audio_first_frame_above_-50dBFS_s"] = round(on[0] * 0.01, 2)
    on2 = np.where(fr > -25)[0]
    res["voice_onset_above_-25dBFS_s"] = round(on2[0] * 0.01, 2)
    res["last_word_end_s"] = t1; res["tail_after_last_word_s"] = round(dur - t1, 2)
    res["level_last_100ms_dBFS"] = round(float(db(M[-4410:])), 1)
    # pitch
    pt = pitch_track(M[::2] if False else M)
    sp = speech_mask(v, int(dur * 100) + 2)
    vo = np.array([p for p in pt if p[2] > 0.6 and sp[int(p[0] * 100)]])
    f0 = vo[:, 1]
    res["pitch_Hz"] = {"median": round(float(np.median(f0)), 1), "p5": round(float(np.percentile(f0, 5)), 1),
                       "p95": round(float(np.percentile(f0, 95)), 1), "mean": round(float(f0.mean()), 1),
                       "sd_semitones": round(float(np.std(12 * np.log2(f0 / np.median(f0)))), 2),
                       "range_p5_p95_semitones": round(float(12 * np.log2(np.percentile(f0, 95) / np.percentile(f0, 5))), 1),
                       "voiced_frames": len(f0)}
    # per-sentence median F0 and final-word F0 (declination / quote voices)
    per = []
    for s in ss:
        m = vo[(vo[:, 0] >= s["start"]) & (vo[:, 0] <= s["end"])]
        if len(m) > 5: per.append((s["start"], round(float(np.median(m[:, 1]))), round(float(np.percentile(m[:, 1], 95))), s["text"][:40]))
    res["sentence_f0_median_p95"] = per
    # voice level: RMS of frames inside words
    m10 = np.array([db(M[i:i + 441]) for i in range(0, len(M) - 441, 441)])
    sp2 = sp[:len(m10)]
    res["voice_level_dBFS"] = {"rms_in_words": round(float(10 * np.log10(np.mean(10 ** (m10[sp2] / 10)))), 1),
                               "p10": round(float(np.percentile(m10[sp2], 10)), 1), "p50": round(float(np.percentile(m10[sp2], 50)), 1),
                               "p95": round(float(np.percentile(m10[sp2], 95)), 1)}
    # word-level loudness per sentence (dynamics consistency)
    sl = [float(10 * np.log10(np.mean(10 ** (m10[int(s["start"] * 100):int(s["end"] * 100)] / 10)))) for s in ss]
    res["sentence_level_sd_dB"] = round(float(np.std(sl)), 2); res["sentence_level_range_dB"] = [round(min(sl), 1), round(max(sl), 1)]
    res["all_gaps_gt150ms"] = big
    return res

if __name__ == "__main__":
    out = {}
    for v in (sys.argv[1:] or VIDEOS):
        out[v] = analyse(v)
        print(json.dumps(out[v], indent=None, default=float)[:6000]); print()
    json.dump(out, open(os.path.join(AN, "voice_metrics.json"), "w"), indent=1, default=float)
