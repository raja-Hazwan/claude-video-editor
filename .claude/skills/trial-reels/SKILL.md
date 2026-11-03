---
name: trial-reels
description: Turns one talking-head clip into 3 visually distinct reels to post as Instagram trial reels, so you can see which look wins. Version 1 has a big yellow title and karaoke captions, version 2 a white post-card header with punch-in zooms and bold uppercase captions, and version 3 a dark grid backdrop with a pixel-font stat and the clip in an orange frame. Use when the user runs /trial-reels or asks for trial reel versions, variations or A/B looks of a 9:16 clip.
---

# /trial-reels

```
 1 TITLE + KARAOKE      2 POST HEADER           3 PIXEL FRAME
┌──────────────┐      ┌──────────────┐       ┌──────────────┐
│ CAROUSELS ARE│      │(o) Name      │       │      2×      │
│  INSTAGRAM   │      │ The hook as a│       │ the views of │
│  CHEAT CODE  │      │ headline     │       │ ┌──────────┐ │
│    (face)    │      │  (face, zooms│       │ │● REC face│ │
│ grey→white   │      │  CHEAT CODE  │       │ │ pixel cap│ │
└──────────────┘      └──────────────┘       └──────────────┘
```

## First use
This skill's folder is the "Base directory" Claude Code shows when it loads it.
```bash
SKILL_DIR="<base directory of this skill>"   # the path Claude Code printed as "Base directory for this skill"
KIT=$(python -c 'import os,sys;print(os.path.realpath(os.path.join(sys.argv[1],"..","..","kit")))' "$SKILL_DIR")
PY="$KIT/.venv/Scripts/python.exe"; [ -x "$PY" ] || bash "$KIT/setup.sh"   # Windows venv; macOS/Linux: .venv/bin/python
```
`GROQ_API_KEY` must be set to transcribe. Needs ffmpeg and Node.

## Steps
1. **Clip.** The user's finished reel or its hook. Whole clips work. The hook (first 5 to 10 s) is the usual test.
2. **Words.** Run `"$PY" "$KIT/reel.py" words <video>` and read the hook. Each sentence ends with `[ends …]`: use the last one you keep as `end`.
3. **Write three different packagings of the same idea.** Each version is a different promise, not just a different font:
   - **v1 title**: the claim, 3 lines, with the 1 or 2 key lines bigger (`*line*`).
   - **v2 headline**: the hook rewritten as a post headline ("The Instagram cheat code not many people know about"), plus the speaker's avatar and name. `keys` are the caption words to turn yellow (the punch-ins land on them).
   - **v3 stat**: the single number or comparison in the clip ("2×", "10K", "$0") plus a 3 to 5 word line.
4. **Spec.** Write `<clip>.trial-reels.json` (below). Paths in a spec are relative to the spec file.
5. **Build.** Run `"$PY" "$SKILL_DIR/build.py" <spec.json>`. It writes `<out>-1.mp4`, `<out>-2.mp4` and `<out>-3.mp4`, each with a sheet.
6. **Check.** Look at all three sheets:
   - The titles clear the top 220 px.
   - The captions sit under the face, not on it.
   - The three versions look clearly different at a glance.
7. **Hand over** the three paths with one line each on what the version tests.

## Spec
```json
{
  "video": "my-reel.mp4", "start": 0, "end": 6.95,
  "v1": {"title": ["carousels are an", "*instagram*", "*cheat code*"]},
  "v2": {"avatar": "me.jpg", "name": "Your Name", "sub": "Instagram growth",
         "headline": "The Instagram cheat code not many people know about",
         "keys": ["cheat", "code", "twice", "views"], "punches": ["cheat", "twice"]},
  "v3": {"stat": "2×", "line": "the views of reels", "pulse_at": "twice"}
}
```
Optional fields:
- **`caption_top`** per version: 1400 for v1, 1260 for v2, 1330 for v3 by default.
- **`punches`**: defaults to the key words, at least 1.5 s apart.

## Taste
- Same clip, same words, three different first impressions. Change the promise, not just the paint.
- No invented numbers. The v3 stat must be something said in the clip.
- Post all three as trial reels on the same day and keep the one with the best 3-second hold.

## In this repo (claude-video-editor)
- These are **alternative looks** to the house style, for a 9:16 talking head. Use one only when the user asks for it
  by name or picks it; the default for a talk is still `talk-to-vertical-short` + `video-style`.
- **Input**: a clean vertical clip with no burned-in captions. Our sources are 16:9 lectures and `reel.py` centre-crops,
  which can cut him out of frame — first make the 9:16 crop (locked on him) with ffmpeg (`ffmpeg-toolkit`) into
  `workspace/02_Projects/<name>/`.
- **Where files go**: the spec, the clip, `"transcript"` and `"out"` all live in `workspace/02_Projects/<name>/`
  (`"out": "out/<name>.<skill>.mp4"`). Never next to an original in `00_Inbox` / `01_Sources` (read-only).
- **Words**: transcription runs locally with the Subtitle Engine (Malay/Arabic tuned); set `"transcript"` in the spec
  (and `--transcript` for `reel.py words`) to a file in the project. Fix spellings in it before building.
- House rules still apply: captions in Malay as he says them, "SAW" not ﷺ, no music/SFX over Quran or hadith
  recitation, never invent numbers or claims for him, pictures we are allowed to use. Look at the sheet before
  handing over; finished videos go through `/publish`.
- Python is `.claude/kit/.venv/Scripts/python.exe` (run `bash .claude/kit/setup.sh --cutout` once if missing).
  Upstream and local changes: `.claude/kit/UPSTREAM.md`.
