"""ElevenLabs helper: sound effects, voice-over and background music. Standard library only.

    python tools/elevenlabs.py sfx   "soft cinematic whoosh, airy" -o whoosh.mp3 [--seconds 1.5] [--influence 0.5] [--loop]
    python tools/elevenlabs.py tts   "Teks suara latar ..."        -o vo.mp3 --voice <voice_id> [--model eleven_multilingual_v2]
    python tools/elevenlabs.py music "calm nasheed-style ambient pad, no vocals" -o bed.mp3 [--seconds 60] [--instrumental]
    python tools/elevenlabs.py voices                              # list voice ids

Needs ELEVENLABS_API_KEY in the environment or in the repo's .env file.
Every call costs credits — generate once, then reuse the file from the SFX library.
API reference: https://elevenlabs.io/docs/api-reference
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")

API = "https://api.elevenlabs.io/v1"
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def api_key():
    key = os.environ.get("ELEVENLABS_API_KEY")
    env = os.path.join(REPO, ".env")
    if not key and os.path.exists(env):
        for line in open(env, encoding="utf-8"):
            name, _, value = line.strip().partition("=")
            if name == "ELEVENLABS_API_KEY":
                key = value.strip().strip('"')
    if not key:
        sys.exit("ELEVENLABS_API_KEY is not set (copy .env.example to .env and fill it in)")
    return key


def call(path, body=None, query=""):
    req = urllib.request.Request(
        f"{API}{path}{query}",
        data=json.dumps(body).encode() if body is not None else None,
        headers={"xi-api-key": api_key(), "Content-Type": "application/json"},
        method="POST" if body is not None else "GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:500]}")


def save(data, out):
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    open(out, "wb").write(data)
    print(f"saved {out} ({len(data) // 1024} KB)")


ap = argparse.ArgumentParser()
sub = ap.add_subparsers(dest="cmd", required=True)

s = sub.add_parser("sfx", help="text to sound effect (0.5-30 s)")
s.add_argument("text")
s.add_argument("-o", "--out", required=True)
s.add_argument("--seconds", type=float, help="0.5-30; omit to let the model choose")
s.add_argument("--influence", type=float, default=0.3, help="prompt_influence 0-1")
s.add_argument("--loop", action="store_true")
s.add_argument("--model", default="eleven_text_to_sound_v2")

t = sub.add_parser("tts", help="text to speech")
t.add_argument("text")
t.add_argument("-o", "--out", required=True)
t.add_argument("--voice", required=True, help="voice_id (see `voices`)")
t.add_argument("--model", default="eleven_multilingual_v2")
t.add_argument("--stability", type=float, default=0.5)
t.add_argument("--similarity", type=float, default=0.75)
t.add_argument("--speed", type=float, default=1.0)

m = sub.add_parser("music", help="text to music (3-600 s)")
m.add_argument("prompt")
m.add_argument("-o", "--out", required=True)
m.add_argument("--seconds", type=float)
m.add_argument("--instrumental", action="store_true")
m.add_argument("--model", default="music_v1")

sub.add_parser("voices", help="list available voices")

a = ap.parse_args()
fmt = "?output_format=mp3_44100_128"

if a.cmd == "sfx":
    body = {"text": a.text, "prompt_influence": a.influence, "loop": a.loop, "model_id": a.model}
    if a.seconds:
        body["duration_seconds"] = a.seconds
    save(call("/sound-generation", body, fmt), a.out)
elif a.cmd == "tts":
    body = {"text": a.text, "model_id": a.model,
            "voice_settings": {"stability": a.stability, "similarity_boost": a.similarity, "speed": a.speed}}
    save(call(f"/text-to-speech/{a.voice}", body, fmt), a.out)
elif a.cmd == "music":
    body = {"prompt": a.prompt, "model_id": a.model, "force_instrumental": a.instrumental}
    if a.seconds:
        body["music_length_ms"] = int(a.seconds * 1000)
    save(call("/music", body, fmt), a.out)
elif a.cmd == "voices":
    for v in json.loads(call("/voices")).get("voices", []):
        labels = ", ".join(f"{k}={val}" for k, val in (v.get("labels") or {}).items())
        print(f"{v['voice_id']}  {v['name']}  {labels}")
