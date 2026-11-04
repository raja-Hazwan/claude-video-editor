---
name: shape-shift
description: Reel look (Remotion) — a photographic match cut: round subjects in a sequence of photos align at one fixed circle while the speaker stays established below. Use for /shape-shift or to apply this specific portrait-video treatment to a section of a talk.
---

# /shape-shift (Remotion)

Needs: cut-out.
Setup, wide framing, cut-outs, storyboard and publish: **talk-to-vertical-short → "Reel looks"**. Component:
`ShapeShift` in `src/looks/Photographic.tsx`; test: `Test-ShapeShift` in `template/src/LooksTest.example.tsx` (upstream sample
photos in `.claude/assets/style-showcase`, restore with `bash .claude/kit/fetch_samples.sh` on a fresh clone).

Upstream this was a silent 4.2 s template. Here it is a **segment** `[from, to)` of the cut with his voice kept; the
template's timings stretch to the segment (e.g. a change at 1.4 s of 4.2 s lands one third in). Use it for one
section of a talk (`<During from to>`), or a short reel as its own composition (`<Sequence from={-from}>`).

## Props
```tsx
<ShapeShift from={a} to={b} eyebrow="A study in circles" headline="Same shape." footer="New story." every={0.9}
  photos={[{ src: "showcase/orange.jpg", bg: "#f58a00" }, { src: "showcase/record.jpg", bg: "#f3f1f5", objectPosition: "60% 50%", zoom: 1.2 }]} />
```
- Each photo fills the 620 px circle at (210, 390); its background colour is `bg`. Re-aim each photo with
  `objectPosition`/`zoom` so its round subject sits exactly in the circle — a photo whose circle isn't aligned breaks
  the match cut. They change every `every` template-seconds and cycle; the counter shows `01 / 03`.
- `presenter` (`{left, top, width}`, default 90/550/900) places the cut-out below the dark band line.

## Review
Inspect the first frame, the main change and the ending. Use sharp photographs we may use, clean type; essential
text and his face clear of the platform overlays (let decorative imagery bleed). Texts in Malay where he speaks
Malay; nothing that claims more than he says. No music/SFX unless asked, never over Quran/hadith.
