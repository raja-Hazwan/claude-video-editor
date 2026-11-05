r"""Mix the outro branding SFX (music-box.wav from D:\sfx) onto the rendered film at the logo, peak-aligned,
then normalise to -14 LUFS / <= -1.5 dBTP.

    python tools/mix_sfx.py out/<project>-vN.mp4 out/<final>.mp4

Times come from the same tools/beats.json + assets/cues.json the picture uses."""
import json, subprocess, sys

FPS = 30
# peak frame of each file (video-style skill) and the default level
SFX = {"woosh": (17, 0.4), "woosh2": (14, 0.45), "woosh3": (9, 0.5), "fastwoosh": (3, 0.38), "drop": (26, 0.28),
       "riser": (50, 0.3), "old-cam": (6, 0.45), "hitech-click": (8, 0.75), "camera-click": (4, 0.55), "flick": (3, 0.45),
       "mouse-click": (2, 0.6), "ding": (4, 0.5), "music-box": (12, 1.0)}
EXT = {"hitech-click": "wav", "music-box": "wav"}

src, dst = sys.argv[1], sys.argv[2]
cues = json.load(open("assets/cues.json", encoding="utf-8"))
parts = json.load(open("assets/parts.json", encoding="utf-8"))
B = json.load(open("tools/beats.json", encoding="utf-8"))
P = {p["id"]: p for p in parts}
W = cues["words"]
TALK = cues["duration"]
norm = lambda s: s.lower().strip().strip('.,?!"“”')


def at(spec):
    pid, word, nth, off = (list(spec) + [0, 0])[:4]
    if word is None:
        return P[pid]["start"] + off
    m = [w for w in W if w["part"] == pid and norm(w["word"]) == norm(word)]
    return m[nth]["start"] + off


ev = []  # (name, hit seconds, volume, extra)
add = lambda name, hit, vol=None, **kw: ev.append((name, hit, SFX[name][1] if vol is None else vol, kw))

# The body of the film carries huashu's own effects (OM.sfx, in the render); the house library only
# brands the outro: the music box lands on The Returning Soul logo (user, 2026-11-05).
add("music-box", TALK + 1.0, fade=(1.6, 2.0))

inputs, chains = ["-i", src], []
for k, (name, hit, vol, kw) in enumerate(ev):
    peak = 0 if kw.get("peak0") else SFX[name][0] / FPS
    start = max(0.0, hit - peak)
    trim = kw.get("trim", 0.0)
    inputs += ["-i", f"assets/sfx/{name}.{EXT.get(name, 'mp3')}"]
    f = f"[{k + 1}:a]aresample=48000,aformat=channel_layouts=stereo"
    if trim:
        f += f",atrim=start={trim:.3f},asetpts=PTS-STARTPTS"
    if "fade" in kw:
        a, b = kw["fade"]
        f += f",afade=t=out:st={a:.3f}:d={b - a:.3f},atrim=end={b:.3f}"
    f += f",volume={vol:.3f},adelay={int(start * 1000)}:all=1[s{k}]"
    chains.append(f)
n = len(ev)
chains.append(f"[0:a]aresample=48000,aformat=channel_layouts=stereo[v]")
chains.append("[v]" + "".join(f"[s{k}]" for k in range(n)) + f"amix=inputs={n + 1}:duration=first:normalize=0[mix]")
tmp = dst.replace(".mp4", "-premaster.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(chains), "-map", "[mix]", tmp], check=True)

# two-pass loudness, a limiter for the AAC overshoot
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
j = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
      f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-i", tmp, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                "-af", ln + ",aresample=48000,volume=1.6dB,alimiter=limit=0.6:level=false:attack=1:release=60:asc=1",
                "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", dst], check=True)
print(f"{n} sfx mixed -> {dst}")
for name, hit, vol, _ in sorted(ev, key=lambda e: e[1]):
    print(f"  {hit:7.2f}s  {name:<13} {vol:.2f}")
