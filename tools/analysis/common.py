"""Shared helpers for the reference-audio analysis (numpy only)."""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
AN = os.path.join(ROOT, "reference", "analysis")
TMP = os.path.join(AN, "_tmp")
VIDEOS = ["pink-prison", "one-cart", "mine-salting"]
SR = 44100

def load(v):
    """Return (L, R) float arrays. Extracts the wav with ffmpeg if missing."""
    p = os.path.join(TMP, v + ".wav")
    if not os.path.exists(p):
        os.makedirs(TMP, exist_ok=True)
        src = os.path.join(ROOT, "reference", "source", v + ".mp4")
        os.system(f'ffmpeg -v error -y -i "{src}" -ac 2 -ar 44100 "{p}"')
    w = wave.open(p)
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2) / 32768.0
    return x[:, 0], x[:, 1]

def words(v):
    return json.load(open(os.path.join(AN, "transcripts", v + ".json")))["words"]

def stft(x, n=2048, hop=441):
    """Hann STFT magnitude. hop=441 -> 10 ms frames. Returns (mag[frames, bins], freqs)."""
    win = np.hanning(n)
    pad = np.concatenate([np.zeros(n // 2), x, np.zeros(n)])
    nfr = 1 + (len(x)) // hop
    idx = np.arange(n)[None, :] + hop * np.arange(nfr)[:, None]
    mag = np.abs(np.fft.rfft(pad[idx] * win, axis=1)) / (win.sum() / 2)
    return mag, np.fft.rfftfreq(n, 1 / SR)

def band_db(mag, freqs, lo, hi):
    """Per-frame level (dB re full-scale sine, approx) of the band lo..hi Hz."""
    m = (freqs >= lo) & (freqs < hi)
    # sum of power over bins; /1.5 corrects Hann noise bandwidth so sines read ~true
    return 10 * np.log10((mag[:, m] ** 2).sum(1) / 1.5 / 2 + 1e-14)

def db(a):
    return 10 * np.log10(np.mean(np.asarray(a) ** 2) + 1e-20)

def speech_mask(v, nfr, hop_s=0.01, pad=0.0):
    """Boolean per-frame mask: True where a transcribed word is sounding."""
    m = np.zeros(nfr, bool)
    for w in words(v):
        m[max(0, int((w["start"] - pad) / hop_s)):int((w["end"] + pad) / hop_s) + 1] = True
    return m

def load_stem(v, stem):
    """Demucs htdemucs two-stem output ('vocals' or 'no_vocals'); see separate.sh. Returns (L, R).
    NOTE: a separation is an estimate - voice residue / missing bed energy are possible."""
    w = wave.open(os.path.join(TMP, "demucs_out", "htdemucs", v, stem + ".wav"))
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2) / 32768.0
    return x[:, 0], x[:, 1]

def frame_db(x, hop=441, win=441):
    n = (len(x) - win) // hop + 1
    idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
    return 10 * np.log10((x[idx] ** 2).mean(1) + 1e-14)
