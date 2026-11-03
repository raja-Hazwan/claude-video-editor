---
name: scene-switch
description: Reel look (Remotion) — sharp full-frame photographic backgrounds cut behind a continuously visible cut-out speaker. Use for /scene-switch or to apply this specific portrait-video treatment to a section of a talk.
---

# /scene-switch (Remotion)

Needs: cut-out.
Setup, wide framing, cut-outs, storyboard and publish: **talk-to-vertical-short → "Reel looks"**. Component:
`SceneSwitch` in `src/looks/Photographic.tsx`; test: `Test-SceneSwitch` in `template/src/LooksTest.example.tsx` (upstream sample
photos in `.claude/assets/style-showcase`, restore with `bash .claude/kit/fetch_samples.sh` on a fresh clone).

Upstream this was a silent 4.2 s template. Here it is a **segment** `[from, to)` of the cut with his voice kept; the
template's timings stretch to the segment (e.g. a change at 1.4 s of 4.2 s lands one third in). Use it for one
section of a talk (`<During from to>`), or a short reel as its own composition (`<Sequence from={-from}>`).

## Props
```tsx
<SceneSwitch from={a} to={b} scenes={["showcase/blue-stairs.jpg", "showcase/red-stairs.jpg", "showcase/cactus.jpg"]}
  captions={["change the scene", "keep the story moving"]} />
```
- Backgrounds switch at 1/3 and 2/3 of the segment with a slow scale; the caption changes at the second switch.
  Choose backgrounds with a coherent visual relationship; keep movement away from his face.
- `presenter` default -80/200/1240 (he is larger than the frame, cut by its bottom). Check hair, cap and hands over
  both bright and dark backgrounds.

## Review
Inspect the first frame, the main change and the ending. Use sharp photographs we may use, clean type; essential
text and his face clear of the platform overlays (let decorative imagery bleed). Texts in Malay where he speaks
Malay; nothing that claims more than he says. No music/SFX unless asked, never over Quran/hadith.
