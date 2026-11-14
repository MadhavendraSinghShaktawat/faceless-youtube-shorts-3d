"""Contact strips of video frames at each strong SFX candidate (>= voice-13 dB), for visual cross-checking.
3 frames per event: start-0.10 s, peak, peak+0.25 s. Output: reference/analysis/_tmp/sfxframes/<v>_<n>.jpg"""
import json, subprocess, sys
from PIL import Image, ImageDraw
from common import *
W, H = 126, 224
ev_all = json.load(open(os.path.join(AN, "sfx_candidates.json")))
out = os.path.join(TMP, "sfxframes"); os.makedirs(out, exist_ok=True)

def frame(v, t):
    p = os.path.join(out, "f.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, t):.3f}", "-i", os.path.join(ROOT, "reference", "source", v + ".mp4"),
                    "-frames:v", "1", "-vf", f"scale={W}:{H}", p])
    return Image.open(p).convert("RGB") if os.path.exists(p) else Image.new("RGB", (W, H))

for v in (sys.argv[1:] or VIDEOS):
    evs = [e for e in ev_all[v]["events"] if e["rel_voice_dB"] >= -13]
    merged = []
    for e in evs:
        if merged and e["t"] - (merged[-1]["t"] + merged[-1]["dur"]) < 0.35:
            m = merged[-1]; m["dur"] = round(e["t"] + e["dur"] - m["t"], 2)
            if e["peak_dBFS"] > m["peak_dBFS"]: m["peak_dBFS"], m["peak_t"] = e["peak_dBFS"], e["peak_t"]
        else: merged.append(dict(e))
    print(v, len(merged), "strong merged events")
    per = 24; cols = 6
    for k in range(0, len(merged), per):
        chunk = merged[k:k + per]
        rows = (len(chunk) + cols - 1) // cols
        im = Image.new("RGB", (cols * (3 * W + 8), rows * (H + 16)), "black"); d = ImageDraw.Draw(im)
        for i, e in enumerate(chunk):
            x, y = (i % cols) * (3 * W + 8), (i // cols) * (H + 16)
            for j, t in enumerate((e["t"] - 0.10, e["peak_t"], e["peak_t"] + 0.25)):
                im.paste(frame(v, t), (x + j * W, y + 16))
            d.text((x + 2, y + 2), f"{e['t']:.2f}s +{e['dur']:.2f} pk{e['peak_t']:.2f} {e['peak_dBFS']:.0f}dB", fill="yellow")
        im.save(os.path.join(out, f"{v}_{k // per}.jpg"), quality=80)
