"""Split coarse clips at real pauses so dead air becomes jump cuts.

Reads a config whose clips are coarse "keep" ranges, measures loudness in the source, and splits each
clip wherever a silence of >= MIN_GAP seconds lies inside it. Parts after the first get ids
"<id>_2", "<id>_3", ... — treat ids ending in _<n> as jump cuts (no flash) in the composition.
Each part keeps the clip's punchWords/zoom settings; `extend` stays on the last part only.

usage: python split_pauses.py <source.mp4> <coarse_config.json> <out_config.json> [min_gap=1.0]
Then ALWAYS run check_cuts.py on the output.
"""
import json
import subprocess
import sys

import numpy as np

SR, WIN, SILENT = 16000, 0.05, 0.12
PAD_END, PAD_START = 0.25, 0.15


def silences(src, a, b, min_gap):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src,
                          "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    w = int(SR * WIN)
    r = np.array([np.sqrt((x[i:i + w] ** 2).mean()) for i in range(0, len(x) - w + 1, w)])
    quiet = r < SILENT * np.percentile(r, 99)
    out, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            s, e = a + i * WIN, a + j * WIN
            if e - s >= min_gap and s > a + 0.3 and e < b - 0.3:  # only gaps strictly inside the clip
                out.append((s, e))
            i = j
        else:
            i += 1
    return out


def main():
    src, cfg_in, cfg_out = sys.argv[1:4]
    min_gap = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
    cfg = json.load(open(cfg_in, encoding="utf-8"))
    clips = []
    for c in cfg["clips"]:
        gaps = silences(src, c["start"], c["end"], min_gap)
        bounds, s = [], c["start"]
        for g0, g1 in gaps:
            bounds.append((s, round(g0 + PAD_END, 2)))
            s = round(g1 - PAD_START, 2)
        bounds.append((s, c["end"]))
        for k, (a, b) in enumerate(bounds):
            part = {kk: v for kk, v in c.items() if kk not in ("start", "end", "extend")}
            part.update(id=c["id"] if k == 0 else f"{c['id']}_{k + 1}", start=a, end=b)
            if k == len(bounds) - 1 and "extend" in c:
                part["extend"] = c["extend"]
            clips.append(part)
        removed = sum(g1 - g0 - PAD_END - PAD_START for g0, g1 in gaps)
        print(f"{c['id']:<10} {len(bounds)} part(s), removed {removed:4.1f}s of pauses")
    cfg["clips"] = clips
    json.dump(cfg, open(cfg_out, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print("total", round(sum(c["end"] - c["start"] + c.get("extend", 0) for c in clips), 1), "s")


if __name__ == "__main__":
    main()
