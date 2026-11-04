---
name: motion-graphics
description: Use when making a video that is mostly designed graphics rather than a cut of footage — animated title/quote cards, intros/outros, lower thirds, motion-graphics explainers, slideshow-style reels, data charts, or a transparent overlay to layer in Resolve. Builds it in Remotion (React, frame-driven animation) with the channel's house style. (Replaces the old HyperFrames skill.)
---

# Motion graphics (Remotion)

**Which tool?**
- Cutting a talk into a short / full-context cut → `talk-to-vertical-short` (+ a reel look from its "Reel looks").
- Graphic-first pieces (quote cards, intros, explainers, slideshows, charts) or an overlay → **this skill**.
- One-off trim/crop/mix → `ffmpeg-toolkit`.

Load `remotion:remotion-best-practices` (and its markup reference) before writing components. Rules that bite:
animate only from `useCurrentFrame()` with `interpolate()` / `Easing` — **no CSS transitions/animations, no GSAP,
no timers** (frames render independently); assets in `public/` via `staticFile()`; video/audio with `@remotion/media`;
images with `<Img>`; local fonts with `@remotion/fonts` (house fonts: Montserrat via `@remotion/google-fonts`; the
reel-look fonts in `.claude/kit/fonts`).

## Where
- A piece for a talk already in `02_Projects/<name>` → a new composition in that project (`src/<Piece>.tsx`,
  registered in `Root.tsx`), reusing its `Overlays.tsx` (KeyCard, EndCard, NameTag, Grade) and `timeline.ts`.
- A standalone piece → `cd workspace/02_Projects && npx create-video@latest --yes --blank --no-tailwind <name>`,
  `npx remotion add @remotion/media @remotion/google-fonts @remotion/fonts`, then copy what you need from
  `talk-to-vertical-short/template/src/` (Overlays for the house cards and end card; `looks/core.tsx` for
  `ramp`/`rich`/`E` easing helpers).

## House style (see `video-style`)
1080×1920, 30 fps. Montserrat 900; yellow `#FFD60A` emphasis, red `#E63946` pill labels, white on black stroke; the
end card's gold `#CCB375` "EDITED BY" + The Returning Soul logo only at the end. Text inside y 240–1680 (TikTok's
profile-grid crop), top 220 px and bottom 420 px clear of the platform UI. Malay text, "SAW" not ﷺ, quote him — don't
invent claims. SFX from `D:\sfx`, peak-aligned, soft; none over Quran/hadith; ElevenLabs only for what's missing.

## Patterns
- **Quote card**: dark grade over a still or a slow push on the clip, red pill label + yellow two-line quote landing
  with `Easing.out(Easing.back(1.8))` over ~10 f, name tag after; hold ≥ 2.5 s per line read.
- **Intro / outro**: logo or title reveal in ≤ 1.5 s, then hold; the house `EndCard` for outros.
- **Lower third**: the house `NameTag`, slide in 8 f, hold, slide out 8 f.
- **Slideshow reel**: `<Series>` of `<Img>` slides with a slow push each (scale 1 → 1.06), one caption per slide.
- **Chart**: bars/lines grown with `interpolate` per item, staggered ~4 f, the value counting up; label the source.
- **Transparent overlay** (to layer in Resolve): render ProRes 4444 or VP9 with alpha —
  `npx remotion render <id> out/x.mov --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le`.

## Render and check
`npx tsc --noEmit` → `npx remotion still <id> out/s.png --frame=N` at every change, Read them → `npx remotion render
<id> out/x.mp4 --codec=h264 --crf=18` → contact sheet (`tools/contact_sheet.py`), loudness −14 LUFS if it has sound →
`/publish` (numbered folder in `03_Exports`).
