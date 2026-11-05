# MOTION.md — how pictures and drawings move in this channel's videos

The method is the `rossark-motion-skill` skill (`.claude/skills/rossark-motion-skill/`, Part 1 of its `MOTION.md`):
never teleport, calm curves, small amplitudes, overlap and follow-through, seeded variety, one main action plus
two or three idle loops. This file is its **Part 2 for this project — it overrides the skill** where they differ.

## Where the code is
- **Platform:** Remotion (React, frame-driven, offline render at 1080×1920, 30 fps). No clocks, timers, CSS animation
  or GSAP: every value is a function of `useCurrentFrame()`.
- **Motion engine:** `src/looks/alive.ts` — the skill's `track`, `flow`, `seg`, `wave`, `loop`, `bell`, `seeded` and
  curves, ported 1:1; time is `ms(frame)`. Plus `idle(t, i)` for a picture's float + sway + breathe.
  The React Native / SwiftUI templates in the skill don't run here — use `alive.ts`.
- **Existing animated pieces to copy from:** `src/Popups.tsx` (picture popups), `src/looks/Stickers.tsx` (die-cut
  stickers), `src/BikeWish.example.tsx` (story scene with a drawn avatar, cursor, box).
- **Art:** popup / sticker cut-outs in `public/popups/` (transparent PNGs, one flat layer each); drawn avatars and
  props are inline SVG in the component (coordinates in px of the 1080×1920 frame).

## The owner's rules (override the skill)
- **Entrances keep the house overshoot.** Popups pop 0.55 → 1 with `Easing.back(1.8)` over 10 f; stickers tilt in
  from −14° with `back(1.8)` over 12 f (video-style "Popups", "House reel look", user 2026-11-03). The skill's
  "no bounce, enter from 0.9" applies to everything else (idle, acting, scene beats).
- **Keep effects soft** (CLAUDE.md). Idle float ±4 px, sway ±1.6° — the house amplitudes; when unsure, halve.
- **Nothing moves over Quran / hadith recitation** beyond what is already on screen — no new pictures, no acting.
- **One flat image can't act.** A photo or cut-out only gets idle life (float, sway, breathe) and its entrance /
  exit; acting (blinks, gaze, limbs) is only for parts drawn as their own SVG layers.

## Where the method applies
- **Idle life on pictures and stickers:** each item out of phase (`idle(ms(f - s.at), i)`) instead of one shared
  `Math.sin(f / 12)` that keeps every picture in sync.
- **Drawn characters** (the BikeWish avatar and any new one): breathing, blinks every 3–4 s (close ~110 ms, reopen
  ~190 ms `'out'` — at 30 fps that's 3 f / 6 f, never shorter), gaze that glides to the prop and holds ≥ 1 s,
  the face falling on the let-down with `flow`, not a snap.
- **Story scenes:** beats as data in ms (`{ click: [0, 400], dream: [400, 2200], open: [2200, 2900] }`) read with
  `seg`; the next beat overlaps the last; the scene holds on its final frame with only idle loops running.
- **Moving pictures:** pictures drift / push with `EASE_IN_OUT`, parallax layers slower further back, nothing
  jumps between positions.
- **Charts / numbers:** draw on once (bars from their base, 40–80 ms stagger ≈ 1–2 f), count up with `EASE_OUT`.

## How changes are checked
- `npx tsc --noEmit`, then `npx remotion still <id> out/s.png --frame=N` at the landing, mid-hold and exit; Read them.
- For acting or idle loops: a contact sheet of every 2nd–4th frame across the move (`tools/contact_sheet.py` or the
  skill's `tools/sheet.sh`), checking that nothing freezes, nothing pops, left and right don't mirror.
- Then the house render checks (ffmpeg-toolkit "Verify a render").
