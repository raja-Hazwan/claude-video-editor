"""Check that everything the video workflow needs is installed.  python tools/doctor.py"""
import importlib.util
import os
import shutil
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ok = True


def row(name, good, detail="", optional=False):
    global ok
    ok &= good or optional
    print(f"{'OK ' if good else 'MISSING'}  {name:<22} {detail}")


def version(cmd):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=60).stdout.splitlines()[0][:60]
    except Exception:
        return ""


for exe, args in [("ffmpeg", ["-version"]), ("ffprobe", ["-version"]), ("yt-dlp", ["--version"]),
                  ("node", ["--version"]), ("git", ["--version"])]:
    path = shutil.which(exe)
    row(exe, bool(path), version([exe, *args]) if path else "")

node_major = version(["node", "--version"]).lstrip("v").split(".")[0]
row("node >= 22 (Remotion)", node_major.isdigit() and int(node_major) >= 22, f"v{node_major}")

for mod, pip in [("faster_whisper", "faster-whisper"), ("cv2", "opencv-python==4.10.0.84"), ("numpy", "numpy")]:
    row(f"python: {mod}", importlib.util.find_spec(mod) is not None, "" if importlib.util.find_spec(mod) else f"pip install {pip}")

workspace = os.environ.get("VIDEO_WORKSPACE", os.path.join(REPO, "workspace"))
for label, path in [("video workspace", workspace),
                    ("subtitle engine", os.environ.get("SUBTITLE_ENGINE_DIR", r"D:\subtitle engine")),
                    ("SFX library", os.environ.get("SFX_LIBRARY", r"D:\sfx")),
                    ("branding", os.environ.get("BRANDING_DIR", r"D:\branding"))]:
    row(label, os.path.isdir(path), path)

has_key = bool(os.environ.get("ELEVENLABS_API_KEY")) or (
    os.path.exists(os.path.join(REPO, ".env")) and "ELEVENLABS_API_KEY=" in open(os.path.join(REPO, ".env"), encoding="utf-8").read())
row("ElevenLabs key (.env)", has_key, "optional — only for generated SFX / voice / music", optional=True)

sys.exit(0 if ok else 1)
