"""Build src/data/clips.ts (crop path + camera move + word captions per clip).
Usage: python gen_data.py <config.json> <track.json> <words.json> <out clips.ts>

Per clip in config.json (house style: video-style skill):
  framing  "lock" (default) = crop fixed on his median position (per source shot), or "track" = gently follow the face.
           A locked clip falls back to "track" when the face would leave the frame (printed as LOCK->TRACK).
  move     "pushIn" | "pullOut" | "zoomIn" | "zoomOut" | "none"; missing = rotate pushIn, zoomIn, pullOut, zoomOut.
  punchWords  emphasis zoom on the first match only (one per clip)."""
import json, sys, re
import numpy as np

cfg = json.load(open(sys.argv[1], encoding="utf-8"))
track = {c["id"]: c for c in json.load(open(sys.argv[2]))}
words = json.load(open(sys.argv[3], encoding="utf-8"))
out = sys.argv[4]
FPS = 30
KEYWORDS = {k.lower() for k in cfg.get("keywords", [])}
MERGE = {k.lower(): v for k, v in cfg.get("merge", {"what aboutism": "whataboutism"}).items()}


MOVES = ["pushIn", "zoomIn", "pullOut", "zoomOut"]
VIS_W = (1080 / 1920) * (1080 / 1920)  # visible source width at zoom 1.0 (fraction of 1920)
MAX_ZOOM = 1.16                          # worst case: zoomFloor x (move + emphasis punch)


def smooth(vals, cuts, k=41):
    v = np.array(vals, dtype=float); res = np.copy(v)
    bounds = [0] + cuts + [len(v)]
    for a, b in zip(bounds[:-1], bounds[1:]):
        seg = v[a:b]
        if len(seg) == 0: continue
        med = np.array([np.median(seg[max(0, i - 6):i + 7]) for i in range(len(seg))])
        pad = np.pad(med, (k // 2, k // 2), mode="edge")
        res[a:b] = np.convolve(pad, np.ones(k) / k, mode="valid")[:len(seg)]
    return res


def clean(rows, key):
    xs = [r[key] if (r[key] is not None and r["fw"] >= 0.11) else None for r in rows]
    good = [x for x in xs if x is not None]
    for i, x in enumerate(xs):  # drop false detections far from the local median
        if x is None: continue
        win = [y for y in xs[max(0, i - 15):i + 16] if y is not None]
        if abs(x - np.median(win)) > 0.1: xs[i] = None
    idx = [i for i, x in enumerate(xs) if x is not None]
    if idx: return list(np.interp(range(len(xs)), idx, [xs[i] for i in idx]))
    return [np.median(good) if good else 0.5] * len(xs)


def lock(vals, cuts):
    """Hold one position per source shot (the median), so the crop never slides."""
    v = np.array(vals, dtype=float); res = np.copy(v)
    bounds = [0] + cuts + [len(v)]
    for a, b in zip(bounds[:-1], bounds[1:]):
        if b > a: res[a:b] = np.median(v[a:b])
    return res


def leaves_frame(fx, locked, zoom_floor):
    """True when, with the crop locked, the face centre drifts out of the middle 60% of the visible window
    (98th percentile, so a stray detection doesn't count)."""
    allowed = 0.3 * VIS_W / (zoom_floor * MAX_ZOOM)
    return float(np.percentile(np.abs(np.array(fx) - np.array(locked)), 98)) > allowed


clips = []
for n, c in enumerate(cfg["clips"]):
    cid, start = c["id"], c["start"]
    rows = track[cid]["rows"]
    cap_end = c["end"]
    frames = int(round((c["end"] - start + c.get("extend", 0)) * FPS))
    cuts = []
    for i, r in enumerate(rows):
        if r["d"] > 8 and (not cuts or i - cuts[-1] > 5): cuts.append(i)
    fx, fy = clean(rows, "fx"), clean(rows, "fy")
    framing = c.get("framing", "lock")
    if framing == "lock":
        cx, cy = lock(fx, cuts), lock(fy, cuts)
        if leaves_frame(fx, cx, c.get("zoomFloor", 1.0)):
            framing = "track"
            print(f"LOCK->TRACK {cid}: face would leave the locked frame")
    if framing == "track":
        cx, cy = smooth(fx, cuts), smooth(fy, cuts)
    move = c.get("move", MOVES[n % len(MOVES)])
    cx = list(cx) + [cx[-1]] * max(0, frames - len(cx))
    cy = list(cy) + [cy[-1]] * max(0, frames - len(cy))

    # merge whisper sub-tokens ("imma" + "'ah", "pelik" + "-pelik", "what" + "aboutism")
    merged = []
    for w in (w for w in words if start - 0.05 <= w["s"] < cap_end):
        t = w["w"]
        pair = f"{merged[-1]['w']} {t}".lower() if merged else ""
        if merged and pair in MERGE:
            merged[-1]["w"], merged[-1]["e"] = MERGE[pair], w["e"]
        elif merged and (t.startswith("'") or t.startswith("-")):
            merged[-1]["w"] += t; merged[-1]["e"] = w["e"]
        else:
            merged.append(dict(w))
    caps, punches = [], []
    punch_words = {p.lower() for p in c.get("punchWords", [])}
    for w in merged:
        bare = re.sub(r"[^\w']", "", w["w"].lower())
        s_ms, e_ms = int(round((w["s"] - start) * 1000)), int(round((w["e"] - start) * 1000))
        caps.append({"text": " " + w["w"], "startMs": max(0, s_ms), "endMs": e_ms,
                     "timestampMs": max(0, s_ms), "confidence": None, "key": bare in KEYWORDS})
        f = int(round((w["s"] - start) * FPS))
        if bare in punch_words and not punches:  # emphasis only: one per clip
            punches.append(f)
    clips.append({"id": cid, "startSec": start, "frames": frames, "zoomFloor": c.get("zoomFloor", 1.0),
                  "maxBottom": c.get("maxBottom", 1.0), "framing": framing, "move": move,
                  "cx": [round(x, 4) for x in cx[:frames]], "cy": [round(y, 4) for y in cy[:frames]],
                  "punches": punches, "words": caps})

# Print a timeline cheat-sheet for hardcoding Sequence frames
t = 0
for c in clips:
    print(f"{c['id']:10s} starts @ {t:5d}  frames {c['frames']:4d}  {c['framing']:5s} {c['move']:7s} punch(local) {c['punches']}")
    print("   " + " ".join(f"{w['text'].strip()}@{t + round(w['startMs'] * FPS / 1000)}" for w in c["words"]))
    t += c["frames"]
print("TOTAL_FRAMES", t)

with open(out, "w", encoding="utf-8") as f:
    f.write("// Generated by gen_data.py — framing (lock/track), camera move + word timings per clip.\n")
    f.write("export type Word = {text: string; startMs: number; endMs: number; timestampMs: number | null; confidence: number | null; key: boolean};\n")
    f.write("export type Move = \"pushIn\" | \"pullOut\" | \"zoomIn\" | \"zoomOut\" | \"none\";\n")
    f.write("export type ClipData = {id: string; startSec: number; frames: number; zoomFloor: number; maxBottom: number; framing: \"lock\" | \"track\"; move: Move; cx: number[]; cy: number[]; punches: number[]; words: Word[]};\n")
    f.write("export const CLIPS: Record<string, ClipData> = " + json.dumps({c["id"]: c for c in clips}, ensure_ascii=False) + ";\n")
