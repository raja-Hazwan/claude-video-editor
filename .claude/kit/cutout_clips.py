#!/usr/bin/env python3
"""Speaker cut-outs for every clip of a Remotion project, for a look that puts graphics behind the
speaker (`WideCut cutout` in looks/core.tsx).

    python .claude/kit/cutout_clips.py <project dir> [--crop X,W,H] [--model mobilenetv3|resnet50]

For each clip in scripts/config.json it cuts the source's crop region (the same X,W,H the project's WideFrame uses,
default 500,771,1040) for that clip's time range at 30 fps, and writes public/cutout/<clip id>.webm (VP9 with alpha,
frame for frame with the crop). Cached: a clip is redone only when its times or the crop change.
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cutout import cutout  # noqa: E402


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    ap = argparse.ArgumentParser()
    ap.add_argument('project')
    ap.add_argument('--crop', default='500,771,1040')
    ap.add_argument('--model', default='mobilenetv3')
    a = ap.parse_args()
    proj = Path(a.project).resolve()
    x, w, h = (int(v) for v in a.crop.split(','))
    src = proj / 'public' / 'source.mp4'
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                         '-of', 'default=nw=1:nk=1', str(src)]))
    out_dir = proj / 'public' / 'cutout'
    out_dir.mkdir(parents=True, exist_ok=True)
    for c in json.loads((proj / 'scripts' / 'config.json').read_text(encoding='utf-8'))['clips']:
        start, end = c['start'], min(c['end'] + c.get('extend', 0), dur)
        out, stamp = out_dir / f"{c['id']}.webm", out_dir / f"{c['id']}.key"
        key = json.dumps([start, end, x, w, h, a.model])
        if out.exists() and stamp.exists() and stamp.read_text(encoding='utf-8') == key:
            print(f"{c['id']}: cached")
            continue
        with tempfile.TemporaryDirectory() as tmp:
            crop = Path(tmp) / 'crop.mp4'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.3f}', '-i', str(src), '-t', f'{end - start:.3f}',
                            '-vf', f'crop={w}:{h}:{x}:0,fps=30', '-an', '-c:v', 'libx264', '-crf', '12', '-preset', 'fast',
                            str(crop)], check=True)
            cutout(crop, out, a.model)
        stamp.write_text(key, encoding='utf-8')
        print(f"{c['id']}: {end - start:.2f}s -> {out.name}", flush=True)


if __name__ == '__main__':
    main()
