# Claude Video Editor

A Claude Code workspace for editing short-form videos — mainly turning long horizontal talks into vertical
TikTok/Reels shorts with word-by-word captions, punch-in zooms, key-idea cards and sound effects.

Open Claude Code in this folder and it picks up the project instructions (`CLAUDE.md`), skills, slash commands and hooks.

## What's inside
```
CLAUDE.md                       project instructions: workspace layout, which tool when, house rules
.claude/
  settings.json                 hooks, permissions, plugins (Remotion, HyperFrames), attribution off
  skills/
    talk-to-vertical-short/     Remotion pipeline: face-tracked 9:16 crop, captions, cards, SFX, cut checker
    hyperframes-video/          HTML + GSAP motion graphics rendered with HyperFrames
    ffmpeg-toolkit/             probe / trim / crop / mix / loudness / verify recipes
    download-source/            yt-dlp download into the Inbox + transcription
    elevenlabs-audio/           generate SFX, voice-over and music beds with ElevenLabs
  commands/
    new-video.md                /new-video <url|file> [short|full-context]
    publish.md                  /publish <project>
  hooks/
    session_start.py            lists what's waiting in the Inbox when a session starts
    protect_originals.py        blocks deleting/overwriting files in Inbox, Sources, Footage
    no_claude_in_commits.py     blocks Claude attribution trailers in commit messages
Video/                          local drop folder for source videos (contents gitignored)
  Subtitles/                    .srt / .vtt files for those videos (contents gitignored)
tools/
  download.py                   yt-dlp wrapper → 00_Inbox
  make_srt.py                   faster-whisper (large-v3) → subtitle-ready SRT
  contact_sheet.py              frame grid with timestamps, so Claude can see the video
  elevenlabs.py                 sfx / tts / music / voices (stdlib only)
  doctor.py                     checks every dependency
```

## Setup
1. Install: ffmpeg, Node ≥ 22, Python 3.12, `pip install -U yt-dlp faster-whisper numpy "opencv-python==4.10.0.84"`.
2. `cp .env.example .env` and add your ElevenLabs key (optional — only for generated audio).
3. `python tools/doctor.py`
4. Open Claude Code here, trust the folder, and approve the Remotion + HyperFrames plugins when prompted.
   For HyperFrames' own authoring skills also run `npx hyperframes skills update` once.

The media workspace defaults to `D:\Davinci Vids` (`00_Inbox → 01_Sources / 02_Projects → 03_Exports`, plus `04_Footage`).
Change it in `.claude/settings.json` (`permissions.additionalDirectories`) and the `VIDEO_WORKSPACE` env var.

## Typical session
```
/new-video https://www.youtube.com/watch?v=...      # download, transcribe, propose highlights
  ...approve the clips, iterate on the edit...
/publish my-project                                   # verify, export with cover, file the source
```

## Frameworks
- [Remotion](https://www.remotion.dev) — React video, used for the talk → short pipeline
- [HyperFrames](https://github.com/heygen-com/hyperframes) — HTML/GSAP compositions to MP4
- [FFmpeg](https://ffmpeg.org) · [yt-dlp](https://github.com/yt-dlp/yt-dlp) · [ElevenLabs API](https://elevenlabs.io/docs/api-reference)

Only edit and republish content you have the right to use, and credit the original channel ("Sumber: …").
