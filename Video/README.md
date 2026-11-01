# Video/ — local drop folder

Local-only storage for working media. Everything in here except this README and `Subtitles/.gitkeep`
is gitignored — videos and subtitles never get committed.

| Folder | Holds | Rule |
|---|---|---|
| `Video/` | source videos (`.mp4`, `.mov`, …) dropped in for editing | read-only originals, like `00_Inbox` |
| `Video/Subtitles/` | subtitle files (`.srt`, `.vtt`, Whisper JSON) for those videos | write with Python tools (`make_srt.py`); the `protect_originals` hook still blocks `rm`/`mv`/`>`/ffmpeg output here |

Name a subtitle after its video: `Video/Talk.mp4` → `Video/Subtitles/Talk.srt`.

    python tools/make_srt.py "Video/Talk.mp4" "Video/Subtitles/Talk.srt"
