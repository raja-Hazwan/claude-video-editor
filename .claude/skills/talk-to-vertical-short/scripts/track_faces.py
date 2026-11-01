"""Per-frame (30fps) face position + cut score for each clip in config.json.
Usage: python track_faces.py <video (ASCII path!)> <config.json> <track.json>
Needs opencv-python 4.x (5.x dropped CascadeClassifier)."""
import cv2, json, sys, numpy as np
src, cfg, out = sys.argv[1], json.load(open(sys.argv[2], encoding="utf-8")), sys.argv[3]
cap = cv2.VideoCapture(src)
FPS = cap.get(cv2.CAP_PROP_FPS)
step = max(1, round(FPS / 30))
front = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
prof = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
res = []
for c in cfg["clips"]:
    a, b = c["start"], c["end"]
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(a * FPS)))
    prev, rows = None, []
    for i in range(int(round((b - a) * FPS))):
        ok, fr = cap.read()
        if not ok: break
        if i % step: continue
        g = cv2.cvtColor(cv2.resize(fr, (640, 360)), cv2.COLOR_BGR2GRAY)
        thumb = cv2.resize(g, (64, 36)).astype(np.float32)
        diff = float(np.mean(np.abs(thumb - prev))) if prev is not None else 0.0
        prev = thumb
        faces = list(front.detectMultiScale(g, 1.1, 6, minSize=(40, 40)))
        if not faces:
            faces = list(prof.detectMultiScale(g, 1.1, 5, minSize=(40, 40))) + \
                [(640 - x - w, y, w, h) for (x, y, w, h) in prof.detectMultiScale(cv2.flip(g, 1), 1.1, 5, minSize=(40, 40))]
        f = max(faces, key=lambda r: r[2] * r[3]) if faces else None
        rows.append({"t": round(i / FPS, 3), "d": round(diff, 2),
                     "fx": round((f[0] + f[2] / 2) / 640, 3) if f is not None else None,
                     "fy": round((f[1] + f[3] / 2) / 360, 3) if f is not None else None,
                     "fw": round(f[2] / 640, 3) if f is not None else None})
    res.append({"id": c["id"], "start": a, "end": b, "rows": rows})
    miss = sum(r["fx"] is None for r in rows)
    print(f"{c['id']}: {len(rows)} frames, {miss} without face")
json.dump(res, open(out, "w"))
