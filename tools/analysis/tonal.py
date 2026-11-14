"""Find stable-frequency tonal lines (music notes) that persist while voice pitch glides.
High-res STFT (8192 @ 44.1k = 5.4 Hz bins, 20 ms hop); a 'note' = spectral peak staying within
+-1 bin for >= MIN_DUR. Reports notes (time, dur, Hz, nearest 12-TET pitch, cents off, level dB)."""
import sys
from common import *
NAMES = "C C# D D# E F F# G G# A A# B".split()
MIN_DUR = 0.24

def notes(x, lo=180, hi=5000, floor_db=-78):
    n, hop = 8192, 882
    mag, f = stft(x, n=n, hop=hop)
    d = 20 * np.log10(mag + 1e-9)
    sel = np.where((f >= lo) & (f < hi))[0]
    pk = np.zeros_like(d, bool)
    c = d[:, sel]
    # local peak across frequency, 8 dB above the median of the +-20-bin neighbourhood
    for j, b in enumerate(sel):
        nb = np.median(d[:, b - 20:b + 21], axis=1)
        pk[:, b] = (d[:, b] >= d[:, b - 1]) & (d[:, b] > d[:, b + 1]) & (d[:, b] > nb + 10) & (d[:, b] > floor_db)
    out = []
    used = np.zeros_like(pk)
    T = len(d)
    for t in range(T):
        for b in np.where(pk[t] & ~used[t])[0]:
            tt, bb, lv = t, b, []
            while tt < T:
                cand = [k for k in (bb, bb - 1, bb + 1) if pk[tt, k] and not used[tt, k]]
                if not cand: break
                if abs(cand[0] - b) > 1: break
                bb = cand[0]; used[tt, bb] = True; lv.append(d[tt, bb]); tt += 1
            dur = (tt - t) * hop / SR
            if dur >= MIN_DUR:
                hz = f[b]; m = 69 + 12 * np.log2(hz / 440)
                out.append((t * hop / SR, dur, hz, NAMES[int(round(m)) % 12] + str(int(round(m)) // 12 - 1),
                            100 * (m - round(m)), float(np.max(lv))))
    return out

if __name__ == "__main__":
    for v in (sys.argv[1:] or VIDEOS):
        L, R = load(v)
        for nm, x in (("MID", (L + R) / 2), ("SIDE", (L - R) / 2)):
            ns = notes(x)
            cents = np.array([n[4] for n in ns])
            pcs = {}
            for n in ns: pcs[n[3][:-1]] = pcs.get(n[3][:-1], 0) + n[1]
            print(f"== {v} {nm}: {len(ns)} stable lines >= {MIN_DUR}s; total dur {sum(n[1] for n in ns):.1f}s; "
                  f"median |cents off 12-TET| {np.median(np.abs(cents)):.1f} (random would be 25)")
            print("   pitch-class seconds:", {k: round(x, 1) for k, x in sorted(pcs.items(), key=lambda kv: -kv[1])})
            if "-v" in sys.argv or nm == "MID":
                for n in ns[:400]:
                    print(f"   {n[0]:6.2f}s {n[1]:.2f}s {n[2]:7.1f}Hz {n[3]:4s} {n[4]:+5.0f}c {n[5]:6.1f}dB")
