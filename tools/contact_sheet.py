"""Contact sheet: a grid of frames so Claude can *look* at a video (cuts, overlays, faces, captions).

    python tools/contact_sheet.py <video> [-o sheet.jpg] [--fps 1] [--start 0] [--duration 60] [--cols 6] [--width 320]

One image per call; keep <= ~60 tiles so each frame stays readable. Each tile is stamped with its timestamp.
"""
import argparse
import math
import os
import subprocess
import sys

ap = argparse.ArgumentParser()
ap.add_argument("video")
ap.add_argument("-o", "--out")
ap.add_argument("--fps", type=float, default=1.0)
ap.add_argument("--start", type=float, default=0.0)
ap.add_argument("--duration", type=float, default=60.0)
ap.add_argument("--cols", type=int, default=6)
ap.add_argument("--width", type=int, default=320)
a = ap.parse_args()

out = a.out or os.path.splitext(os.path.basename(a.video))[0][:40] + f"_sheet_{int(a.start)}s.jpg"
rows = max(1, math.ceil(a.duration * a.fps / a.cols))
font = "C\\:/Windows/Fonts/arial.ttf" if os.path.exists("C:/Windows/Fonts/arial.ttf") else ""
stamp = ("drawtext=" + (f"fontfile='{font}':" if font else "") +
         "text='%{pts\\:hms}':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.6")
vf = f"fps={a.fps},scale={a.width}:-2,setpts=PTS+{a.start}/TB,{stamp},tile={a.cols}x{rows}"
cmd = ["ffmpeg", "-v", "error", "-y", "-ss", str(a.start), "-t", str(a.duration), "-i", a.video,
       "-vf", vf, "-frames:v", "1", "-q:v", "3", out]
rc = subprocess.call(cmd)
if rc == 0:
    print(out)
sys.exit(rc)
