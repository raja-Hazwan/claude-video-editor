#!/usr/bin/env python3
"""Transcribe a clip with word-level timestamps, locally.

    python kit/transcribe.py <video> [--out file.json]

Writes <video dir>/<stem>.transcript.json ({words: [{word, start, end}], ...}, times in seconds from the start of
the video). Uses the local Subtitle Engine (Whisper tuned for Malay/Arabic, words_engine.py from
talk-to-vertical-short) in SUBTITLE_ENGINE_DIR (default "D:/subtitle engine"); nothing leaves the machine.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ENGINE = Path(os.environ.get('SUBTITLE_ENGINE_DIR', r'D:\subtitle engine'))
ENGINE_PY = ENGINE / '.venv' / 'Scripts' / 'python.exe'
WORDS_ENGINE = Path(__file__).resolve().parents[1] / 'skills' / 'talk-to-vertical-short' / 'scripts' / 'words_engine.py'


def duration(video):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                          '-of', 'default=nw=1:nk=1', str(video)]))


def transcribe(video, out=None):
    """local Subtitle Engine ({w,s,e}) -> {word,start,end}, the shape reel.py reads"""
    video = Path(video).resolve()
    out = Path(out) if out else video.with_name(video.stem + '.transcript.json')
    if not ENGINE_PY.exists() or not WORDS_ENGINE.exists():
        sys.exit(f'Subtitle Engine not found ({ENGINE_PY}). Set SUBTITLE_ENGINE_DIR; run python tools/doctor.py.')
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / 'words.json'
        subprocess.run([str(ENGINE_PY), str(WORDS_ENGINE), str(video), str(raw)], check=True)
        ws = json.loads(raw.read_text(encoding='utf-8'))
    words = [dict(word=w['w'], start=w['s'], end=w['e']) for w in ws]
    data = dict(text=' '.join(w['word'] for w in words), segments=[], words=words, duration=duration(video),
                model='subtitle-engine large-v3')
    out.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding='utf-8')
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--out')
    a = ap.parse_args()
    p = transcribe(a.video, a.out)
    d = json.loads(p.read_text(encoding='utf-8'))
    print(f'wrote {p}  ({len(d["words"])} words)')
