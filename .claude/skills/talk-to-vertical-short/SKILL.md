---
name: talk-to-vertical-short
description: Use when turning a long horizontal talk, lecture, ceramah, podcast or interview video (16:9) into a vertical 9:16 short / reel / TikTok highlight of ~50-60s (or a <2 min "full context" cut) with word-by-word subtitles, zoom effects and sound effects, using Remotion. Also use when the user asks to "make it vertical", "highlight the important parts", or "edit like the Prof Dr Rozaimi video".
---

# Talk → Vertical Short (Remotion)

## Overview
Pick the strongest 4–6 moments from a long talk, crop to 9:16 (locked on the speaker, face-tracked only where the
`video-style` skill says), and dress it with captions, camera moves, key-idea cards and timed SFX. Reference build:
`workspace\02_Projects\rozaimi-short` (all components + `scripts/config.json`).

## Folder layout (`workspace/`)
`00_Inbox\` new downloads (+ .srt) not yet edited · `01_Sources\` originals of finished videos (move from Inbox when done) ·
`02_Projects\<name>\` Remotion projects · `03_Exports\` finals + covers ready to post · `04_Footage\` own camera footage · `_Tools\` scripts.

## Workflow
Scripts: `.claude/skills/talk-to-vertical-short/scripts/` (in the claude-video-editor repo) · components: `template/src/` · example config: `template/config.example.json`.

1. **Probe + read context**: `ffprobe` the source; read any `.srt` beside it for the story.
2. **Word timings**: prefer `D:\subtitle engine\.venv\Scripts\python scripts/words_engine.py <video> <words.json>` — uses the Subtitle Engine's tuned settings (Islamic-term prompt, VAD pad 600/500, romanized Arabic, user's auto-corrections). Fallback: `scripts/transcribe_words.py`. Prints timed lines.
3. **Choose highlights (~50–60s total)**: hook first (most provocative line, often the opening), then the key term → core point → religious/authority reference → strongest closing line. Cut 0.15–0.3s outside word boundaries; never mid-word. Present the table (source time + line) to the user.
4. **Check frames**: contact sheet per clip (`ffmpeg -vf "fps=1,scale=320:-1,tile=6x3"`). Look for on-screen overlays (venue name bars, donation banners, bank account numbers, QR codes). Measure their top edge on a gridded full frame. Overlays in the bottom ~15% are hidden by the bottom fade in `Grade` (template). Only zoom (`zoomFloor` + `maxBottom`) for overlays that reach higher, and keep zoom ≤1.2 — more makes the face fill the frame.
5. **Scaffold** (in `workspace\02_Projects`): `npx create-video@latest --yes --blank --no-tailwind <name>`, `npx remotion add @remotion/media @remotion/transitions @remotion/captions @remotion/google-fonts`. Copy the video to `public/source.mp4` (ASCII name — OpenCV can't open fullwidth/unicode paths).
6. **config.json** (see reference project): `keywords`, `merge` (e.g. `"what aboutism": "whataboutism"`), `clips[]` with `id,start,end,framing,move,punchWords` (framing/move/one emphasis word per clip: see `video-style`), optional `extend` (seconds of extra picture for end card), `zoomFloor`, `maxBottom`.
6a. **Speakers who pause a lot** (MAZA taat: 33s of dead air in 4:33): write *coarse* keep-ranges (one per argument step), then `python scripts/split_pauses.py <src> config_coarse.json config_long.json 1.0` splits each at every real pause ≥1s into `<id>_2`, `<id>_3`… parts (treat ids containing `_` as jump cuts). Then **re-caption per part**: `"D:\subtitle engine\.venv\Scripts\python" scripts/words_per_clip.py <src> config_long.json words.json` — whole-file Whisper timings drift by seconds in pause-heavy talks, so words fall into removed gaps and vanish from captions (lost "Sebab", "golongan", "agnostik"; "tidak faham" placed 6s early). Fix spellings in its printed text.
6b. **CUT CHECK — mandatory, before tracking/rendering**: `python scripts/check_cuts.py public/source.mp4 config.json` must print `all boundaries clean`. It measures real audio loudness at every clip start/end. **Never trust Whisper word end times for cuts**: Whisper ends the last word early and stretches the next word's start back over the pause (MAZA short: "salah" really ended 46.45 but Whisper said 46.25; "operation" ended 206.4, Whisper said 205.98 → both words got chopped and the user caught it at 0:29 and 0:48). Apply its suggested times, re-run until clean. Also fix that word's `e` in words.json so captions match. Re-run after ANY config change.
7. **Face track**: `python scripts/track_faces.py public/source.mp4 config.json track.json` (needs `pip install "opencv-python==4.10.0.84"`; 5.x lacks CascadeClassifier).
8. **Data**: `python scripts/gen_data.py config.json track.json words.json src/data/clips.ts` → prints each clip's start frame and every word's absolute frame. Use those to hardcode Sequence `from` values.
8b. **Timing comes from data, not hardcoded frames**: use `template/src/timeline.ts` — `START.<clip>`, `at(clip, local)`, `end(clip, offset)`, `word(clip, "text")` — and build the TransitionSeries by mapping `ORDER` (see `template/src/Composition.timeline-example.tsx` / `Sfx.timeline-example.tsx`; SFX take `hit` + `peak`). Then changing a cut = edit config → gen_data → render; cards/SFX follow automatically. Never hand-shift frame numbers.
9. **Components**: copy `template/src/*` into `src/` (or copy the latest project, e.g. `workspace\02_Projects\pecah-amanah-short`, minus `out/`, `src/data`, `public/source.mp4`). Edit `Composition.tsx`: TransitionSeries durations, TOTAL_FRAMES, card frames; texts are props: `HookTitle label/title/size`, `NameTag name`, `KeyCard label/title/sub`, `EndCard message/sub/speaker/source`; edit `Sfx.tsx` frames. Remove the bottom fade in `Grade` if the source has no lower overlays.
9b. **STORYBOARD — mandatory, stop for approval before rendering the video** (user rule): once the composition is
    wired (after gen_data), show the user one table of the whole edit in output order — per row: output time (mm:ss) ·
    source clip (time + line) · on-screen text (hook title / name tag / KeyCard label+title+sub / end-card message) ·
    framing (track / lock, any LOCK->TRACK) + move + emphasis word · SFX (file + vol) · transition into the next clip (flash / jump cut). Add total
    length, what was dropped, and trim options if it runs long. **It must have pictures** (user asked to see the parts
    before rendering): write `scripts/storyboard.json` (one row per clip + end card, 3–4 frames each: flash-in, every
    card, every punch-in, the closer word, end card/logo) and run `python scripts/storyboard.py . scripts/storyboard.json`
    → `out/storyboard.html` (real stills from the composition, self-contained). Send that page with the table, and
    look at its frames yourself first. Wait for the user's OK or changes; re-show it after big changes. Stills are fine
    before approval; `npx remotion render` of the full video is not.
10. **Verify**: `npx tsc --noEmit`, render stills at hook/cards/closer/end (`npx remotion still ... --frame=N`), contact-sheet them and look. Then `npx remotion render <id> out/x.mp4 --codec=h264 --crf=18`; check 1fps contact sheet + `silencedetect`. Copy final (and cover) to a numbered folder in `workspace\03_Exports\` (`NN - <name> - Short (Vertical)/` with `NN - <name> - Short (Vertical).mp4` + `… - Cover.png` + `… - Post.txt` for YT Shorts/TikTok; NN = next free number — see `/publish`), and move the source + .srt from `00_Inbox\` into `01_Sources\NN - <original name>\` (same NN as the export, files prefixed `NN - `).

## Style
The look — framing (track vs lock), camera moves, captions, cards, end card, SFX levels, loudness, cover —
lives in the **`video-style`** skill. Read it before step 6 and follow it; change the style there, not here.

## Long-form "full context" variant (< 2 min)
Use when the user says 50–60s doesn't do the talk justice (a fiqh answer whose reasoning is a chain). Reference:
`workspace\02_Projects\pecah-amanah-short` → `src/Long.tsx` (copy in `template/src/Long.tsx`, config `template/config_long.example.json`).
Register it next to the short in `Root.tsx`; keep the short too and save as `<name> - Full Context (Vertical).mp4`.

1. **Keep the argument chain, drop illustrations.** Map his answer as steps (question → principle → key term → purpose → test → danger → Quran → ruling → "you decide") and keep one clip per step. Drop jokes, side examples, scholar side-debates, disclaimers. Tell the user what was dropped.
2. **Clip ends finish the thought.** Never end a clip on the first item of a list or right as a word ends with the sentence still running (e.g. "…ada hukuman denda," → he continues "cuma denda ini dengan harta, dengan duit"). Read ~6s past the planned end in `words.json`; end 0.25–0.3s after the last word *before a real pause (≥1s)*. User flagged a cut at 0:44 that "transitioned too fast while he was speaking".
3. **Dead air: jump cut, not flash.** Pauses >1.5s inside a kept section → split into two clips (`test`/`test2`) placed back-to-back with no Overlay (entry zoom kick hides the jump). Flash + woosh only where content is skipped. Leave natural ~1.3s pauses.
4. **Budget:** ~3300–3600 frames; 9–11 KeyCards, one per step; punch-ins ≥90f apart (gen_data enforces); in a long clip with no card for >6s add a punch word so the picture keeps moving.
5. **Changing one clip's length:** edit config → re-run `track_faces.py` + `gen_data.py` → shift every hardcoded `from` at/after that clip's end by the delta (a small regex script over `Long.tsx`; include the woosh that precedes the cut) and update TOTAL_FRAMES + that Sequence's `durationInFrames`.
6. **Hadith/dalil explanations are never "side points"**: when he narrates a hadith step by step (e.g. MAZA qadha: al-Tirmizi → Khandaq → 4 prayers → Bilal azan → iqamat + each prayer → conclusion), keep every step even if the cut runs past 2:00 (user asked: "dont cut the part where he explains the hadiths"). Drop only the pure Arabic recitation block and scholarly side-debates; keep the short Arabic lead-ins (*summa aqama…*) that flow straight into his Malay — there is no silence to cut on, and they are part of the hadith. One running card per step (e.g. "Iqamat, kemudian solat: 1. Zuhur / 2. Asar …") keeps a long list readable.
7. **Whisper drifts badly in Arabic-heavy stretches** (≥1s). There: list real silences with an RMS gap scan, cut only inside them, and re-transcribe just those segments with `word_timestamps=True` + a prompt containing the Arabic phrases; merge into words.json and nudge any first word whose start sits a hair before the clip start (else it vanishes from captions).
8. **Overlay only in part of a clip** (donation banner 3:07–3:17): split the clip at a pause where it disappears; zoom (`zoomFloor 1.2, maxBottom 0.8`) only the covered part.
9. Use `makeTimeline(CLIPS)` from `timeline.ts` for the long composition too (example `template/src/Long.timeline-example.tsx`) — jump cuts are a `JUMP_CUT` set, everything else gets a flash.
10. Verify with `silencedetect=n=-35dB:d=1.0` and a 1fps contact sheet across every changed boundary.

## TikTok cover (thumbnail)
`template/src/Thumbnail.tsx` (a `<Still id="Thumbnail">`, register in Root). Pick the most intense face frame from the clips (contact sheet at 2fps, then 10fps around the best moment), crop 9:16 with ffmpeg (`crop=608:1080:X:0,scale=1080:1920:flags=lanczos`) → `public/cover-frame.png`. Layout: face in the upper half; red pill hook label + yellow two-line quote (Montserrat 900, ~112px, nowrap, 16px stroke) + name tag, all inside y 1100–1600 (the profile grid shows only the centre 3:4, y 240–1680). Dark gradient behind the text, no branding. **Check the eyes** on a close-up strip (crop around the face at 15fps): reject blinks/squints — prefer a frame where he faces the camera mid-word on the key line (MAZA: 0:38.4 "tidak *benar*"). Centre the face horizontally. One cover can serve both short and full-context versions (save one copy per video name). `npx remotion still Thumbnail out/cover.png`; save as `<video name> - Cover.png`.

## Cut rules (user-flagged — never repeat)
- A clip must never end while the speaker is still sounding a word, and never start after the first syllable. `check_cuts.py` enforces it.
- Don't cut a story/example short: if he starts an example ("kena operation…"), keep it through to its point, jump-cutting the pauses, even if the short runs past 60s. Ask "does the next sentence finish this thought?" by reading ~10s past every clip end in words.json.
- **WRN lines from check_cuts = speech resumes ≤1.2s after an end cut.** Every WRN must be resolved by re-transcribing that gap: it is either a stutter/restart (MAZA long 1:37: "Nabi qa'… [1.1s] qamat" — Whisper merged it into one word "qaqamat" and the cut fell in the pause, chopping "iqamat"), a delayed final word (azan clip: "walaupun dah qada'… [1.4s] azan"), or a genuinely new sentence you're skipping. Only the last one may stay; say which in your notes. check_cuts treats an end as fine when the next clip starts right where speech resumes (pause-split jump cuts), and prints a **prompt-free transcription across each WRN cut** — decide from that, never from the energy graph or the prompted words.json: a quiet consonant (the long "m" in *qamat*) dips below the silence threshold mid-word, so a "gap" inside a word looks like silence. Real case: 185.5 was waved through as "next word is *dan*" — it was the second half of *qamat* (user caught it at 1:39). When in doubt, extend.
- Whisper's word list is not proof the word is inside the clip — check the caption words of each clip against the audio, especially the last word.
- The last clip (with `extend`) is checked too — the end-card fade must start after the final word.

## Common mistakes
- Caption page spanning a long pause (e.g. Arabic recitation) shows the next word seconds early → Captions splits runs at gaps >700ms before paging (template has it).
- Quran/hadith recitation gaps: put a KeyCard naming the verse there, and no SFX over the recitation.
- Assuming hard cuts: these lectures mostly pan/zoom → use smoothed continuous tracking (gen_data does median+moving average, split at detected cuts).
- ffmpeg filter `file=` paths with `C:` break the filtergraph → `cd` into the folder and use relative names.
- `/tmp` in Git Bash ≠ Python's `/tmp` on Windows → use the scratchpad path.
- Too-tight framing: source faces are ~15% of frame width already; don't add base zoom.
