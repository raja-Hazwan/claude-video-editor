"""Build index.html from tools/film.html + assets/cues.json + assets/parts.json + tools/beats.json.
Run from the huashu project folder: python tools/build.py   (then: om check . / om sound . / om render .)"""
import json

cues = json.load(open("assets/cues.json", encoding="utf-8"))
parts = json.load(open("assets/parts.json", encoding="utf-8"))
beats = json.load(open("tools/beats.json", encoding="utf-8"))
esc = lambda o: json.dumps(o, ensure_ascii=False).replace("</", "<\\/")
data = {"source": "recording:voice.wav", "precision": "words (subtitle engine, corrected)", "offset": 0,
        "duration": cues["duration"], "words": cues["words"], "parts": parts}
html = (open("tools/film.html", encoding="utf-8").read()
        .replace("__CUES__", '<script type="application/json" id="om-cues">' + esc(data) + "</script>")
        .replace("__BEATS__", '<script type="application/json" id="beats">' + esc(beats) + "</script>")
        .replace("__TALK__", f"{cues['duration']:.3f}"))
open("index.html", "w", encoding="utf-8").write(html)
print("index.html", len(html) // 1024, "KB,", len(cues["words"]), "words,", len(parts), "parts,", cues["duration"], "s")
