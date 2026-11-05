# Claude Video Editor

Everything lives in this folder: the toolkit (`tools/`, `.claude/`) and the media in the **video workspace**
`workspace/` (gitignored — nothing in it is ever committed). New downloads go straight to `workspace/00_Inbox`.

## Workspace layout (`workspace/`)
| Folder | Holds | Rule |
|---|---|---|
| `00_Inbox` | new downloads (+ .srt) waiting to be edited | read-only originals |
| `01_Sources` | originals of finished videos | read-only originals; one numbered folder per source, `NN - <original name>/` with `NN - <original name>.mp4` + `.srt` — same NN as its export |
| `02_Projects/<name>` | one Remotion project per video (`public/source.mp4`, `out/`) | all work happens here |
| `03_Exports` | finals + covers ready to post | one numbered folder per video: `NN - <Speaker> - <Topic> - Short (Vertical)/` holding `NN - … - Short (Vertical).mp4` + `… - Cover.png` + `… - Post.txt` (YT Shorts / TikTok title, description, hashtags; see `/publish`) (or `Full Context (Vertical)`); NN = next free number |
| `04_Footage` | own camera footage (e.g. Yogyakarta) | read-only originals |

Pipeline: link → `/new-video` (download, transcribe, propose highlights, **wait for approval**) → build in `02_Projects`
→ render → `/publish` (verify, copy to `03_Exports`, move source Inbox → Sources).

## Which tool
- **The look** (framing: track vs lock, camera moves, captions, cards, end card, SFX levels, loudness): `video-style` skill — the single source of the house style; change it there.
- **Talk → vertical short / full-context cut**: the cut (highlights, words, check_cuts, face tracking) in Remotion via
  `talk-to-vertical-short`; the finished look is the **House look** (`video-style`): the full-face tracked plate
  with huashu-motion captions, phrase slams and paths on top, hook-first, captions above the Shorts UI, huashu SFX +
  the house music box on the outro. Build it from `talk-to-vertical-short/huashu-house/README.md`.
- **Graphic-first pieces** (quote cards, intros, slideshows, charts, overlays): Remotion, `motion-graphics` skill.
- **Standalone motion films** — a channel intro / trailer, a series opener, an animated explainer or infographic insert
  that stands on its own and isn't tied to a talk's words: `huashu-motion` skill (user-level install, HTML + GSAP,
  renders itself in Chrome). Its own project `02_Projects/<name>-motion/`, never inside a Remotion project; the result
  comes in as a clip (`om render --transparent` → `.mov` with alpha for an overlay) or goes to `03_Exports` / Resolve.
  House overrides in `motion-graphics` → "huashu-motion". (huashu also draws the type of the House look on talk edits.)
- **Making pictures / drawings feel alive** (stickers, popups, the story-scene avatar, photographic looks, any
  illustration): `rossark-motion-skill` method, ported to Remotion as `template/src/looks/alive.ts`; project rules in
  `template/src/looks/MOTION.md` (they override the skill).
- **Previous reel look** (stickers + split-screen, `video-style` "Previous reel look", from talk-to-vertical-short
  `template/src/Reel.timeline-example.tsx`): only when the user asks for it.
- **Split-screen** (`split-screen` skill, Remotion `template/src/looks/`): the one alternative reel look kept from
  claude-editing-skills (the other ten were pruned on 2026-11-05 as unused), only when the user asks for it.
  Cut-outs, frame rulers and sheets: `.claude/kit/`. House rules still apply.
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
