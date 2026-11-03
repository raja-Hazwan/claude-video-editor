---
name: elevenlabs-audio
description: Use when a video needs a sound that isn't in the local SFX library (D:\sfx), a voice-over / narration, or a background music bed — generates it with the ElevenLabs API (text-to-sound-effects, text-to-speech, music). Also covers how to mix it under the speaker.
---

# ElevenLabs audio (SFX · voice-over · music)

Always check the local library `D:\sfx` first (woosh, riser, ding, drop, camera-click, music-box…) — it's free and the
house style is tuned to it. Generate only what's missing, save it into the library with a descriptive name, and reuse it.
Every call spends credits: don't loop "try again" more than twice without asking the user.

Key: `ELEVENLABS_API_KEY` in `.env` (gitignored; template in `.env.example`). Never print or commit it.

## Commands (`tools/elevenlabs.py`, stdlib only)
```bash
# Sound effect, 0.5–30 s. Describe the sound, not the scene. Higher --influence = more literal.
python tools/elevenlabs.py sfx "short airy whoosh, cinematic, clean tail" -o "D:/sfx/gen-whoosh-airy.mp3" --seconds 1.2 --influence 0.6
python tools/elevenlabs.py sfx "soft low drone pad, seamless" -o "D:/sfx/gen-drone-loop.mp3" --seconds 10 --loop

# Voice-over. eleven_multilingual_v2 handles Malay. Pick a voice id from `voices` once and note it in CLAUDE.md.
python tools/elevenlabs.py voices
python tools/elevenlabs.py tts "Assalamualaikum, dalam video ini..." -o out/vo.mp3 --voice <voice_id> --stability 0.6

# Background music bed, 3–600 s. Always --instrumental under speech.
python tools/elevenlabs.py music "calm reflective ambient pad, soft piano, no percussion, no vocals" -o out/bed.mp3 --seconds 75 --instrumental
```
Endpoints used: `POST /v1/sound-generation`, `POST /v1/text-to-speech/{voice_id}`, `POST /v1/music`, `GET /v1/voices`
(https://elevenlabs.io/docs/api-reference). Output is mp3 44.1 kHz 128 kbps.

## Using the result
- Remotion: copy into `public/sfx/` and use `<Audio src={staticFile("sfx/x.mp3")} volume={…} />` at the hit frame;
  align the sound's *peak*, not its start (measure: `ffmpeg -i x.mp3 -af astats=metadata=1:reset=1 …`).
- Plain ffmpeg mix / ducking recipes: see the ffmpeg-toolkit skill.
- Levels: speech ≈ -14 LUFS; music bed 18–24 dB under the voice; SFX felt, not heard over words.
- Religious talks (house rule): no music under Quran/hadith recitation, no techy beeps — keep it soft and sparse.
