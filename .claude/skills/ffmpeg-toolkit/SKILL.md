---
name: ffmpeg-toolkit
description: Use for any quick video/audio job done with ffmpeg/ffprobe — probing a file, trimming, 9:16 crops, cover frames, contact sheets, silence/loudness checks, normalising audio, mixing SFX or music under a voice, burning subtitles, re-encoding for TikTok/Reels/YouTube. Also use to verify a render before calling it done.
---

# ffmpeg toolkit

Rules: never write into `00_Inbox`, `01_Sources`, `04_Footage` or `Video/` (a hook blocks it) — outputs go to the
project's `out/` or `03_Exports`. Quote every path (names contain spaces and fullwidth `？：`). If a tool can't open a
unicode path (OpenCV), copy to an ASCII name first (`public/source.mp4`).

## Look before you cut
| Need | Command |
|---|---|
| Probe | `ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,sample_rate -of compact "in.mp4"` |
| Contact sheet (see the video) | `python tools/contact_sheet.py "in.mp4" --start 120 --duration 60 --fps 1` then Read the jpg |
| Single frame | `ffmpeg -v error -ss 83.4 -i "in.mp4" -frames:v 1 -q:v 2 f.jpg` |
| Silences (cut points / dead air) | `ffmpeg -i "in.mp4" -af silencedetect=n=-35dB:d=1.0 -f null - 2>&1 \| findstr silence_` (bash: `grep silence_`) |
| Loudness | `ffmpeg -i "in.mp4" -af ebur128=peak=true -f null - 2>&1 \| tail -12` |

## Common edits
| Need | Command |
|---|---|
| Trim (frame-accurate) | `ffmpeg -ss 12.3 -to 71.8 -i "in.mp4" -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k out.mp4` |
| Trim (instant, keyframe-snapped) | `ffmpeg -ss 12 -to 72 -i "in.mp4" -c copy out.mp4` |
| 16:9 → 9:16 centre crop | `-vf "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos"` (face-tracked crops: use the talk-to-vertical-short skill) |
| Cover frame 9:16 | `ffmpeg -ss T -i "in.mp4" -frames:v 1 -vf "crop=608:1080:X:0,scale=1080:1920:flags=lanczos" public/cover-frame.png` |
| Normalise speech to -14 LUFS (social) | `-af loudnorm=I=-14:TP=-1.5:LRA=11` |
| Clean up voice | `-af "highpass=f=80,lowpass=f=12000,afftdn=nf=-25,loudnorm=I=-14:TP=-1.5"` |
| Music bed ducked under voice | `ffmpeg -i voice.mp4 -i bed.mp3 -filter_complex "[1:a]volume=0.25[m];[m][0:a]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[d];[0:a][d]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac out.mp4` |
| Drop an SFX at 12.5 s | `-filter_complex "[1:a]adelay=12500\|12500,volume=0.5[s];[0:a][s]amix=inputs=2:duration=first:normalize=0[a]"` |
| Burn subtitles | `-vf "subtitles='sub.srt':force_style='FontName=Montserrat,FontSize=14,Outline=2'"` (escape `:` and `\` in Windows paths, or cd to the folder) |
| Social export | `-c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart` |
| Concat same-codec clips | list file of `file 'a.mp4'` lines → `ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4` |
| HEIC/iPhone HEVC → edit-friendly | `-c:v libx264 -crf 18 -pix_fmt yuv420p` (Resolve free can't decode some HEVC 10-bit) |

## Verify a render (always, before saying it's done)
1. `ffprobe` duration/resolution/fps match the plan.
2. Contact sheet across the whole render at 1 fps — check every cut, card and caption visually.
3. `silencedetect` — no unintended gaps > 1 s; loudness around -14 LUFS for social.
