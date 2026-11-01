---
description: Final checks on a rendered video, then copy it + cover to 03_Exports and file the source.
argument-hint: <project folder name in 02_Projects>
---

Publish the project `$ARGUMENTS` from `workspace\02_Projects`:

1. Verify the render in `out/` (ffmpeg-toolkit "Verify a render"): duration/resolution, 1 fps contact sheet across the whole video, silencedetect, loudness ≈ -14 LUFS. Run `check_cuts.py` if the config changed since the last check. Report anything off and stop.
2. Make sure the cover exists (`out/cover.png`; render the Thumbnail still if not) and Read it to check the eyes and text.
3. Copy to `workspace\03_Exports\` using the house names: `<Speaker> - <Topic> - Short (Vertical).mp4` or `… - Full Context (Vertical).mp4`, and `… - Cover.png`.
4. Move the original source (+ .srt) from `00_Inbox` to `01_Sources`.
5. Suggest a TikTok caption (Malay, 1–2 lines + 3–5 hashtags) and the "Sumber" credit line.
