"""Transcribe a video with faster-whisper (Malay + Arabic) and write a subtitle-ready SRT."""
import os
import sys
import site

# Make pip-installed CUDA DLLs (cublas/cudnn) visible to CTranslate2 on Windows.
for base in site.getsitepackages() + [site.getusersitepackages()]:
    for sub in ("nvidia/cublas/bin", "nvidia/cudnn/bin"):
        p = os.path.join(base, sub)
        if os.path.isdir(p):
            os.add_dll_directory(p)
            os.environ["PATH"] = p + os.pathsep + os.environ["PATH"]

from faster_whisper import WhisperModel

MAX_CHARS = 42      # per subtitle line
MAX_DUR = 5.0       # seconds per subtitle
GAP_SPLIT = 0.6     # pause that forces a new subtitle

src, out = sys.argv[1], sys.argv[2]

try:
    model = WhisperModel("large-v3", device="cuda", compute_type="float16")
    device = "cuda"
except Exception as e:
    print("CUDA unavailable, falling back to CPU:", e)
    model = WhisperModel("large-v3", device="cpu", compute_type="int8")
    device = "cpu"

import subprocess
import numpy as np

# Decode with ffmpeg (16 kHz mono float32) to sidestep PyAV version issues.
raw = subprocess.run(
    ["ffmpeg", "-nostdin", "-i", src, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
    capture_output=True, check=True,
).stdout
audio = np.frombuffer(raw, dtype=np.float32)
print(f"Decoded {len(audio) / 16000:.1f}s of audio")

segments, info = model.transcribe(
    audio,
    language="ms",
    word_timestamps=True,
    vad_filter=True,
    beam_size=5,
    condition_on_previous_text=False,
    initial_prompt="Ceramah agama dalam Bahasa Melayu. Assalamualaikum, Allah, Rasulullah, "
                   "subhanallah, alhamdulillah, insyaAllah, Al-Quran, hadis, ustaz, dakwah.",
)

words = []
for seg in segments:
    for w in seg.words or []:
        words.append(w)
    print(f"[{seg.start:7.2f}] {seg.text.strip()}", flush=True)

# Group words into subtitle cues.
cues, cur = [], []
for w in words:
    if cur:
        text = "".join(x.word for x in cur + [w]).strip()
        if (len(text) > MAX_CHARS or w.end - cur[0].start > MAX_DUR
                or w.start - cur[-1].end > GAP_SPLIT):
            cues.append(cur)
            cur = []
    cur.append(w)
if cur:
    cues.append(cur)


def ts(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


with open(out, "w", encoding="utf-8") as f:
    for i, c in enumerate(cues, 1):
        start = c[0].start
        end = max(c[-1].end, start + 0.5)
        if i < len(cues):
            end = min(end, cues[i][0].start)  # no overlaps
        f.write(f"{i}\n{ts(start)} --> {ts(end)}\n{''.join(x.word for x in c).strip()}\n\n")

print(f"\nDone on {device}: {len(cues)} subtitles -> {out}")
