"""Download a talk from YouTube (or any yt-dlp site) into the Inbox, ready to edit.

    python tools/download.py <url> [--subs ms,en] [--max-height 1080] [--dest DIR]

Saves `<title> [<id>].mp4` (+ `.srt` when the site has subtitles) to 00_Inbox.
For accurate Malay/Arabic word timings run `tools/make_srt.py` or the subtitle engine afterwards —
YouTube auto-captions are too loose for cutting.
"""
import argparse
import os
import shutil
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKSPACE = os.environ.get("VIDEO_WORKSPACE", os.path.join(REPO, "workspace"))

ap = argparse.ArgumentParser()
ap.add_argument("url")
ap.add_argument("--subs", default="ms,en", help="subtitle languages to fetch (comma list); '' to skip")
ap.add_argument("--max-height", type=int, default=1080)
ap.add_argument("--dest", default=os.path.join(WORKSPACE, "00_Inbox"))
args = ap.parse_args()

if not shutil.which("yt-dlp"):
    sys.exit("yt-dlp not found — install with: pip install -U yt-dlp")

os.makedirs(args.dest, exist_ok=True)
cmd = [
    "yt-dlp", args.url,
    "-f", f"bv*[height<={args.max_height}][ext=mp4]+ba[ext=m4a]/b[height<={args.max_height}]/b",
    "--merge-output-format", "mp4",
    "-o", "%(title)s [%(id)s].%(ext)s",
    "-P", args.dest,
    "--no-playlist",
]
if args.subs:
    cmd += ["--write-subs", "--write-auto-subs", "--sub-langs", args.subs, "--convert-subs", "srt"]
    # A rate-limited subtitle language (YouTube 429 on "en") must not abort the video download.
    cmd += ["--ignore-errors"]

print(">", " ".join(cmd))
sys.exit(subprocess.call(cmd))
