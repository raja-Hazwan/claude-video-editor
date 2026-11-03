---
name: visual-notes
description: Reel look (Remotion) — an image above the cut-out speaker changes from the complete view to a deliberate close-up of one meaningful detail. Use for /visual-notes or to apply this specific portrait-video treatment to a section of a talk.
---

# /visual-notes (Remotion)

Needs: cut-out.
Setup, wide framing, cut-outs, storyboard and publish: **talk-to-vertical-short → "Reel looks"**. Component:
`VisualNotes` in `src/looks/Photographic.tsx`; test: `Test-VisualNotes` in `template/src/LooksTest.example.tsx` (upstream sample
photos in `.claude/assets/style-showcase`, restore with `bash .claude/kit/fetch_samples.sh` on a fresh clone).

Upstream this was a silent 4.2 s template. Here it is a **segment** `[from, to)` of the cut with his voice kept; the
template's timings stretch to the segment (e.g. a change at 1.4 s of 4.2 s lands one third in). Use it for one
section of a talk (`<During from to>`), or a short reel as its own composition (`<Sequence from={-from}>`).

## Props
```tsx
<VisualNotes from={a} to={b} image="showcase/pixel-burger.jpg" detail={{ left: -350, top: -200, width: 1100, height: 1034 }}
  tag={["STUDY / FOOD", "STUDY / THE DETAIL"]} callout={<>Familiar food. <span style={{ color: "#db925e" }}>Unexpected form.</span></>} note="look again." />
```
- The whole image first; at 1.5 s it fades back and the orange-framed close-up (590×490) opens on `detail` — the
  image's placement inside that frame (re-anchor it for every new image so it shows something real), then drifts.
  `tag` and `callout` change at 1.85 s.

## Review
Inspect the first frame, the main change and the ending. Use sharp photographs we may use, clean type; essential
text and his face clear of the platform overlays (let decorative imagery bleed). Texts in Malay where he speaks
Malay; nothing that claims more than he says. No music/SFX unless asked, never over Quran/hadith.
