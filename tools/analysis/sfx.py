"""SFX / non-speech event candidates, measured on the demucs 'no_vocals' stem (music + SFX estimate).
Music notes are narrow-band tonal, SFX are broadband or low-frequency, so two detectors are used:
  BB  : broadband floor (median of 1/3-octave band levels, 300 Hz-8 kHz: ignores isolated tonal peaks)
        >= 8 dB above its 4 s running median and above -62 dB/band
  LOW : 20-200 Hz band level >= 10 dB above its 4 s running median and above -38 dBFS
Events closer than 150 ms merge. Levels are dBFS of the stem (mono sum) and dB relative to the vocal-stem RMS.
Writes reference/analysis/sfx_candidates.json and prints a table."""
import json, sys
from common import *

def runmed(a, w):
    h = w // 2; p = np.pad(a, h, mode="edge")
    return np.array([np.median(p[i:i + w]) for i in range(len(a))])

def analyse(v):
    bl, br = load_stem(v, "no_vocals"); vl, vr = load_stem(v, "vocals")
    B = (bl + br) / 2; Sd = (bl - br) / 2; V = (vl + vr) / 2
    mag, f = stft(B, n=1024); smag, _ = stft(Sd, n=1024)
    fv = frame_db(V); act = fv > -40
    voice = 10 * np.log10(np.mean(10 ** (fv[act] / 10)))
    edges = 300 * 2 ** (np.arange(0, 15) / 3.0)
    third = np.stack([band_db(mag, f, edges[i], edges[i + 1]) for i in range(len(edges) - 1)], 1)
    bb = np.median(third, 1)
    low = band_db(mag, f, 20, 200); full = band_db(mag, f, 20, 16000)
    mid = band_db(mag, f, 200, 2000); hi = band_db(mag, f, 2000, 16000); side = band_db(smag, f, 20, 16000)
    m_bb = (bb > runmed(bb, 401) + 8) & (bb > -62)
    m_low = (low > runmed(low, 401) + 10) & (low > -38)
    mask = m_bb | m_low
    ev, i, n = [], 0, len(mask)
    while i < n:
        if mask[i]:
            j = i
            while j < n and mask[j:j + 15].any(): j += 1
            while j > i and not mask[j - 1]: j -= 1
            if j - i >= 3: ev.append((i, j))
            i = j + 1
        else: i += 1
    out = []
    for a, b in ev:
        s = slice(a, b); pk = a + int(np.argmax(full[s]))
        P = (mag[s] ** 2).mean(0)
        cen = float((P * f).sum() / (P.sum() + 1e-20))
        # 10-90 % rise time to the peak (attack) and time from peak to -10 dB (decay)
        att = pk - a
        dec = next((k for k in range(pk, min(n, pk + 300)) if full[k] < full[pk] - 10), pk + 300) - pk
        nwords = int(act[a:b].mean() * 100)
        out.append({"t": round(a * .01, 2), "dur": round((b - a) * .01, 2), "peak_t": round(pk * .01, 2),
                    "peak_dBFS": round(float(full[pk]), 1), "rel_voice_dB": round(float(full[pk] - voice), 1),
                    "low_dB": round(float(low[s].max()), 1), "mid_dB": round(float(mid[s].max()), 1), "hi_dB": round(float(hi[s].max()), 1),
                    "centroid_Hz": round(cen), "side_minus_mid_dB": round(float(side[s].max() - full[s].max()), 1),
                    "attack_ms": att * 10, "decay10dB_ms": dec * 10,
                    "det": ("BB" if m_bb[s].any() else "") + ("+LOW" if m_low[s].any() else ""), "voice_active_pct": nwords})
    return out, float(voice)

if __name__ == "__main__":
    res = {}
    for v in (sys.argv[1:] or VIDEOS):
        ev, voice = analyse(v)
        res[v] = {"voice_stem_rms_dBFS": round(voice, 1), "events": ev}
        dur = len(load(v)[0]) / SR
        per10 = [sum(1 for e in ev if a <= e["t"] < a + 10) for a in range(0, int(dur), 10)]
        res[v]["events_per_10s"] = per10
        print(f"== {v} voice {voice:.1f} dBFS; {len(ev)} events; per 10 s {per10}")
        for e in ev:
            print(f"{e['t']:6.2f} +{e['dur']:.2f} pk {e['peak_dBFS']:6.1f} rel {e['rel_voice_dB']:+6.1f} | low {e['low_dB']:6.1f} mid {e['mid_dB']:6.1f} hi {e['hi_dB']:6.1f} "
                  f"cen {e['centroid_Hz']:5d} side {e['side_minus_mid_dB']:+6.1f} att {e['attack_ms']:4d} dec {e['decay10dB_ms']:4d} {e['det']:7s} voc{e['voice_active_pct']}")
    json.dump(res, open(os.path.join(AN, "sfx_candidates.json"), "w"), indent=1)
