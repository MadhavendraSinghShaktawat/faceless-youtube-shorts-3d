"""Word-level transcription. Needs faster-whisper (pip install faster-whisper) - run with a venv python.
Writes reference/analysis/_tmp/<v>.fw.json; then run make_transcripts.py."""
import json, os
from faster_whisper import WhisperModel
from common import ROOT, TMP, VIDEOS
m = WhisperModel("small.en", device="cpu", compute_type="int8", download_root=os.path.join(TMP, "hf"))
for v in VIDEOS:
    wav = os.path.join(TMP, v + ".16k.wav")
    if not os.path.exists(wav):
        os.system(f'ffmpeg -v error -y -i "{ROOT}/reference/source/{v}.mp4" -ac 1 -ar 16000 "{wav}"')
    segs, _ = m.transcribe(wav, word_timestamps=True, beam_size=5)
    out = [dict(w=w.word.strip(), start=round(w.start, 3), end=round(w.end, 3), p=round(w.probability, 3))
           for s in segs for w in s.words]
    json.dump(out, open(os.path.join(TMP, v + ".fw.json"), "w"))
    print(v, len(out))
