---
name: hyperframes-video
description: Use when making a video that is mostly designed graphics rather than a cut of footage — animated title/quote cards, intros/outros, lower thirds, motion-graphics explainers, slideshow-style reels, data charts — or when the user names HyperFrames. Renders HTML + GSAP compositions to MP4 with HeyGen's HyperFrames CLI.
---

# HyperFrames (HTML → MP4)

**Which framework?**
- Cutting a real talk into a short (face-tracked crop, word captions, punch-ins) → **Remotion**, talk-to-vertical-short skill.
- Graphic-first pieces (quote cards, intros, explainers, carousels-as-video), or an overlay you'll layer in Remotion/Resolve → **HyperFrames**.
- One-off trim/crop/mix → **ffmpeg** (ffmpeg-toolkit skill).

Requirements: Node ≥ 22, ffmpeg (both installed). Official docs: https://hyperframes.heygen.com ·
repo: https://github.com/heygen-com/hyperframes. For full authoring rules install the official skills once:
`npx hyperframes skills update` (or the Claude Code plugin `hyperframes@hyperframes`, enabled in `.claude/settings.json`).
`npx hyperframes docs <topic>` prints the docs in the terminal — read them instead of guessing attributes.

## Workflow
```bash
cd "workspace/02_Projects"
npx hyperframes init <name>          # scaffold
cd <name>
npx hyperframes preview              # studio with live reload (leave running for the user)
npx hyperframes check                # lint + runtime validation + layout inspection — must pass
npx hyperframes snapshot             # key frames as PNG → Read them and look
npx hyperframes render               # MP4 (WebM for transparent overlays)
```
Useful extras: `npx hyperframes catalog` / `add <block>` (prebuilt blocks: transitions, social overlays, charts),
`transcribe` (word timestamps), `tts` (local Kokoro voice — English-first; use ElevenLabs for Malay),
`audio` / `beats` (where sounds and beats land), `normalize-audio`, `remove-background`.

## Composition basics
```html
<div id="stage" data-composition-id="quote" data-start="0" data-width="1080" data-height="1920">
  <video class="clip" src="source.mp4" data-start="0" data-duration="8" data-track-index="0" muted playsinline></video>
  <h1 id="q" class="clip" data-start="0.5" data-duration="7" data-track-index="1">“Orang lain lagi teruk!”</h1>
  <audio src="sfx/woosh.mp3" data-start="0.4" data-duration="1" data-track-index="2" data-volume="0.5"></audio>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.from("#q", { opacity: 0, y: 60, duration: 0.6, ease: "power3.out" }, 0.5);
    window.__timelines = window.__timelines || {};
    window.__timelines.quote = tl;
  </script>
</div>
```
- Timing lives in `data-start` / `data-duration` (seconds); layering in `data-track-index`.
- Animations must be seekable: one paused GSAP timeline registered on `window.__timelines[<composition-id>]`. No
  `setTimeout`, no CSS animations that run on wall-clock time — rendering is frame-by-frame and deterministic.
- 9:16 = 1080×1920. Keep text inside y 240–1680 for TikTok's profile-grid crop; reuse the house style
  (Montserrat 900, yellow `#FFD60A` emphasis, red `#E63946` pill labels, gold `#CCB375` "EDITED BY")
  from the talk-to-vertical-short skill.
- Finished render → copy to a new numbered folder in `03_Exports` with the house naming (see `/publish`).
