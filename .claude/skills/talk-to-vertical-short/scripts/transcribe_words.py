"""Word-level transcription with faster-whisper.
Usage: python transcribe_words.py <video> <words.json> [lang=ms] ["initial prompt"]"""
import os, sys, site, json, subprocess
import numpy as np
for base in site.getsitepackages() + [site.getusersitepackages()]:
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        p = os.path.join(base, sub)
        if os.path.isdir(p):
            os.add_dll_directory(p); os.environ["PATH"] = p + os.pathsep + os.environ["PATH"]
from faster_whisper import WhisperModel

src, out = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else "ms"
prompt = sys.argv[4] if len(sys.argv) > 4 else "Ceramah agama dalam Bahasa Melayu. Nabi, hadis, Allah, Rasulullah."
try:
    model = WhisperModel("large-v3", device="cuda", compute_type="float16")
except Exception as e:
    print("CUDA unavailable, CPU fallback:", e)
    model = WhisperModel("large-v3", device="cpu", compute_type="int8")
raw = subprocess.run(["ffmpeg", "-nostdin", "-i", src, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
segs, _ = model.transcribe(np.frombuffer(raw, dtype=np.float32), language=lang, word_timestamps=True,
                           vad_filter=True, beam_size=5, condition_on_previous_text=False, initial_prompt=prompt)
words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in (s.words or [])]
json.dump(words, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)

# Print readable lines with timings, for choosing highlights
line = []
for x in words + [None]:
    if line and (x is None or x["s"] - line[-1]["e"] > 0.5 or len(line) >= 9):
        print(f"{line[0]['s']:7.2f}-{line[-1]['e']:7.2f} " + " ".join(y["w"] for y in line)); line = []
    if x: line.append(x)
