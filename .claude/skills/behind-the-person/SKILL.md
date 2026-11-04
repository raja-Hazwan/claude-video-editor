---
name: behind-the-person
description: Reel look (Remotion) — graphics BEHIND the speaker over a talk's approved cut. The speaker is cut out and stands in front of a panel (a grid of pictures, a bar chart or a screenshot); big words land on his chest as they are said; an optional profile card counts a number up. Use when the user runs /behind-the-person or asks for "visuals behind him", a depth effect or graphics behind the person.
---

# /behind-the-person (Remotion)

```
┌──────────────────────┐
│ ╭──────────────────╮ │
│ │ grid / bars /    │ │  the panel, BEHIND his head (y 150-1020)
│ │ image     head   │ │
│ ╰──────── ( ) ─────╯ │
│       tak tahu       │  big chest words (y ~1370), one beat at a time
│  (o) Name  +10,000   │  optional card
└──────────────────────┘
```
Setup, wide framing, **cut-outs** (`cutout_clips.py`), storyboard and publish: **talk-to-vertical-short → "Reel
looks"**. Component: `src/looks/BehindThePerson.tsx`; worked example: `BlindBoxDepth` in
`template/src/Looks.timeline-example.tsx` (behind-the-person for the question, the toys, the ball and the closer).

## Props
```tsx
<BehindThePerson chestTop={1370} volume={closerVolume} segments={[
  { from: 0, to: START.gharar,
    panel: { type: "grid", images: TOYS, tabs: ["Blind box", "Mainan", "Hadiah"],
             highlight: { index: 0, at: word("hook", "blind"), label: "Tak tahu isi?", labelAt: word("hook_2", "isi") } },
    chest: [{ text: "blind box", at: word("hook", "blind") }, { text: "tak sah", at: word("hook_5", "sah") }] },
]} />
```
- **panel** (per segment, re-enters at its `from`):
  - `grid`: 12 cells (images repeat), slow scroll; `highlight` outlines cell `index` at `at`, swipes through `slides`
    at `swipeAt` and pops a `label` chip at `labelAt`. No platform logo (the upstream Instagram logo is gone).
  - `bars`: `{type: "bars", title, bars: [{label, value, show}], highlight, at}` — bars grow in turn; put the bar that
    matters at the side (the middle is behind his head).
  - `image`: `{type: "image", src, scroll}` — a screenshot panning up.
- **chest**: each shown from its `at` until the next. `{count}` in a text counts up to `card.count`.
- **card** (optional): `{avatar, name, label, count, at, countAt, button, pressed, pressAt}`.
- Mix with other looks by section: `<During from to><BehindThePerson segments={[s]} /></During>`.

## Taste
- Chest words are 1–3 words: the beat, not the sentence; land each on its word. Malay, as he says it.
- The panel's content must be real or illustrative pictures we may use — never invent numbers; a count must be one
  he said.
- Keep it calm: one panel, one highlight per segment. The motion comes from him standing in front of it.
- Check: chest words under his chin (not on the mouth), the panel reads around his head, nothing in the red zones,
  his edges clean against the panel (hands, cap, glasses).
