"""Re-transcribe each clip's exact audio range so captions match what is actually kept.

Whole-file Whisper timings drift by seconds in talks with long pauses or Arabic, so words land in the
removed gaps and vanish from the captions (or appear in the wrong clip). This transcribes every clip
range on its own (Subtitle Engine settings: Islamic-term prompt + config keywords, romanized Arabic,
user's auto-corrections) and writes a words.json containing only words inside the clips.

usage: <subtitle engine python> words_per_clip.py <source.mp4> <config.json> <out_words.json>
Read the printed text per clip and fix spellings in out_words.json before gen_data.
"""
import json
import subprocess
import os
import sys

import numpy as np

sys.path.insert(0, os.environ.get("SUBTITLE_ENGINE_DIR", r"D:\subtitle engine"))
from subtitle_engine.engine import setup_cuda_dlls  # noqa: E402

setup_cuda_dlls()
from faster_whisper import WhisperModel  # noqa: E402
from subtitle_engine.arabic import romanize_text  # noqa: E402
from subtitle_engine.vocabulary import Vocabulary, apply_corrections, build_prompt  # noqa: E402

src, cfg_path, out = sys.argv[1:4]
cfg = json.load(open(cfg_path, encoding="utf-8"))
vocab = Vocabulary.load()
prompt = build_prompt(vocab.custom_words + cfg.get("keywords", []))
model = WhisperModel("large-v3", device="cuda", compute_type="float16")

words = []
for c in cfg["clips"]:
    a, b = c["start"], c["end"]
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src,
                          "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    segs, _ = model.transcribe(x, language="ms", beam_size=5, word_timestamps=True, vad_filter=False,
                               condition_on_previous_text=False, initial_prompt=prompt)
    part = []
    for s in segs:
        for w in s.words or []:
            t = apply_corrections(romanize_text(w.word), vocab.corrections).strip()
            if t:
                # clamp inside the clip so gen_data never drops an edge word
                part.append({"w": t, "s": round(max(a + w.start, a + 0.02), 3), "e": round(min(a + w.end, b), 3)})
    words += part
    print(f"{c['id']:<12} {a:7.2f}-{b:7.2f}  " + " ".join(w["w"] for w in part))

json.dump(words, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
