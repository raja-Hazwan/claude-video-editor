---
name: shape-shift
description: A photographic match cut aligns circular subjects at one fixed anchor while the speaker stays established below. Use for /shape-shift or to apply this specific portrait-video treatment.
---

# /shape-shift

Apply this treatment to a portrait clip using the included 4.2-second, 1080x1920, 30fps starter. The style and images are independent of the sample speaker’s words; follow the user’s chosen topic. [See the reviewed example](../../docs/style-showcase/shape-shift.mp4).

## Use

Resolve this skill folder from the base directory shown when the skill loads. Its `build.py` resolves the shared kit through that real path, including when installed as a symlink. Run:

```bash
python "D:/Claude Video Editor/.claude/skills/shape-shift/build.py" path/to/spec.json
```

With no spec, the command reproduces the included silent sample into the repository’s `.work/` directory. `--prepare-only` builds an editable composition without rendering. Python 3.9+, ffmpeg/ffprobe and Node.js 22+/npm are required. The first build downloads pinned GSAP 3.15.0 into the ignored vendor cache; rendering uses HyperFrames 0.8.214. No transcript or API key is needed for these short templates. [Spec and custom-footage instructions](../../docs/style-showcase/README.md).

## Adapt the treatment

Align the circular subject in every replacement photograph to the same anchor in `#photo-stage`. The example moves from an orange slice to a record and camera lens. Adjust each image’s width, left and top together; swapping an image without re-aligning its circle breaks the match cut. The speaker is a continuous alpha layer below the photographic panel.

Asset keys: `camera.jpg`, `explainer_cut.webm`, `orange.jpg`, `record.jpg`. Full-resolution example images and source credits are in [assets/style-showcase](../../assets/style-showcase/README.md).

Supply a same-size, frame-matched alpha cutout when changing the presenter. The existing `kit/cutout.py` can create it; see the shared guide. Inspect hair and hands over both bright and dark imagery. The build helper does not perform segmentation automatically.

Keep the presenter visible from the first result frame. Use sharp photographs and clean type. Essential text and the face should clear platform overlays; let decorative imagery bleed rather than shrinking the entire composition. The sample’s captions and image anchors are starting points, not automatic tracking.

## Review and deliver

The helper validates media dimensions/duration, prepares the composition, runs the renderer check, renders and fully decodes the MP4. Inspect the first frame, the main change and the ending. Check crop anchors, text readability and matching source/cutout timing. The default is silent; preserve or add speech, SFX or music only when the user requests them. Longer edits require extending the HTML timeline and source windows; changing only the duration is insufficient.

These are local Claude Code/Codex editing workflows. The ChatGPT conversation in the showcase is an authored visual, not a built-in ChatGPT slash-command integration. Third-party image rights are documented separately from the code license in the asset directory.

## In this repo (claude-video-editor)
- These are **alternative looks** to the house style, for a 9:16 talking head. Use one only when the user asks for it
  by name or picks it; the default for a talk is still `talk-to-vertical-short` + `video-style`.
- **Input**: a clean vertical clip with no burned-in captions. Our sources are 16:9 lectures and `reel.py` centre-crops,
  which can cut him out of frame — first make the 9:16 crop (locked on him) with ffmpeg (`ffmpeg-toolkit`) into
  `workspace/02_Projects/<name>/`.
- **Where files go**: the spec, the clip, `"transcript"` and `"out"` all live in `workspace/02_Projects/<name>/`
  (`"out": "out/<name>.<skill>.mp4"`). Never next to an original in `00_Inbox` / `01_Sources` (read-only).
- **Words**: transcription runs locally with the Subtitle Engine (Malay/Arabic tuned); set `"transcript"` in the spec
  (and `--transcript` for `reel.py words`) to a file in the project. Fix spellings in it before building.
- House rules still apply: captions in Malay as he says them, "SAW" not ﷺ, no music/SFX over Quran or hadith
  recitation, never invent numbers or claims for him, pictures we are allowed to use. Look at the sheet before
  handing over; finished videos go through `/publish`.
- Python is `.claude/kit/.venv/Scripts/python.exe` (run `bash .claude/kit/setup.sh --cutout` once if missing).
  Upstream and local changes: `.claude/kit/UPSTREAM.md`.
