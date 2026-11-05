#!/usr/bin/env bash
# One-time setup for the reel-look tools (cut-outs, frame rulers, contact sheets): checks ffmpeg, makes kit/.venv and
# (with --cutout) downloads the matting model. Rendering is Remotion, in each project. Safe to run again.
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
say() { printf '\033[1m%s\033[0m\n' "$*"; }

command -v ffmpeg >/dev/null || { echo "ffmpeg is missing. Mac: brew install ffmpeg"; exit 1; }
ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libvpx-vp9 || echo "warning: this ffmpeg has no libvpx-vp9, so cut-outs will fail"
# Windows: python3 is often the Store stub, so prefer python there
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) PY=$(command -v python) ;; *) PY=$(command -v python3) ;; esac
[ -n "$PY" ] || { echo "python is missing"; exit 1; }
"$PY" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)' || { echo "python 3.9+ is needed"; exit 1; }

VPY="$KIT/.venv/bin/python"; [ -d "$KIT/.venv/Scripts" ] && VPY="$KIT/.venv/Scripts/python.exe"
if [ ! -x "$VPY" ]; then
  say "making kit/.venv"
  "$PY" -m venv "$KIT/.venv"
  VPY="$KIT/.venv/bin/python"; [ -d "$KIT/.venv/Scripts" ] && VPY="$KIT/.venv/Scripts/python.exe"
fi
"$VPY" -m pip install -q --upgrade pip
"$VPY" -m pip install -q numpy pillow onnxruntime


if [ "${1:-}" = "--cutout" ]; then
  say "downloading the matting model"
  (cd "$KIT" && "$VPY" -c "import cutout; cutout.model_path('mobilenetv3')")
fi

# transcription is the local Subtitle Engine only
[ -x "${SUBTITLE_ENGINE_DIR:-D:/subtitle engine}/.venv/Scripts/python.exe" ] || echo "note: Subtitle Engine not found, so clips cannot be transcribed (set SUBTITLE_ENGINE_DIR)"
say "ready: $VPY"
