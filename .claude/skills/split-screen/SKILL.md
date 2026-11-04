---
name: split-screen
description: Reel look (Remotion) — the classic half-and-half over a talk's approved cut. Visuals fill the top half (a step badge, a bold headline and a window showing the point — a checklist, a picture, or a grid with a cursor pick), the speaker fills the bottom half, bold uppercase captions sit on the seam. Use when the user runs /split-screen or asks for a split screen, "visuals on top, speaker at the bottom" or a step-by-step reel.
---

# /split-screen (Remotion)

```
┌──────────────────────┐
│      [Langkah 1]     │  badge
│ Ada *gharar* & maisir│  bold headline, *word* in yellow
│ ┌──────────────────┐ │  window: checklist | image | grid-pick
│ │ ☑ Gharar ...      │ │
├─[ UNSUR MAISIR ]─────┤  caption pill on the seam (y 918), words brighten as said
│   speaker (wide)     │  bottom half: the wide head-and-shoulders window
└──────────────────────┘
```
Setup, wide framing, storyboard and publish: **talk-to-vertical-short → "Reel looks"**. Component:
`src/looks/SplitScreen.tsx`; worked example: `BlindBoxSteps` in `template/src/Looks.timeline-example.tsx` (9 steps over
the whole 2:08 blind-box cut). No cut-out needed.

## Props
```tsx
<SplitScreen videoTop={-860} captionTop={918} volume={closerVolume} steps={[
  { from: START.gharar, to: START.tikam, badge: "Langkah 1", headline: "Ada *gharar* & maisir",
    visual: { type: "checklist", bar: "kenapa haram?", items: [
      { text: "*Gharar*: tidak jelas", at: word("gharar", "gharar") },
      { text: "*Maisir*: iaitu judi", at: word("gharar", "maisir") } ] } },
  { from: START.tikam, to: START.anak, badge: "Langkah 2", headline: "Macam *tikam*",
    visual: { type: "image", src: "popups/tikam.png", bar: "untung nasib", scroll: 40 } },
  { from: START.anak, to: START.yasir, badge: "Langkah 3", headline: "Mainan dalam *kotak*",
    visual: { type: "grid-pick", search: "nasib dapat apa?", images: TOYS, pick: 1, pickAt: word("anak", "kereta"), scroll: 0 } },
]} />
```
- **steps** cover the cut back to back (one per argument step); the panel re-enters at each step's `from`.
- **checklist**: up to 4 rows; each slides in and ticks on its `at` word.
- **image**: a picture in the window, panning `scroll` px over the step.
- **grid-pick**: 8–16 images; the cursor clicks cell `pick` at `pickAt`, the rest dim. Optional `chips` (+`chipsAt`),
  `button` (+`buttonAt`, `clickAt`), `fan` (images that fly out after the click).
- **videoTop**: moves the wide frame inside the bottom half: about `220 − eye y` of the wide frame (−860 when the eyes
  sit at y ≈ 1080), so his chin stays above y 1500.

## Taste
- The top half shows what the words say, at the moment they say it — the tick lands on the word, the cursor clicks on
  the item's name.
- One step per argument step; badges number them ("Soalan", "Langkah 1"…, "Hukumnya" for the ruling).
- Headlines are short Malay (≤ 4 words), one word in `*…*`. Only things he says; pictures we may use.
- Check: headline clear of the top 220 px, the caption pill fits one line, his face whole in the bottom half.
