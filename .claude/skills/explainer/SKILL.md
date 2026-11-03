---
name: explainer
description: Reel look (Remotion) over a talk's approved cut — the speaker sits low in a rounded panel on a light backdrop with his head breaking out over its top edge, and the top of the frame explains the point with visuals (a before-to-after compare with a drawn arrow, or a numbered list). White captions set key words in a serif. Use when the user runs /explainer or asks for this "speaker at the bottom, visuals on top" panel look (for a graphics-only motion piece use motion-graphics).
---

# /explainer (Remotion)

```
┌──────────────────────┐
│ Boleh atau *haram*?  │  title, one word serif italic
│ [Bola] ⟶ [Ingat ...] │  compare: card, drawn arrow, reveal   (or a numbered list)
│      ╭──head──╮      │  his head breaks out over the panel (the cut-out above its edge)
│ ╭────┴────────┴────╮ │
│ │  speaker, captions│ │  rounded panel; its top edge = his eye line
│ ╰──────────────────╯ │
└──────────────────────┘
```
Setup, wide framing, **cut-outs**, storyboard and publish: **talk-to-vertical-short → "Reel looks"**. Component:
`src/looks/Explainer.tsx`; worked example: `BlindBoxDepth` in `template/src/Looks.timeline-example.tsx` (lists for the
reasoning and the yasir exception, a compare for bola vs basikal).

## Props
```tsx
<Explainer eyeY={1080} captionTop={1420} keys={["gharar", "maisir", "yasir", "haram"]} segments={[
  { from: START.gharar, to: START.anak, title: "Kenapa *haram*?", visual: { type: "list", items: [
      { text: "Ada *gharar*: tidak jelas", at: word("gharar", "gharar") },
      { text: "Ada *maisir*: judi", at: word("gharar", "maisir") } ] } },
  { from: START.boleh, to: START.closer, title: "Boleh atau *haram*?", visual: { type: "compare",
      left:  { label: "Gharar yasir", big: "Bola\n*merah / biru*", small: "boleh: yang utama kita tahu", at: word("boleh", "boleh") },
      right: { label: "Tak tahu isi", big: "Ingat\n*basikal*", small: "tengok-tengok, bola je",
               at: word("basikal", "ingat"), revealAt: word("basikal_2", "bola") },
      arrowAt: word("basikal", "tapi") } },
]} />
```
- **compare**: the left card shows 1–3 `images` (swipes at `swipeAt`, optional `chip`) or a text card (`big`, `small`);
  the right card starts as a dashed "?", the arrow draws at `arrowAt`, the card reveals at `revealAt` (`image` or
  `big`/`small`).
- **list**: up to 4 numbered rows, each landing on its `at` word.
- **eyeY**: his eye line in the wide frame (≈ 1080 for the wide head-and-shoulders window) = the panel's top edge.
- **keys**: caption words set in the serif, every time they are said.

## Taste
- One point per segment. Land each visual on the word that names it; nothing appears before it is said (the title is
  there from the segment's first frame).
- Titles 1–4 words, one `*word*`. If he contrasts two cases (boleh vs haram), use `compare`.
- No invented results or numbers. Check: visuals between y 330 and 760, captions under the mouth and above y 1500,
  his head breaking out cleanly over the panel edge.
