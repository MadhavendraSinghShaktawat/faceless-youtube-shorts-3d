"""Convert faster-whisper word output (_tmp/<v>.fw.json) into transcripts/<v>.json + .txt.
Re-run transcription first with tools/analysis/transcribe.py if _tmp was deleted."""
import json, os, re
from common import AN, TMP, VIDEOS

# manual corrections after checking against the burned-in captions: (video, index_or_word) -> word
FIX = {("mine-salting", "boat"): "bolt",      # spoken "bolt"; creator caption shows "bottles," (auto-caption error)
       ("pink-prison", "skittiest"): "skinniest"}

for v in VIDEOS:
    ws = json.load(open(os.path.join(TMP, v + ".fw.json")))
    for w in ws:
        k = (v, re.sub(r"\W", "", w["w"]).lower())
        if k in FIX:
            w["w"] = re.sub(r"\w+", FIX[k], w["w"], 1)
    sents, cur = [], []
    for w in ws:
        cur.append(w)
        if re.search(r"[.!?]$", w["w"]):
            sents.append(cur); cur = []
    if cur: sents.append(cur)
    out = {"video": v, "engine": "faster-whisper small.en, word_timestamps (cross-attention DTW, ~+-50-100 ms)",
           "words": [{"word": w["w"], "start": w["start"], "end": w["end"], "prob": w["p"]} for w in ws],
           "sentences": [{"start": s[0]["start"], "end": s[-1]["end"], "n_words": len(s),
                          "text": " ".join(w["w"] for w in s)} for s in sents]}
    os.makedirs(os.path.join(AN, "transcripts"), exist_ok=True)
    json.dump(out, open(os.path.join(AN, "transcripts", v + ".json"), "w"), indent=1)
    with open(os.path.join(AN, "transcripts", v + ".txt"), "w") as f:
        for s in out["sentences"]:
            f.write(f"[{s['start']:6.2f}-{s['end']:6.2f}] {s['text']}\n")
    print(v, len(ws), "words", len(sents), "sentences")
