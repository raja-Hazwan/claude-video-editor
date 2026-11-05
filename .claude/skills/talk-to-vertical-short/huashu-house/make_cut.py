"""Cut the approved clips (in output order, hook first) on the 30 fps grid and write everything the huashu film
and the Remotion plate need, so picture, voice and captions stay frame-exact to the end.

    python make_cut.py <remotion project> <huashu project> <order.json>

<remotion project>/scripts/config.json  clip ranges (after split_pauses + check_cuts)
<remotion project>/scripts/words.json   corrected word timings ({"w","s","e"})
<order.json>                            clip ids in OUTPUT order, e.g. the hook clip(s) first
Writes:
  <huashu>/assets/voice.wav     his voice, the parts back to back
  <huashu>/assets/cues.json     words with times on the new timeline (+ the part each belongs to)
  <huashu>/assets/parts.json    each part's start/end on the new timeline
  <remotion>/src/data/plate.json [id, frames] for the TrackedPlate composition (src/Plate.tsx)
"""
import json, os, subprocess, sys

remo, hua, order_file = sys.argv[1:4]
cfg = {c["id"]: c for c in json.load(open(os.path.join(remo, "scripts/config.json"), encoding="utf-8"))["clips"]}
words = json.load(open(os.path.join(remo, "scripts/words.json"), encoding="utf-8"))
order = json.load(open(order_file, encoding="utf-8"))
snap = lambda x: round(x * 30) / 30

cues, parts, plate, f, t0 = [], [], [], [], 0.0
n = len(order)
f.append("[0:a]asplit=" + str(n) + "".join(f"[r{i}]" for i in range(n)))
for i, pid in enumerate(order):
    a, b = snap(cfg[pid]["start"]), snap(cfg[pid]["end"])   # no end-card extend: huashu holds the last frame
    d = b - a
    f.append(f"[r{i}]atrim={a:.6f}:{b:.6f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={d - 0.03:.3f}:d=0.03[a{i}]")
    parts.append({"id": pid, "start": round(t0, 4), "end": round(t0 + d, 4)})
    plate.append([pid, round(d * 30)])
    for w in words:
        if a - 0.02 <= w["s"] < b:
            cues.append({"word": w["w"].strip(), "start": round(max(w["s"], a) - a + t0, 3),
                         "end": round(min(w["e"], b) - a + t0, 3), "part": pid})
    t0 += d
f.append("".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1[a]")
os.makedirs(os.path.join(hua, "assets"), exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(remo, "public/source.mp4"), "-filter_complex", ";".join(f),
                "-map", "[a]", "-ar", "48000", os.path.join(hua, "assets/voice.wav")], check=True)
json.dump({"words": cues, "duration": round(t0, 3)}, open(os.path.join(hua, "assets/cues.json"), "w", encoding="utf-8"), ensure_ascii=False)
json.dump(parts, open(os.path.join(hua, "assets/parts.json"), "w"), indent=0)
json.dump(plate, open(os.path.join(remo, "src/data/plate.json"), "w"))
print(f"{n} parts, {t0:.2f} s, {len(cues)} words")
