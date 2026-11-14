"""Merge strong SFX candidates (peak >= voice-13 dB) and label them by spectral shape.
The shape label is a heuristic from measurements (nobody listened): see rules in shape()."""
import json, sys
from common import *
ev_all = json.load(open(os.path.join(AN, "sfx_candidates.json")))

def shape(e):
    lowdom = e["low_dB"] >= max(e["mid_dB"], e["hi_dB"]) + 5
    hidom = e["hi_dB"] >= max(e["mid_dB"], e["low_dB"]) - 1 and e["centroid_Hz"] > 1500
    if e["dur"] >= 0.9: return "sustained/tail (rumble, blast, rolling)" if e["centroid_Hz"] < 600 else "sustained broadband (whoosh/crowd/debris)"
    if lowdom and e["centroid_Hz"] < 200: return "low thud/boom"
    if lowdom: return "thump/impact (low-mid)"
    if hidom and e["dur"] <= 0.15: return "click/tick/clink (short, bright)"
    if hidom: return "bright swish/rustle/sparkle"
    if e["attack_ms"] >= 150: return "whoosh/swell (slow attack)"
    return "mid impact/knock/pop"

def merged(v, thr=-13):
    out = []
    for e in ev_all[v]["events"]:
        if e["rel_voice_dB"] < thr: continue
        if out and e["t"] - (out[-1]["t"] + out[-1]["dur"]) < 0.35:
            m = out[-1]; m["dur"] = round(e["t"] + e["dur"] - m["t"], 2)
            for k in ("low_dB", "mid_dB", "hi_dB"): m[k] = max(m[k], e[k])
            if e["peak_dBFS"] > m["peak_dBFS"]:
                for k in ("peak_dBFS", "peak_t", "rel_voice_dB", "centroid_Hz", "side_minus_mid_dB"): m[k] = e[k]
        else: out.append(dict(e))
    return out

if __name__ == "__main__":
    res = {}
    for v in VIDEOS:
        m = merged(v); dur = len(load(v)[0]) / SR
        res[v] = m
        allc = ev_all[v]["events"]
        print(f"== {v}: strong {len(m)} ({len(m)/dur*10:.1f}/10s)  all candidates {len(allc)} ({len(allc)/dur*10:.1f}/10s)  "
              f"strong per 10s {[sum(1 for e in m if a <= e['t'] < a+10) for a in range(0, int(dur), 10)]}  "
              f">= voice-6dB: {sum(1 for e in m if e['rel_voice_dB'] >= -6)}  >= voice: {sum(1 for e in m if e['rel_voice_dB'] >= 0)}")
        for e in m:
            e["shape"] = shape(e)
            print(f"| {e['t']:.2f} | {e['dur']:.2f} | {e['peak_dBFS']:.0f} | {e['rel_voice_dB']:+.0f} | {e['centroid_Hz']} | {e['side_minus_mid_dB']:+.0f} | {e['shape']} |")
    json.dump(res, open(os.path.join(AN, "sfx_strong_merged.json"), "w"), indent=1)
