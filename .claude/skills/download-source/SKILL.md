---
name: download-source
description: Use when the user gives a YouTube / Facebook / TikTok / Instagram link (or asks to "download", "grab", "ambil video") to edit — downloads it with yt-dlp into 00_Inbox and prepares subtitles so editing can start.
---

# Download a source video

1. `python tools/download.py "<url>"` → `<title> [<id>].mp4` (+ `.srt` if the site has captions) in `D:\Davinci Vids\00_Inbox`.
   - `--max-height 720` for quick drafts; `--subs ""` to skip captions; `--dest` to override.
   - Playlists are skipped by default (`--no-playlist`); download items one at a time.
2. YouTube auto-captions are only for *reading the story*. For cutting and word-by-word captions get real timings:
   - Malay/Arabic talks: `"D:\subtitle engine\.venv\Scripts\python" .claude/skills/talk-to-vertical-short/scripts/words_engine.py <video> words.json`
   - Plain SRT: `python tools/make_srt.py "<video>" "<video>.srt"` (faster-whisper large-v3, CUDA → CPU fallback).
3. `ffprobe` it and make a contact sheet (`tools/contact_sheet.py`) so you know what's on screen (overlays, banners, QR codes).
4. Tell the user: title, duration, resolution, and whether captions came down.

Notes
- If yt-dlp fails with 403 / "Sign in to confirm": `pip install -U yt-dlp` first; then `--cookies-from-browser chrome` (ask the user before using their browser cookies).
- Only download content the user has the right to re-edit (their own channel, or speakers who allow clipping). Keep the source link in the project's README for credit.
- After the video is finished and exported, move it Inbox → `01_Sources`.
