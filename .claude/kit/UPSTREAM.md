# Reel looks — upstream

The eleven reel-look skills started from https://github.com/artemnovitckii/claude-editing-skills (commit `beff6b8`,
2026-11-03) by Artem Novitckii, MIT licensed (`LICENSE-editing-skills`), which rendered spec JSON through HyperFrames
(HTML + GSAP). **This repo is a Remotion port, not a copy**: upstream is a reference for look and taste only, and its
updates don't apply by pulling.

- Looks: `talk-to-vertical-short/template/src/looks/*.tsx` (core, captions, SplitScreen, BehindThePerson, Explainer,
  Storytelling, TrialReels, RankingList, Photographic). Each is a layer over the project's approved cut, timed with
  `timeline.ts` — not one short stretch per reel. Skill docs: `.claude/skills/<look>/SKILL.md`; setup in
  talk-to-vertical-short "Reel looks".
- Kept from upstream here: `cutout.py` (RobustVideoMatting, GPL-3.0 model downloaded at setup), `reel.py` (words /
  frame ruler / safe-zone sheet), `fonts/` (SIL OFL, `OFL-*.txt`), the sample photos (`../assets/style-showcase`,
  third-party rights in its README / `sources.json`; media gitignored — `bash .claude/kit/fetch_samples.sh`).
- New here: `cutout_clips.py` (one cut-out per approved clip, on the wide window), local `transcribe.py` (the Subtitle
  Engine; no cloud), Windows-ready `setup.sh`. Removed: every HyperFrames/GSAP builder and template.
