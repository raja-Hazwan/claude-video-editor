---
name: trial-reels
description: Reel look (Remotion) — the same hook packaged three visually different ways, to post as Instagram/TikTok trial reels and keep the best 3-second hold. Version 1 a big yellow title with karaoke captions, version 2 a white post-card header with punch-in zooms and bold uppercase captions, version 3 a dark grid backdrop with a pixel-font stat and the clip in an orange frame. Use when the user runs /trial-reels or asks for trial reel versions, variations or A/B looks.
---

# /trial-reels (Remotion)

```
 1 TITLE + KARAOKE      2 POST HEADER           3 PIXEL FRAME
┌──────────────┐      ┌──────────────┐       ┌──────────────┐
│ BELI BARANG  │      │(o) Name      │       │      ?       │
│  BLIND BOX   │      │ The hook as a│       │ tak tahu isi │
│  APA HUKUM?  │      │ headline     │       │ ┌──────────┐ │
│    (face)    │      │  (face, zooms│       │ │● REC face│ │
│ grey→white   │      │  HUKUM       │       │ │ pixel cap│ │
└──────────────┘      └──────────────┘       └──────────────┘
```
Setup and publish: **talk-to-vertical-short → "Reel looks"**. Components: `TrialV1`, `TrialV2`, `TrialV3` in
`src/looks/TrialReels.tsx` (base = the house framing); test: `Test-TrialV1..3` in `template/src/LooksTest.example.tsx`.
Each version is its own composition over the hook stretch: `<Sequence from={-from}>…</Sequence>`, duration `to - from`.

## Props
```tsx
<TrialV1 from={0} title={["beli barang dalam", "*blind box*", "*apa hukum?*"]} />                  // *line* = bigger
<TrialV2 from={0} to={START.hook_4} name="S.S. Dato' Dr. MAZA" sub="Fiqh muamalat"
         headline="Beli blind box, tak tahu isinya: apa hukumnya?" keys={["blind", "hukum"]} />    // punches default to keys
<TrialV3 from={0} stat="?" line="tak tahu isi apa" pulseAt={word("hook_2", "isi")} />
```
Optional `captionTop` per version (1400 / 1260 / 1330); `TrialV2 punches` = frames (default: the first key words,
≥ 1.5 s apart, at most 3).

## Taste
- Same clip, same words, three different first impressions — change the promise, not just the paint.
- No invented numbers: the v3 stat must be something he says (or a "?" for a question hook).
- Post all three the same day; keep the one with the best 3-second hold. Each goes through `/publish` on its own.
