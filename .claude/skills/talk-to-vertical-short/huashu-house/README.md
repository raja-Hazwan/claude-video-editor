# House build — full face + huashu type (default from 2026-11-05)

The house look (rules in `video-style` → "House look"): the OG full-frame face-tracked shot from the Remotion
pipeline for the whole video, with huashu-motion drawing everything on top — word captions, kinetic phrase slams,
path diagrams for a mechanism, white "breath" on skips, masks over lower source overlays — huashu's own effects for
the body, and the house end card with the music box from `D:\sfx` on the logo. Reference: export 09 (Dr MAZA,
"masuk syurga kerana dosa"), projects `maza-syurga-long` (Remotion) + `maza-syurga-motion` (huashu).

## Files here
| File | What it is |
|---|---|
| `film.html` | the composition (huashu contract: one paused GSAP timeline, `data-om-id`s, variables). Everything is data: `__CUES__`, `__BEATS__`, `__TALK__` are filled by `build.py` |
| `build.py` | `tools/film.html` + `assets/cues.json` + `assets/parts.json` + `tools/beats.json` → `index.html` |
| `make_cut.py` | approved clips in output order → `assets/voice.wav`, `assets/cues.json`, `assets/parts.json` (huashu) and `src/data/plate.json` (Remotion), all on the 30 fps grid |
| `mix_sfx.py` | after `om render`: the music box (peak 12 f) on the logo landing, then −14 LUFS / ≤ −1.5 dBTP |
| `beats.example.json` | the worked example: slams, the two paths, masks, end-card text, the speaker line |
| `../template/src/Plate.example.tsx` | Remotion `TrackedPlate`: the approved clips in output order, `TrackedVideo` + `Grade`, picture only |

## Steps (after the highlight table is approved and the cut passes `check_cuts.py`)
1. **Remotion project** as usual (`talk-to-vertical-short` steps 1–8: words, config, split_pauses, words_per_clip,
   check_cuts, track_faces, gen_data). Write `scripts/order.json`: clip ids in output order — the hook clip(s) first
   (the strongest quotable line), then the setup/question, then the rest.
2. **huashu project**: `om new workspace/02_Projects/<name>-motion` → copy this folder's `film.html`, `build.py`,
   `mix_sfx.py` into its `tools/`, `beats.example.json` → `tools/beats.json` (rewrite it for the talk).
   Fonts: `om fonts add "Anton" .` (Inter is bundled); Montserrat Black/ExtraBold/SemiBold `.otf` from
   `C:\Windows\Fonts` → `assets/fonts/`. Logo: `public/brand/logo-lockup.png` → `assets/brand/`. SFX:
   `music-box.wav` (from `D:\sfx\Music Box.wav`) → `assets/sfx/`.
3. `python make_cut.py <remotion> <huashu> <remotion>/scripts/order.json`.
4. **Plate**: copy `Plate.example.tsx` → `src/Plate.tsx`, register `<PlateComposition />` in `Root.tsx`,
   `npx remotion render TrackedPlate out/tracked_plate.mp4 --codec=h264 --crf=16 --muted`, then re-encode with short
   GOPs for Chrome seeking: `ffmpeg -i out/tracked_plate.mp4 -c:v libx264 -crf 19 -g 10 -keyint_min 10 -an <huashu>/assets/plate.mp4`
   (long GOPs made `om render` time out).
5. **Overlays**: scan the used ranges for lower overlays (ads, account banners, QR codes) — a bottom-strip sheet
   at 1 fps — and list each window in `beats.masks` (`[part, from s, to s|null]`). The mask turns the frame black
   below y ~1300 while it is up; zoom-check a full-res still that no edge shows.
6. `python tools/build.py` → `om check .` (0 errors) → `om still . --at …` at the hook, each slam/path, each mask
   window and the end card; look at them (captions y 1120–1300, nothing to read below y 1400 or in the right 140 px).
7. **Storyboard / approval** as in `talk-to-vertical-short` 9b (stills are fine before approval).
8. `om sound .` (music off; huashu effects from the `OM.sfx` marks) → `om render .` (retry once on a CDP timeout)
   → `python tools/mix_sfx.py out/<name>-vN.mp4 out/<final>.mp4` → `om qa .`, ffmpeg-toolkit "Verify a render",
   loudness −14 LUFS → `/publish` (cover: Remotion `Thumbnail` with a full-face frame from the plate).

## beats.json in short
- `slams`: `{at: [part, word|null, nth, offset], lines: [..], colors: [W|G|E], hold, tag, size, hsfx}` — the phrase
  he says, 1–2 lines, Anton caps, one at a time; `hsfx: "impact"` on the 3–4 biggest lines, the rest thud.
- `paths`: a mechanism as 4 nodes lighting on his words (`DOSA → BERSALAH → TAUBAT → SYURGA`), gold for the good
  path, ember for the bad; tick on each node, thud on the last.
- `masks`, `name` (top-left speaker line), `end` (`message`, `sub`, `speaker`, `source` for the end card).
