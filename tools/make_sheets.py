#!/usr/bin/env python3
"""Build timestamped contact sheets + JSON metadata from a video.

Usage:
  make_sheets.py <video> <out_dir> [--fps 10] [--cols 4] [--rows 5]
                 [--tile-w 270] [--start 0] [--end DUR] [--prefix sheet]

Needs: ffmpeg, ffprobe, Pillow (pip install pillow).
Every tile has its timestamp + source frame number burned in (top-left).
Every sheet gets a sidecar <sheet>.json, and out_dir gets <prefix>_index.json,
so a future reader knows exactly which sheet covers which seconds
without opening any image.
"""
import argparse, json, os, shutil, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

def probe(v):
    o = subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0",
        "-show_entries","stream=width,height,r_frame_rate:format=duration","-of","json",v])
    j = json.loads(o); s = j["streams"][0]
    n, d = s["r_frame_rate"].split("/")
    return s["width"], s["height"], float(n)/float(d), float(j["format"]["duration"])

def font(size):
    for p in ("/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/Helvetica.ttc",
              "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
              "C:/Windows/Fonts/consola.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("out")
    ap.add_argument("--fps", type=float, default=10)
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--rows", type=int, default=5)
    ap.add_argument("--tile-w", type=int, default=270)
    ap.add_argument("--start", type=float, default=0)
    ap.add_argument("--end", type=float, default=None)
    ap.add_argument("--prefix", default="sheet")
    a = ap.parse_args()
    w, h, src_fps, dur = probe(a.video)
    end = min(a.end, dur) if a.end else dur
    os.makedirs(a.out, exist_ok=True)
    per = a.cols * a.rows
    tw = a.tile_w; th = int(round(tw * h / w / 2) * 2)
    tmp = tempfile.mkdtemp(prefix="sheets_")
    try:
        subprocess.check_call(["ffmpeg","-v","error","-y","-ss",str(a.start),"-to",str(end),
            "-i",a.video,"-vf",f"fps={a.fps},scale={tw}:{th}","-q:v","2",os.path.join(tmp,"f_%06d.jpg")])
        frames = sorted(os.listdir(tmp))
        f = font(max(11, tw // 17)); pad = 4
        sheets = []
        n_sheets = (len(frames) + per - 1) // per
        for i in range(n_sheets):
            chunk = frames[i*per:(i+1)*per]
            sheet = Image.new("RGB", (a.cols*(tw+pad)+pad, a.rows*(th+pad)+pad), (32,32,32))
            d = ImageDraw.Draw(sheet); tiles = []
            for k, name in enumerate(chunk):
                idx = i*per + k
                t = a.start + idx / a.fps
                sf = int(round(t * src_fps))
                x = pad + (k % a.cols)*(tw+pad); y = pad + (k // a.cols)*(th+pad)
                sheet.paste(Image.open(os.path.join(tmp, name)), (x, y))
                label = f"{t:06.2f}s f{sf}"
                bb = d.textbbox((x+3, y+2), label, font=f)
                d.rectangle((bb[0]-3, bb[1]-2, bb[2]+3, bb[3]+2), fill=(0,0,0))
                d.text((x+3, y+2), label, font=f, fill=(255,255,0))
                tiles.append({"tile": k, "row": k // a.cols, "col": k % a.cols, "t": round(t,3), "src_frame": sf})
            fn = f"{a.prefix}_{i+1:03d}.jpg"
            sheet.save(os.path.join(a.out, fn), quality=88)
            meta = {"file": fn, "video": os.path.basename(a.video), "sheet_index": i+1, "sheet_count": n_sheets,
                    "t_start": tiles[0]["t"], "t_end": round(tiles[-1]["t"] + 1/a.fps, 3),
                    "sample_fps": a.fps, "source_fps": src_fps, "source_size": [w, h],
                    "grid": {"cols": a.cols, "rows": a.rows, "order": "left-to-right, top-to-bottom"},
                    "tile_size": [tw, th], "tiles": tiles}
            json.dump(meta, open(os.path.join(a.out, fn[:-4] + ".json"), "w"), indent=1)
            sheets.append({"file": fn, "t_start": meta["t_start"], "t_end": meta["t_end"], "frames": len(tiles)})
        json.dump({"video": os.path.basename(a.video), "duration": dur, "source_fps": src_fps,
                   "source_size": [w, h], "sample_fps": a.fps, "range": [a.start, end], "grid": [a.cols, a.rows],
                   "how_to_read": "Each tile has burned-in time (s) + source frame number. Order is left-to-right, top-to-bottom. Use t_start/t_end to pick the sheet for a moment.",
                   "sheets": sheets}, open(os.path.join(a.out, f"{a.prefix}_index.json"), "w"), indent=1)
        print(f"{len(sheets)} sheets -> {a.out}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
main()
