# Claude Video Editor

Everything lives in this folder: the toolkit (`tools/`, `.claude/`) and the media in the **video workspace**
`workspace/` (gitignored — nothing in it is ever committed). New downloads go straight to `workspace/00_Inbox`.

## Workspace layout (`workspace/`)
| Folder | Holds | Rule |
|---|---|---|
| `00_Inbox` | new downloads (+ .srt) waiting to be edited | read-only originals |
| `01_Sources` | originals of finished videos | read-only originals; one numbered folder per source, `NN - <original name>/` with `NN - <original name>.mp4` + `.srt` — same NN as its export |
| `02_Projects/<name>` | one Remotion or HyperFrames project per video (`public/source.mp4`, `out/`) | all work happens here |
| `03_Exports` | finals + covers ready to post | one numbered folder per video: `NN - <Speaker> - <Topic> - Short (Vertical)/` holding `NN - … - Short (Vertical).mp4` + `… - Cover.png` + `… - Post.txt` (YT Shorts / TikTok title, description, hashtags; see `/publish`) (or `Full Context (Vertical)`); NN = next free number |
| `04_Footage` | own camera footage (e.g. Yogyakarta) | read-only originals |

Pipeline: link → `/new-video` (download, transcribe, propose highlights, **wait for approval**) → build in `02_Projects`
→ render → `/publish` (verify, copy to `03_Exports`, move source Inbox → Sources).

## Which tool
- **The look** (framing: track vs lock, camera moves, captions, cards, end card, SFX levels, loudness): `video-style` skill — the single source of the house style; change it there.
- **Talk → vertical short / full-context cut** (face-tracked 9:16, word captions, punch-ins, cards, SFX): Remotion, `talk-to-vertical-short` skill. It holds the house style and the cut rules the user has flagged — follow them exactly.
- **Graphic-first pieces** (quote cards, intros, explainers, overlays): HyperFrames, `hyperframes-video` skill.
- **Alternative reel looks** for a 9:16 talking head, only when the user asks for one: `trial-reels`, `explainer`,
  `split-screen`, `storytelling`, `ranking-list`, `behind-the-person` (spec → HyperFrames, captions from the local
  Whisper) and the photographic templates `shape-shift`, `picture-stack`, `scene-switch`, `visual-notes`, `orbit-reel`.
  Shared kit in `.claude/kit/` (from claude-editing-skills; see `UPSTREAM.md`). House rules still apply.
- **Quick jobs** (probe, trim, crop, mix, loudness, verify): ffmpeg, `ffmpeg-toolkit` skill.
- **Downloading**: yt-dlp via `download-source` skill.
- **Missing SFX / voice-over / music**: ElevenLabs, `elevenlabs-audio` skill — check `D:\sfx` first; calls cost credits.
- Final colour/finishing by hand happens in DaVinci Resolve; the Resolve MCP server can drive it when asked.

## Working rules
- **Look at the video.** Make contact sheets (`tools/contact_sheet.py`) and render stills, then Read them, before and after every change. A render isn't done until it's been checked (see ffmpeg-toolkit "Verify a render").
- **Never cut mid-word.** Run `check_cuts.py` after any cut change; Whisper word end-times are not trusted for cuts.
- Originals are read-only (the `protect_originals` hook enforces it). Outputs go to `out/` or `03_Exports`.
- Filenames contain spaces and fullwidth `？` `：` — always quote paths; in Python use `sys.stdout.reconfigure(encoding="utf-8")`; copy to an ASCII name (`public/source.mp4`) for OpenCV.
- Content is mostly Malay Islamic talks (Dr MAZA, Prof Dr Rozaimi): captions in Malay, write "SAW" not ﷺ, no music or SFX over Quran/hadith recitation, keep effects soft.
- Show the highlight table and wait for approval before building; tell the user what was dropped.

## Git
- Commit messages must **never mention Claude**: no `Co-Authored-By: Claude …`, no "Generated with Claude Code". Attribution is disabled in `.claude/settings.json` and the `no_claude_in_commits` hook blocks it.
- Commit as `rajahazwan02@gmail.com` (set in this repo's local git config — don't change the global config).
- Never commit media, `.env`, renders or `node_modules` (see `.gitignore`).

## Machine paths (override with env vars)
`VIDEO_WORKSPACE`=`<repo>\workspace` · `SUBTITLE_ENGINE_DIR`=`D:\subtitle engine` (Whisper tuned for Malay/Arabic, has its own `.venv`) · `SFX_LIBRARY`=`D:\sfx` · `BRANDING_DIR`=`D:\branding`.
Run `python tools/doctor.py` to check everything is installed.
