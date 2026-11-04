---
name: storytelling
description: Reel look (Remotion) — three image cards across the top, a bold black-box title and a small white subtitle, all landing together over one continuous take of the talk, with simple TikTok-style captions (white, black outline, 1–3 words). Use when the user runs /storytelling or asks for "three pictures and a title" or a story/proof edit of a moment.
---

# /storytelling (Remotion)

```
┌──────────────────────┐
│ [card] [card] [card] │  three cards, all at once
│ Beli blind box,      │  black-box title, 1-2 lines
│ apa hukumnya?        │
│  Dr MAZA jawab       │  small white subtitle
│      (face)          │  the house framing (TrackedVideo), one continuous take
│    dalam blind box   │  TikTok captions
└──────────────────────┘
```
Setup and publish: **talk-to-vertical-short → "Reel looks"**. Component: `src/looks/Storytelling.tsx` (base = the house
framing, `HouseCut`); test: `Test-Storytelling` in `template/src/LooksTest.example.tsx`. No cut-out needed.

## Props
```tsx
<Storytelling captionTop={1385} stories={[{ from: 0, to: START.hook_3,
  cards: [{ type: "image", src: "popups/blindbox.png" }, { type: "text", big: "?", small: "isi tak tahu" }, { type: "image", src: "popups/kereta.png" }],
  title: ["Beli blind box,", "apa hukumnya?"], subtitle: "Dr MAZA jawab" }]} />
```
- `cards`: exactly 3, each `image {src}` · `cover {image, text, cta}` (carousel cover, `*word*` yellow) ·
  `stat {label, value, unit, ring, at}` (counts up if a number/time) · `comments {title, rows: [[handle, text]]}` ·
  `text {big, small}`.
- `title`: 1–2 lines (≤ 22 characters each); `subtitle`: one short line.
- Over a whole cut: one story per section; or render one moment as its own composition (`<Sequence from={-from}>`).

## Taste
- Everything lands at once, in the first third of a second — never one at a time.
- One continuous take per story (no jump cuts inside it — they read as weird here).
- Cards show real things; comment rows only ones the user gave — otherwise use `text` or `stat` cards.
