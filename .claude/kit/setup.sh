#!/usr/bin/env bash
# One-time setup for the editing skills: checks ffmpeg and Node, makes kit/.venv, fetches GSAP,
# warms up HyperFrames and (with --cutout) downloads the matting model. Safe to run again.
set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
say() { printf '\033[1m%s\033[0m\n' "$*"; }

command -v ffmpeg >/dev/null || { echo "ffmpeg is missing. Mac: brew install ffmpeg"; exit 1; }
ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libvpx-vp9 || echo "warning: this ffmpeg has no libvpx-vp9, so cutouts (behind-the-person, explainer) will fail"
command -v npx >/dev/null || { echo "Node.js is missing (HyperFrames renders with it). Mac: brew install node"; exit 1; }
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

mkdir -p "$KIT/vendor"
if [ ! -s "$KIT/vendor/gsap.min.js" ]; then
  say "fetching GSAP"
  curl -fsSL https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js -o "$KIT/vendor/gsap.min.js"
fi

say "warming up HyperFrames (first run downloads it)"
npx --yes hyperframes@0.8.34 --version >/dev/null 2>&1 || echo "warning: could not run hyperframes yet; the first render will retry"

if [ "${1:-}" = "--cutout" ]; then
  say "downloading the matting model"
  (cd "$KIT" && "$VPY" -c "import cutout; cutout.model_path('mobilenetv3')")
fi

# transcription is the local Subtitle Engine only
[ -x "${SUBTITLE_ENGINE_DIR:-D:/subtitle engine}/.venv/Scripts/python.exe" ] || echo "note: Subtitle Engine not found, so clips cannot be transcribed (set SUBTITLE_ENGINE_DIR)"
say "ready: $VPY"
