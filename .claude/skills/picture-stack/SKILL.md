---
name: picture-stack
description: Reel look (Remotion) — a small cluster of photographs floats above the speaker in the original room, then two leave and one photograph takes focus. Use for /picture-stack or to apply this specific portrait-video treatment to a section of a talk.
---

# /picture-stack (Remotion)

Needs: no cut-out (the original room).
Setup, wide framing, cut-outs, storyboard and publish: **talk-to-vertical-short → "Reel looks"**. Component:
`PictureStack` in `src/looks/Photographic.tsx`; test: `Test-PictureStack` in `template/src/LooksTest.example.tsx` (upstream sample
photos in `.claude/assets/style-showcase`, restore with `bash .claude/kit/fetch_samples.sh` on a fresh clone).

Upstream this was a silent 4.2 s template. Here it is a **segment** `[from, to)` of the cut with his voice kept; the
template's timings stretch to the segment (e.g. a change at 1.4 s of 4.2 s lands one third in). Use it for one
section of a talk (`<During from to>`), or a short reel as its own composition (`<Sequence from={-from}>`).

## Props
```tsx
<PictureStack from={a} to={b} photos={["popups/blindbox.png", "popups/kereta.png", "popups/patung.png"]}
  captions={["mainan dalam kotak", "nasib dapat apa?"]} />
```
- Three cards collect above his head (0.24 s apart); at 2.05 s the first two leave and the third grows into focus;
  the caption switches at 2.22 s. Keep visible headroom; small rotations only.

## Review
Inspect the first frame, the main change and the ending. Use sharp photographs we may use, clean type; essential
text and his face clear of the platform overlays (let decorative imagery bleed). Texts in Malay where he speaks
Malay; nothing that claims more than he says. No music/SFX unless asked, never over Quran/hadith.
