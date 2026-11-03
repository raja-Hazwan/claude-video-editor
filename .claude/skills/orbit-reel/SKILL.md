---
name: orbit-reel
description: Reel look (Remotion) — portrait image cards travel around the speaker in a 3D ring, passing behind his head and across the foreground. Use for /orbit-reel or to apply this specific portrait-video treatment to a section of a talk.
---

# /orbit-reel (Remotion)

Needs: cut-out + the original room.
Setup, wide framing, cut-outs, storyboard and publish: **talk-to-vertical-short → "Reel looks"**. Component:
`OrbitReel` in `src/looks/Photographic.tsx`; test: `Test-OrbitReel` in `template/src/LooksTest.example.tsx` (upstream sample
photos in `.claude/assets/style-showcase`, restore with `bash .claude/kit/fetch_samples.sh` on a fresh clone).

Upstream this was a silent 4.2 s template. Here it is a **segment** `[from, to)` of the cut with his voice kept; the
template's timings stretch to the segment (e.g. a change at 1.4 s of 4.2 s lands one third in). Use it for one
section of a talk (`<During from to>`), or a short reel as its own composition (`<Sequence from={-from}>`).

## Props
```tsx
<OrbitReel from={a} to={b} cards={TOYS} title={["Put your ideas", "in motion."]} speed={36} centerY={1010} />
```
- Cards ride an ellipse 570 px wide and 290 px deep at `speed` degrees/s, projected from (540, 900): cards behind him
  (z < 0) are drawn **under** the cut-out, the rest over it — no CSS 3D depth sorting against video. 8 cards (images
  repeat). Adjust `centerY` to his crop; check the cards never sit on his mouth for long.
- `fit="contain"` for transparent cut-outs (toys, objects) so they sit whole on the card instead of being cropped;
  `ink="#121412"` makes the title's first line dark when the wall above him is light (white text vanishes there).
- It has no captions of its own: over talk, add `WordCaps` (≈ `top={1480}`) from `looks/captions.tsx`.

## Review
Inspect the first frame, the main change and the ending. Use sharp photographs we may use, clean type; essential
text and his face clear of the platform overlays (let decorative imagery bleed). Texts in Malay where he speaks
Malay; nothing that claims more than he says. No music/SFX unless asked, never over Quran/hadith.
