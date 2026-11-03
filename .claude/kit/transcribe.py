#!/usr/bin/env python3
"""Transcribe a clip with word-level timestamps.

    python kit/transcribe.py <video> [--out file.json] [--language en] [--groq]

Writes <video dir>/<stem>.transcript.json ({words: [{word, start, end}], ...}, times in seconds from the start of
the video).
This repo: uses the local Subtitle Engine (Whisper tuned for Malay/Arabic, words_engine.py from
talk-to-vertical-short) when SUBTITLE_ENGINE_DIR (default "D:/subtitle engine") has its .venv; nothing leaves the machine.
Fallback / --groq: Groq Whisper, needs GROQ_API_KEY. Long videos are sent in 10-minute chunks.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

MODEL = 'whisper-large-v3'
CHUNK = 600
# a messy priming prompt keeps Whisper verbatim (repeats and fillers stay, so the word times stay honest)
PROMPT = 'Um, so, uh, the the thing is, wait, okay. So, like, verbatim.'


def duration(video):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                          '-of', 'default=nw=1:nk=1', str(video)]))


def audio(video, dst, start, dur):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-i', str(video), '-t', str(dur),
                    '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'flac', str(dst)], check=True)


def call(client, path, language):
    kw = dict(file=(path.name, path.read_bytes()), model=MODEL, response_format='verbose_json',
              timestamp_granularities=['word', 'segment'], temperature=0.0, prompt=PROMPT)
    if language:
        kw['language'] = language
    r = client.audio.transcriptions.create(**kw)
    return r.model_dump() if hasattr(r, 'model_dump') else dict(r)


ENGINE = Path(os.environ.get('SUBTITLE_ENGINE_DIR', r'D:\subtitle engine'))
ENGINE_PY = ENGINE / '.venv' / 'Scripts' / 'python.exe'
WORDS_ENGINE = Path(__file__).resolve().parents[1] / 'skills' / 'talk-to-vertical-short' / 'scripts' / 'words_engine.py'


def transcribe_local(video, out):
    """local Subtitle Engine -> the same shape as Groq's output ({w,s,e} -> {word,start,end})"""
    video = Path(video).resolve()
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / 'words.json'
        subprocess.run([str(ENGINE_PY), str(WORDS_ENGINE), str(video), str(raw)], check=True)
        ws = json.loads(raw.read_text(encoding='utf-8'))
    words = [dict(word=w['w'], start=w['s'], end=w['e']) for w in ws]
    data = dict(text=' '.join(w['word'] for w in words), segments=[], words=words, duration=duration(video),
                model='subtitle-engine large-v3')
    Path(out).write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding='utf-8')
    return Path(out)


def transcribe(video, out=None, language=None, groq=False):
    out = Path(out) if out else Path(video).resolve().with_name(Path(video).stem + '.transcript.json')
    if not groq and ENGINE_PY.exists() and WORDS_ENGINE.exists():
        return transcribe_local(video, out)
    from groq import Groq
    if not os.environ.get('GROQ_API_KEY'):
        sys.exit('GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys and export it.')
    video = Path(video).resolve()
    out = Path(out) if out else video.with_name(video.stem + '.transcript.json')
    client = Groq()
    total = duration(video)
    words, segments, text = [], [], []
    with tempfile.TemporaryDirectory() as tmp:
        t = 0.0
        while t < total - 0.05:
            dur = min(CHUNK, total - t)
            a = Path(tmp) / f'chunk{int(t)}.flac'
            audio(video, a, t, dur)
            r = call(client, a, language)
            for w in r.get('words') or []:
                words.append(dict(word=w['word'], start=round(w['start'] + t, 3), end=round(w['end'] + t, 3)))
            for s in r.get('segments') or []:
                segments.append(dict(start=round(s['start'] + t, 3), end=round(s['end'] + t, 3), text=s['text']))
            text.append(r.get('text', ''))
            t += dur
    data = dict(text=' '.join(x.strip() for x in text), segments=segments, words=words, duration=total, model=MODEL)
    out.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding='utf-8')
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--out')
    ap.add_argument('--language')
    ap.add_argument('--groq', action='store_true')
    a = ap.parse_args()
    p = transcribe(a.video, a.out, a.language, a.groq)
    d = json.loads(p.read_text(encoding='utf-8'))
    print(f'wrote {p}  ({len(d["words"])} words)')
    for s in d['segments']:  # empty for the local engine (it prints its own lines)
        print(f'{s["start"]:7.2f}-{s["end"]:7.2f}  {s["text"].strip()}')
