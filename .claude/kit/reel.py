#!/usr/bin/env python3
"""Shared helpers for the reel looks (Remotion; see talk-to-vertical-short "Reel looks"):

    python .claude/kit/reel.py words <video> [--start S] [--end E] [--transcript T]   # words per sentence + when it ends
    python .claude/kit/reel.py frame <video> <t> <out.jpg>     # one 9:16 frame with a y ruler (find eyes and chin)
    python .claude/kit/reel.py sheet <video.mp4> <out.jpg> [n] # contact sheet with the Instagram safe zones tinted red

Transcription is local (transcribe.py -> the Subtitle Engine). Cut-outs: cutout_clips.py.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

KIT = Path(__file__).resolve().parent
FPS = 30
W, H = 1080, 1920
SAFE_TOP, SAFE_BOTTOM, SAFE_SIDE = 220, 1500, 100      # Instagram covers the top ~220 px and the bottom ~420 px
FRAME_VF = f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1'


def run(cmd, **kw):
    return subprocess.run([str(c) for c in cmd], check=True, **kw)


def duration(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                          '-of', 'default=nw=1:nk=1', str(path)]))


def bare(w):
    """a word as captions show it: lowercase, no punctuation (numbers keep their commas)"""
    keep = ''.join(c for c in w.lower() if c.isalnum() or c in "'’,-").strip('-')
    return keep.replace(',', '') if not keep.replace(',', '').isdigit() else keep


def load_words(video, start, end, transcript=None):
    """[(word, local_start, local_end)] for the words said between start and end"""
    tp = transcript or Path(video).with_name(Path(video).stem + '.transcript.json')
    if not Path(tp).exists():
        sys.path.insert(0, str(KIT))
        from transcribe import transcribe
        print('transcribing (one time)...', flush=True)
        transcribe(video, tp)
    d = json.loads(Path(tp).read_text(encoding='utf-8'))
    ws = d.get('words') or [w for s in d.get('segments', []) for w in s.get('words', [])]
    # Whisper sometimes starts a sentence's first word before the last word of the previous one has ended
    # ("this.@7.02-7.44 For@6.90"): push such starts to the previous end so words stay in order
    fixed, prev_end = [], 0.0
    for w in ws:
        st = max(float(w['start']), prev_end)
        en = max(float(w['end']), st + 0.05)
        fixed.append((w['word'].strip(), st, en))
        prev_end = en
    out = []
    for w, st, en in fixed:
        if start - 0.05 <= st < end - 0.08:
            out.append((w, round(max(st, start) - start, 3), round(min(en, end) - start, 3)))
    return out


def frame(video, t, out):
    """one 9:16 frame with a ruler every 100 px (1080x1920 coordinates) to read where the eyes and chin are"""
    from PIL import Image, ImageDraw, ImageFont
    tmp = Path(out).with_suffix('.raw.png')
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1', '-vf', FRAME_VF, tmp])
    im = Image.open(tmp).convert('RGB')
    d = ImageDraw.Draw(im)
    try:
        font = ImageFont.load_default(size=40)
    except TypeError:
        font = ImageFont.load_default()
    for y in range(100, H, 100):
        d.line((0, y, W if y % 500 == 0 else 70, y), fill=(255, 40, 40), width=3 if y % 500 else 4)
        d.text((80, y - 22), str(y), fill=(255, 40, 40), font=font, stroke_width=3, stroke_fill=(0, 0, 0))
    im.resize((540, 960)).save(out, quality=90)
    tmp.unlink()


def sheet(video, out, n=8):
    """contact sheet of a finished video; the parts Instagram covers are tinted red"""
    from PIL import Image, ImageDraw
    d = duration(video)
    tw, th = 270, 480
    im = Image.new('RGB', (tw * n, th + 30), 'black')
    dr = ImageDraw.Draw(im)
    tmp = Path(out).with_suffix('.f.png')
    for i in range(n):
        t = d * (i + 0.5) / n
        run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1', '-vf', f'scale={tw}:{th}', tmp])
        f = Image.open(tmp).convert('RGBA')
        ov = Image.new('RGBA', f.size, (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        k = tw / W
        for box in ((0, 0, tw, SAFE_TOP * k), (0, SAFE_BOTTOM * k, tw, th), (0, 0, SAFE_SIDE * k, th), (tw - SAFE_SIDE * k, 0, tw, th)):
            od.rectangle(box, fill=(255, 0, 0, 46))
        im.paste(Image.alpha_composite(f, ov).convert('RGB'), (i * tw, 30))
        dr.text((i * tw + 6, 8), f'{t:.2f}s', fill=(255, 220, 0))
    im.save(out, quality=88)
    tmp.unlink()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest='cmd', required=True)
    a = sp.add_parser('words')
    a.add_argument('video')
    a.add_argument('--start', type=float, default=0)
    a.add_argument('--end', type=float)
    a.add_argument('--transcript')
    b = sp.add_parser('frame')
    b.add_argument('video')
    b.add_argument('t', type=float)
    b.add_argument('out')
    s = sp.add_parser('sheet')
    s.add_argument('video')
    s.add_argument('out')
    s.add_argument('n', type=int, nargs='?', default=8)
    x = ap.parse_args()
    if x.cmd == 'words':
        end = x.end or duration(x.video)
        ws = load_words(x.video, x.start, end, x.transcript)
        # one sentence per line; times are local to --start; [ends] is when the sentence's last word ends,
        # so start + that is a clean "end" for a spec
        line = []
        for w, t, e in ws:
            line.append(f'{w}@{t:.2f}')
            if w.endswith(('.', '?', '!')):
                print(' '.join(line) + f'   [ends {e:.2f}]')
                line = []
        if line:
            print(' '.join(line) + f'   [ends {ws[-1][2]:.2f}]')
    elif x.cmd == 'frame':
        frame(x.video, x.t, x.out)
        print('wrote', x.out)
    else:
        sheet(x.video, x.out, x.n)
        print('wrote', x.out)


if __name__ == '__main__':
    main()


if __name__ == '__main__':
    main()
