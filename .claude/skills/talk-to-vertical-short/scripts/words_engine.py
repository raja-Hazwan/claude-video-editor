"""Word timings using the Subtitle Engine's tuned settings (prompt terms, VAD, romanized Arabic, corrections)."""
import json, os, sys
sys.path.insert(0, os.environ.get("SUBTITLE_ENGINE_DIR", r"D:\subtitle engine"))
from subtitle_engine.engine import setup_cuda_dlls
setup_cuda_dlls()
from faster_whisper import WhisperModel
from subtitle_engine.engine import LANGUAGE, VAD_PARAMETERS, extract_audio
from subtitle_engine.arabic import romanize_text
from subtitle_engine.vocabulary import Vocabulary, apply_corrections, build_prompt

src, out = sys.argv[1], sys.argv[2]
vocab = Vocabulary.load()
model = WhisperModel("large-v3", device="cuda", compute_type="float16")
segs, _ = model.transcribe(extract_audio(src), language=LANGUAGE, word_timestamps=True, vad_filter=True,
                           vad_parameters=VAD_PARAMETERS, beam_size=5, condition_on_previous_text=False,
                           initial_prompt=build_prompt(vocab.custom_words))
words = []
for s in segs:
    for w in s.words or []:
        words.append({"w": apply_corrections(romanize_text(w.word), vocab.corrections).strip(),
                      "s": round(w.start, 3), "e": round(w.end, 3)})
json.dump(words, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
line = []
for x in words + [None]:
    if line and (x is None or x["s"] - line[-1]["e"] > 0.5 or len(line) >= 9):
        print(f"{line[0]['s']:7.2f}-{line[-1]['e']:7.2f} " + " ".join(y["w"] for y in line)); line = []
    if x: line.append(x)
