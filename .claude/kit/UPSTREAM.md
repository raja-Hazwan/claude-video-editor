# Reel skills kit — upstream

Copied from https://github.com/artemnovitckii/claude-editing-skills at commit `beff6b8` (2026-11-03), by
Artem Novitckii, MIT licensed (`LICENSE-editing-skills`). Fonts: SIL OFL (`fonts/OFL-*.txt`). Sample photos and
footage are third-party; their rights are in `../assets/style-showcase/README.md` and `sources.json` (not covered by
the MIT licence; media is gitignored — `bash .claude/kit/fetch_samples.sh` restores it).

Layout here: skills in `.claude/skills/<name>/`, the shared kit in `.claude/kit/`, sample media in
`.claude/assets/style-showcase/`, guide + previews in `.claude/docs/style-showcase/` (their `build.py` files find these
via `parents[1]` / `parents[2]` of the skill folder, so no path changes were needed).

Local changes (re-apply after pulling a new upstream version):
- `reel.py`, `style_template.py`: every `read_text`/`write_text` uses utf-8 (Windows default cp1252 breaks the
  templates); `npx` resolved with `shutil.which` (Windows has `npx.cmd`).
- `transcribe.py`: uses the local Subtitle Engine (`words_engine.py`, Whisper tuned for Malay/Arabic) when it is
  installed; Groq only as a fallback (`--groq`).
- `setup.sh`: Windows venv path (`.venv/Scripts/python.exe`), `python` instead of the `python3` Store stub.
- SKILL.md files: Windows first-use commands, plus the "In this repo" block at the end.
- `fetch_samples.sh`, this file: new.
