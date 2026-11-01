---
description: Start a new edit from a link or an Inbox file — download, transcribe, propose highlights.
argument-hint: <youtube-url | inbox filename> [short | full-context]
---

Start a new video edit for: $ARGUMENTS

1. If it's a URL, use the download-source skill to pull it into `D:\Davinci Vids\00_Inbox`. If it's a filename, find it in `00_Inbox` (or the repo's `Video/` folder).
2. Probe it, make a contact sheet, and get word timings (subtitle engine / words_engine.py).
3. Follow the talk-to-vertical-short skill up to the highlight table: propose the clips (source time + line) for a ~60 s short — or a < 2 min "Full Context" cut if the second argument says `full-context` — and **stop for my approval** before scaffolding the Remotion project.
