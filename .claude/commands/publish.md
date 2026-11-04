---
description: Final checks on a rendered video, then copy it + cover to 03_Exports and file the source.
argument-hint: <project folder name in 02_Projects>
---

Publish the project `$ARGUMENTS` from `workspace\02_Projects`:

1. Verify the render in `out/` (ffmpeg-toolkit "Verify a render"): duration/resolution, 1 fps contact sheet across the whole video, silencedetect, loudness ≈ -14 LUFS. Run `check_cuts.py` if the config changed since the last check. Report anything off and stop.
2. Make sure the cover exists (`out/cover.png`; render the Thumbnail still if not) and Read it to check the eyes and text.
3. Copy into a new numbered folder in `workspace\03_Exports\`: NN = the next free number after the highest existing
   `NN - …` folder (two digits). Folder `NN - <Speaker> - <Topic> - Short (Vertical)` (or `… - Full Context (Vertical)`)
   holds `NN - <same name>.mp4` and `NN - <same name> - Cover.png`. A re-render of an already published video replaces
   the files in its existing folder (keep its number) — ask first.
4. Move the original source (+ .srt) from `00_Inbox` into a folder in `01_Sources` with the **same NN as its export**:
   `NN - <original name>/` holding `NN - <original name>.mp4` and `NN - <original name>.srt`.
5. Write `NN - <same name> - Post.txt` into the export folder (UTF-8, Malay), built only from what he actually says
   and the on-screen cards — no claims he didn't make:
   - **YOUTUBE SHORTS**: Title (≤100 chars, ends `| <Speaker> #shorts`) · Description (2–4 sentences: the question,
     his answer, the dalil if any) · credit `Sumber: <speaker full name> — <channel> (<youtu.be link>)` ·
     `Edited by The Returning Soul` · 5 hashtags starting `#shorts` (topic, fiqh area, speaker, `#ilmuislam`).
   - **TIKTOK / INSTAGRAM REELS**: Caption (1–2 lines, hook first) · the same credit · 6 hashtags ending `#fyp`.
   Show the user the post text.
