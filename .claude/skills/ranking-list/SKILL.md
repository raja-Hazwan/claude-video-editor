---
name: ranking-list
description: Reel look (Remotion) — a tier-list table on the speaker's chest; each item pops up as he names it and drops into its tier when the verdict lands, with an orange title on top and spoken captions just under the chin. Use when the user runs /ranking-list or asks for a tier list / ranking of things the speaker judges one by one. Not for fiqh rulings unless the user asks (the user found a tier list wrong for the blind-box talk).
---

# /ranking-list (Remotion)

```
┌──────────────────────┐
│   MAINAN DALAM KOTAK │  orange skewed title
│        (face)        │
│      anak patung     │  caption just under the chin
│ S ▓▓  ┌──────────┐   │
│ A     │  PATUNG  │   │  item pops on the chest, then drops into its row
│ …     └──────────┘   │
└──────────────────────┘
```
Setup and publish: **talk-to-vertical-short → "Reel looks"**. Component: `src/looks/RankingList.tsx` (base = the house
framing); test: `Test-RankingList` in `template/src/LooksTest.example.tsx`. A stretch look: its own composition
(`<Sequence from={-from}>`), or `<During>` inside a longer cut.

## Props
```tsx
<RankingList from={START.x} title={"BEST\nFORMATS"} tableTop={1100} items={[
  { name: "CAROUSELS", tier: "S", pop: word("x", "carousels"), drop: word("x", "cheat"), images: ["a.jpg", "b.jpg"] },
  { name: "REELS", tier: "B", pop: word("x", "reels"), icon: "play", color: "#7a2fb0" },
]} />
```
- `items`: `name` (short, uppercase), `tier`, `pop` and `drop` frames; picture = `images` (2–3 fan out, 1 fills) ·
  `icon: "play"` · nothing (name on a coloured card).
- `tiers` replaces S–F: `[["GOAT", "#FF7F7F"], ["MID", "#FFDF7F"], ["NO", "#7FBFFF"]]` — keep labels ≤ 2 characters
  or widen the label column; long labels cramp it.
- `tableTop` ≈ chin + 120 (caption sits 78 px above it); on a close-up use 3–4 tiers so the table stays above y 1500.

## Taste
- Pop on the name, drop on the verdict (if said together, drop 1 s after the pop). Title 2 short lines.
- Ask before using it on a religious ruling — ranking a hukm reads as flippant. Logos only ones we may show.
