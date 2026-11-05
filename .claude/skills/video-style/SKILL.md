---
name: video-style
description: The channel's house style for every edited video — the House look (full-face OG framing with huashu-motion captions, phrase slams and path diagrams, hook-first order, Shorts safe zone, huashu SFX + house music box on the outro), framing (when to face-track vs lock the frame), camera moves, end card and branding, colours, cover and SFX levels. Use whenever building or changing the look of a short, full-context cut, cover or graphic (Remotion), or when the user says the style feels too busy / too much / wants it adjusted.
---

# Video house style

The look the user approved for Malay Islamic talk shorts (Dr MAZA, Prof Dr Rozaimi). `talk-to-vertical-short` and
`motion-graphics` build with it; change it **here** when the user adjusts the style, then update the template
components (`talk-to-vertical-short/template/src/`, `talk-to-vertical-short/huashu-house/`) to match. Overall feel:
calm and steady, with movement only where it means something.

## House look — full face + huashu type (user, 2026-11-05: "from now on make this the house style")
The default for **every** talk edit (shorts and full-context cuts). Reference: export 09 (Dr MAZA, "masuk syurga
kerana dosa"); build steps and files: `talk-to-vertical-short/huashu-house/README.md`.
- **Hook first**: open on his strongest quotable line (e.g. "Ada kata Imam Ibn Qayyim: ada manusia masuk syurga
  kerana dosa…"), then the question / setup, then the rest. Frame 0 already carries the first slam (the poster).
- **Full face, the whole video**: the OG framing below (Framing + Camera moves, rendered by Remotion as the
  `TrackedPlate`), full frame 9:16. **No card / rounded-rectangle speaker window**, no split-screen, no stickers
  ("no more that rectangle frame"). Lower source overlays (ads, account banners, QR codes) are blacked out below
  y ~1300 only while they are up (`beats.masks`), never by switching layout.
- **Shorts safe zone**: captions y 1120–1300; nothing to read below y 1400 (YouTube Shorts' channel name and
  description cover it) or in the right 140 px (the buttons). The speaker line sits small at the top-left (y 86).
- **Type on top, drawn by huashu-motion** (HTML + GSAP, `om render`):
  - *Captions*: Inter 800, 64 px, uppercase, 12 px dark stroke, 1–3 word pages, the spoken word in gold `#E8C46A`.
  - *Slams*: his key phrases (~1 per 5–6 s, one at a time), Anton caps 1–2 lines, ~140 px, over his chest
    (bottom at y ~1016) on a dark band; gold for mercy / syurga / the answer, ember `#D2492F` for neraka / warnings.
    Quote his words; no invented claims.
  - *Paths*: when he explains a mechanism, 4 nodes lighting on his words (`DOSA → BERSALAH → TAUBAT → SYURGA` gold,
    `PAHALA → TAKABUR → SOMBONG → NERAKA` ember).
  - *Cuts*: a white "breath" (0.35 s) where content is skipped; jump cuts inside a thought stay hard.
- **Sound**: his voice + huashu's own effects (`OM.sfx`: impact on the 3–4 biggest lines, thud on slams, tick on
  path nodes, whoosh on skips). The house library `D:\sfx` **only for the outro branding** (Music Box on the logo).
  No music bed. Nothing over Quran/hadith recitation.
- **End card**: the house end card below (yellow message, sub, red bar, speaker, Sumber, EDITED BY + logo), 3.6 s.
  huashu's "Made with huashu-motion" signature is off (`data-om-signature="off"`).
- Loudness −14 LUFS, true peak ≤ −1.5 dBTP (a fast limiter before AAC: click transients overshoot).

The sections below still define the framing, camera moves, end card, cover and SFX peaks that the house look uses.
Their Remotion-only parts (KeyCards, hook title, the stickers + split-screen reel look, popups, the D:\sfx table for
the body) are the **previous** style — use them only when the user asks for that look.

## Framing — face tracking is the exception (user, 2026-11-01)
The user found constant face tracking overwhelming ("the frame moving on and on"). Each clip is one of two kinds,
set per clip in `config.json` as `"framing"`:

| Framing | Use for | What it does |
|---|---|---|
| `track` | **the hook / intro clip**, and **context-shift clips** (the clip right after a flash cut where the topic turns, e.g. example → core point, point → accusation) | crop gently follows the face (heavy smoothing, ~1.4 s window) |
| `lock` (default) | everything else: continuations, jump-cut parts, the closer | crop fixed on his median position for the clip (per source shot), never slides |

Safety: `gen_data.py` switches a locked clip to `track` when his face centre would leave the middle 60% of the
frame, and prints `LOCK->TRACK <clip>`; say so in the storyboard. Never cut him off to keep a lock.

## Camera moves — one per clip, vary neighbours
Set per clip as `"move"`; consecutive clips must differ. No zoom kick on every clip (removed).

| `move` | Motion | Good for |
|---|---|---|
| `pushIn` | very slow push in, +0.06 over the whole clip (sine ease) | building a point, the main message |
| `pullOut` | very slow pull out, 0.06 → 0 over the whole clip | settling, the closer (ends wide into the end card) |
| `zoomIn` | quick zoom in +0.08 over 18f at clip start, then holds | hook, energy after a flash cut |
| `zoomOut` | quick zoom out 0.10 → 0 over 18f at clip start | after a **jump cut** (the zoom jump hides the cut) |
| `none` | still | a breather between busy clips |

**Emphasis zoom**: only on the clip's key word (`punchWords`, first match only — one per clip): +0.10, in ~7f, hold
~36f, out 12f. Not on several words per clip.

Overlay zoom (`zoomFloor`/`maxBottom`) for banners stays ≤1.2 and stacks under the move.

## Captions (Remotion `Captions`, previous style — the House look uses the huashu captions above)
Montserrat 900, **66 px** (user picked from 82/66/56/48 on 2026-11-01 — 82 covered his hands and chest), uppercase,
11 px black stroke, top at y≈1180, max width 800, ~1 s pages, split at pauses >700 ms. Active word yellow `#FFD60A`,
lifted 3 px (no scale — it eats spaces); active **keyword** = white on red `#E63946` pill (radius 14). Keywords
from `config.json` show yellow when not active.

## Picture
1080×1920, 30 fps. Grade `contrast(1.06) saturate(1.12) brightness(1.02)` + vignette + top gradient; bottom ~15% fades
to black (hides source name bars / social icons — remove it if the source has no lower overlays).

## Colours — the reel looks too (user, 2026-11-03)
House look type: white, syurga gold `#E8C46A`, neraka ember `#D2492F`, dark bands `#0b0c11`; the end card keeps its
yellow `#FFD60A` / red `#E63946` / gold `#CCB375`. Remotion pieces (previous style):
Only the house palette: red `#E63946` (pills, badges, accents; `#C1272F` for red text on a light panel), yellow
`#FFD60A` (emphasis on dark), near-black `#151515`, white, and gold `#CCB375` for the end-card credit only. It lives
in `looks/core.tsx` as `HOUSE`; use it, never new accent colours. No orange/cream palette and no starburst or
asterisk marks (they read as the Claude logo): badges carry a plain yellow dot. Light backdrops stay neutral grey
(matched to the wall), not warm cream.
Fonts: no slim or serif faces (Instrument Serif, DM Serif were removed). Headlines, badges, list items and stressed
words use **Montserrat 700–900**, upright; a stressed word differs by colour (red on light, yellow on dark), not italic.
Reel looks the user likes: **split-screen**, and **stickers** (`looks/Stickers.tsx`: the popup cut-outs with a white
die-cut outline popping in over the wide framing, in the wall above his head, `pop.mp3` 0.4 on each) for the parts
where he names things. For a story beat ("ingat dapat basikal, dapat bola je") a small sticker scene works: cursor
clicks the box, a drawn avatar dreams of the prize, the box opens on the let-down (project `BikeWish.tsx`). Not
wanted (pruned from the repo on 2026-11-05 with the other unused claude-editing-skills looks): orbit-reel (the
"carousel"), the explainer panel (the "phone frame"), behind-the-person's post panel. Over any look, keep the **house
word captions** (`Captions`, `top` per look: ~1390 stickers, ~1500 split-screen with `seam={false}`), not the look's
own caption style.

## Previous reel look — stickers + split-screen (user, 2026-11-03; replaced by the House look on 2026-11-05)
Only when the user asks for it. It was the default look for every **full-context cut** (and a short when it has named things to show), built over the
approved cut at the same length. Reference: `workspace/02_Projects/maza-blindbox-long` → `src/Reel.tsx`
(export 08); template `talk-to-vertical-short/template/src/Reel.timeline-example.tsx`.
- **Sections alternate** by what he is doing: **stickers** where he names concrete things or tells a story (hook,
  examples, the let-down) · **split-screen** where he gives reasons, rulings, conditions (checklist / picture steps,
  `seam={false}`). Switch only at a clip boundary; flash + woosh where content is skipped, otherwise a hard cut with
  a different whoosh per change (woosh2 / woosh3 / fastwoosh / Woosh into the closer).
- **Stickers**: land 3f before the word, 50–190f, never two pictures on the same spot at once; positions in the wall
  above his head — left x 260 / centre 540 / right 820, y 330–560; pictures 230–470 px wide; text stickers short
  (2–3 words, uppercase, red pill, ink for a calm line), tilt ±3–7° alternating. `pop.mp3` 0.4 on each.
- **Split steps**: badge (Sebabnya / Pengecualian / Boleh / Hukumnya …) + Montserrat headline with one stressed word
  + checklist items landing on his words; clicks / old cam / drop on the items as in the SFX table.
- **One story scene** where the talk has a punchline example (blind box: `BikeWish.example.tsx` — cursor clicks the
  box, a drawn avatar dreams of the prize in a thought bubble, the box opens on the let-down, the face falls).
- **House word captions** over everything, `top` per section (1390 stickers, 1500 split); none under the end card.
- House end card, house loudness.

## Cards & titles (top band, y 110+)
- **Hook title**: red pill label (question / setup) + yellow two-line headline; ~6.7 s; drop SFX.
- **Name tag**: speaker name, small, after the hook title.
- **KeyCard**: yellow label pill + big white headline + grey sub-line; one per idea; text in Malay, short.
- Write "SAW", not ﷺ (font lacks the glyph). Quote his words; don't invent claims for him.

## Popups — pictures of the things he names (user, 2026-11-03, Dr MAZA blind box)
Optional, for talks built on concrete examples (toys, a ball, a bicycle, a lottery card). Only when he names a thing
a picture makes clearer; never for abstract terms (gharar, haram) — those stay KeyCards. ~6–10 per 2 min.
- **Look** (`template/src/Popups.tsx`): white card, padding 12, radius 30 (picture radius 20), shadow
  `0 18px 50px rgba(0,0,0,.45)`, tilt ±3–4° alternating per popup. Default width 320 px; wide pictures 360–440.
- **Place**: centred, top at **y 1350** — the strip under the captions (his robe / the bottom fade). Not beside his
  face (the first try at y 560 on the right covered his eyes and sat under TikTok's side buttons).
- **Motion**: pops in over 10f (scale 0.55→1, `Easing.back(1.8)` overshoot, fade in 4f), floats ±4 px, shrinks
  20% + fades + drops 20 px over the last 7f.
- **Timing**: lands **3f before** the word it illustrates; 50–66f for stills, ~80f for a clip. Never overlapping
  each other. Fine over KeyCards (different band).
- **Clips**: 2–3 s, muted, shown square (`objectFit: cover`). No faces of real people.
- **Pictures**: one clear object, transparent cut-out best (crop to its alpha bounds), else plain background cropped
  tight. No watermarks; keep a consistent kind (all illustrations or all photos) where possible. Brand logos are
  the user's call — ask. Nothing un-Islamic (casino imagery, instruments, immodest dolls). A pale picture reads
  faint on the white card (the blind-box doll) — prefer saturated pictures.
- **SFX**: Mouse Click at 0.35 on a popup that doesn't share its word with a card sound or flick; otherwise none.
- Same exclusions as SFX: no popups over Quran/hadith recitation.

## Cuts
White flash overlay 10f where content is skipped (with a woosh); jump cut (no flash) inside a continuous thought.
Never crossfade speech.

## End card (last 3 s, `extend: 3.0`)
Blur + dark; yellow message headline + white sub; speaker name; "Sumber: <channel>"; then **EDITED BY** (gold
`#CCB375`, letterspaced) + The Returning Soul logo fading up at +20f. Speech fades out over 6f. If the source ends
before the extend, hold the last frame (`Freeze`). Branding only here — the user wants it subtle.
Logo: `D:/branding/logo with text no bg.png` cropped to its alpha bbox → `public/brand/logo-lockup.png`, 400 px wide.

## SFX (library `D:\sfx`) — align the **peak**, not the file start
House look: only the Music Box row applies (outro logo); the body uses huashu effects. The full table is for
Remotion-only edits in the previous style.
`from = targetFrame − peakFrames`. Peaks @30fps: Woosh 17f · woosh2 14f · woosh3 9f · fastwoosh 3f · drop 26f ·
Riser 50f · old cam 6f · Hi-Tech Click 8f · Camera Click 4f · flick 3f · Mouse Click 2f · ding 4f · Music Box 12f.
(woosh4 = duplicate of woosh2.) For a new file, measure the envelope peak with numpy first.

| Moment | SFX | vol |
|---|---|---|
| Hook title slam | drop (trimBefore so peak hits ~f8), fade out | 0.22 |
| Name tag | Mouse Click | 0.6 |
| Emphasis zoom | flick (skip if a card sound or drop already lands on that word) | 0.5 |
| Flash cuts | **vary**: woosh2 → fastwoosh (short clips) → woosh3 → Woosh (biggest, into closer) | 0.35–0.5 |
| Key cards | old cam / Camera Click / Hi-Tech Click (different per card) | 0.45–0.9 |
| Main message word | drop | 0.28 |
| Into final word | Riser peaking on the word | 0.3–0.35 |
| Brand logo reveal | Music Box (peak 12f on logo landing), fade | 1.0 |
| Permission / ruling word ("dibenarkan", "boleh") | ding (peak 4f), layered on the Riser peak | 0.5 |

No music or SFX over Quran/hadith recitation. Avoid beep/charge/multi flicker (too techy). Keep SFX under the voice.

## Audio
Final mix normalised to **-14 LUFS**, true peak ≤ -1.5 dBTP (two-pass `loudnorm`, video stream copied).

## Cover (TikTok)
Face in the upper half on the key line (eyes open, mid-word), red pill hook + yellow two-line quote (Montserrat 900,
~132 px, 16 px stroke) + white sub + name tag, all inside y 1090–1650. No branding.

## Storyboard shows the style
Every storyboard row lists **framing** (track / lock, and any LOCK->TRACK fallback) and **move**, so the user approves
them per clip before rendering.
