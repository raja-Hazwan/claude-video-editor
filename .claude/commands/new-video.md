---
description: Start a new edit from a link or an Inbox file — download, transcribe, propose highlights.
argument-hint: <youtube-url | inbox filename> [short | full-context]
---

Start a new video edit for: $ARGUMENTS

1. If it's a URL, use the download-source skill to pull it into `workspace\00_Inbox`. If it's a filename, find it in `00_Inbox`.
2. Probe it, make a contact sheet, and get word timings (subtitle engine / words_engine.py).
3. Follow the talk-to-vertical-short skill up to the highlight table: propose the clips (source time + line) for a ~60 s short — or a < 2 min "Full Context" cut if the second argument says `full-context` — and **stop for my approval** before scaffolding the Remotion project.
4. After approval and before rendering the full video, show me the storyboard (skill step 9b) and **stop for approval** again.
