"""Check every clip boundary in config.json against the real audio, not Whisper's word timings.

Whisper often ends the last word too early (and stretches the next word's start back over the gap),
so a cut placed "0.25s after the word" can still chop the end of the word. This measures loudness in
50ms windows around each clip start/end and flags any boundary that lands while he is still speaking.

usage: python check_cuts.py <source.mp4> <config.json>

Every WRN (speech resumes <=1.2s after an end cut) is transcribed automatically WITHOUT a prompt
(prompts make Whisper "hear" the words you expect). Read what is said across the cut:
  - same word continuing / stutter ("Qah ... Kaman" = qa'...qamat) -> extend the clip past it
  - a new sentence you deliberately skip -> may stay
Quiet consonants (a long "m") can dip below the silence threshold INSIDE a word, so a "gap" is not
proof the word ended. When in doubt, extend.
"""
import json
import subprocess
import os
import sys

import numpy as np

SR = 16000
WIN = 0.05          # 50 ms windows
SILENT = 0.12       # fraction of the local peak that counts as silence
NEED_TAIL = 0.20    # seconds of silence required after speech before an end cut
NEED_HEAD = 0.10    # seconds of silence required before speech at a start cut
RESUME = 1.2        # speech resuming this soon after an end cut = probably mid-sentence / stutter -> WARN


def rms(src, a, b):
    raw = subprocess.run(
        ["ffmpeg", "-v", "quiet", "-ss", f"{max(a, 0):.3f}", "-to", f"{b:.3f}", "-i", src,
         "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True,
    ).stdout
    x = np.frombuffer(raw, np.float32)
    w = int(SR * WIN)
    return np.array([np.sqrt((x[i:i + w] ** 2).mean()) for i in range(0, len(x) - w + 1, w)])


def check_end(src, t, next_start=None):
    a = t - 1.5
    r = rms(src, a, t + 2.5)
    loud = r > SILENT * r.max()
    i = int(round((t - a) / WIN))
    # last loud window at or before the cut, continuing forward while still loud
    j = i
    while j < len(loud) and loud[j]:
        j += 1
    speech_end = a + j * WIN
    quiet_before_cut = not loud[max(i - int(NEED_TAIL / WIN), 0):i].any()
    if loud[i - 1] or loud[min(i, len(loud) - 1)]:
        return False, f"cuts INTO speech; sound continues to {speech_end:.2f}s -> end at ~{speech_end + 0.25:.2f}"
    if not quiet_before_cut:
        last = a + (max(k for k in range(i) if loud[k]) + 1) * WIN
        return False, f"only {t - last:.2f}s after the last sound ({last:.2f}s) -> end at ~{last + 0.25:.2f}"
    nxt = next((k for k in range(i, len(loud)) if loud[k]), None)
    if nxt is not None and (nxt - i) * WIN <= RESUME:
        at = a + nxt * WIN
        if next_start is not None and t <= next_start <= at:
            return True, f"ok (jump cut: speech resumes at {at:.2f}s inside the next clip)"
        return None, (f"WARN speech resumes {at - t:.2f}s after the cut (at {at:.2f}s) - listen/re-transcribe: "
                      "a stutter ('qa'... qamat') or mid-sentence pause? Extend past it unless it is a new sentence you are skipping")
    return True, "ok"


_model = None


def transcribe(src, a, b):
    """Prompt-free transcription of [a, b] with word times (needs faster-whisper + CUDA DLLs)."""
    global _model
    try:
        if _model is None:
            sys.path.insert(0, os.environ.get("SUBTITLE_ENGINE_DIR", r"D:\subtitle engine"))
            from subtitle_engine.engine import setup_cuda_dlls
            setup_cuda_dlls()
            from faster_whisper import WhisperModel
            _model = WhisperModel("large-v3", device="cuda", compute_type="float16")
        raw = subprocess.run(["ffmpeg", "-v", "quiet", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src,
                              "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
        x = np.frombuffer(raw, np.float32)
        segs, _ = _model.transcribe(x, language="ms", beam_size=5, word_timestamps=True, vad_filter=False,
                                    condition_on_previous_text=False)
        return " ".join(f"{w.word.strip()}@{a + w.start:.2f}" for s in segs for w in s.words)
    except Exception as e:  # transcription is a helper; never block the audio check
        return f"(transcribe unavailable: {e})"


def check_start(src, t):
    a = t - 1.0
    r = rms(src, a, t + 1.0)
    loud = r > SILENT * r.max()
    i = int(round((t - a) / WIN))
    if loud[max(i - 1, 0)] and loud[min(i, len(loud) - 1)]:
        k = i
        while k > 0 and loud[k - 1]:
            k -= 1
        return False, f"starts MID-sound; it began at {a + k * WIN:.2f}s -> start at ~{a + k * WIN - 0.15:.2f}"
    return True, "ok"


def main():
    src, cfg = sys.argv[1], sys.argv[2]
    clips = json.load(open(cfg, encoding="utf-8"))["clips"]
    bad = 0
    for n, c in enumerate(clips):
        nxt_start = clips[n + 1]["start"] if n + 1 < len(clips) else None
        for kind, t, fn in (("start", c["start"], check_start), ("end", c["end"], check_end)):
            if kind == "start" and t <= 0.05:
                continue
            ok, msg = fn(src, t) if kind == "start" else fn(src, t, nxt_start)
            bad += ok is False
            warn = ok is None
            tag = "WRN" if warn else ("OK " if ok else "BAD")
            print(f"{tag} {c['id']:<12} {kind:<5} {t:8.2f}  {msg}")
            if warn:
                print(f"      heard across the cut: {transcribe(src, t - 1.5, t + 2.7)}")
    print("all boundaries clean (review any WRN lines)" if not bad else f"{bad} boundary problem(s) - fix config and re-run")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
