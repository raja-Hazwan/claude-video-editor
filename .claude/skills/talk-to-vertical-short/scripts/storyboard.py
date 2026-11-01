"""Visual storyboard: render real stills from the composition and lay them out as one self-contained HTML page.

    python storyboard.py <project_dir> <storyboard.json> [out.html]

storyboard.json:
  {"title": "...", "composition": "MazhabShort", "fps": 30, "totalFrames": 2243,
   "notes": ["Dropped: ...", "..."],
   "rows": [{"out": "0:00", "clip": "hook", "source": "0:02.6–0:15.9", "line": "...",
             "frames": [[60, "Hook title"], [240, "Name tag"]],
             "text": "...", "zoom": "...", "sfx": "...", "next": "flash + woosh2"}]}

Stills are rendered from a fresh bundle (out/bundle) into out/storyboard/ at 0.4 scale. Run it after gen_data and
before any full render; show the HTML to the user and wait for approval.
"""
import base64
import html
import json
import os
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")
proj, spec = sys.argv[1], sys.argv[2]
sb = json.load(open(spec, encoding="utf-8"))
out_html = sys.argv[3] if len(sys.argv) > 3 else os.path.join(proj, "out", "storyboard.html")
still_dir = os.path.join(proj, "out", "storyboard")
os.makedirs(still_dir, exist_ok=True)
npx = "npx.cmd" if os.name == "nt" else "npx"

subprocess.run([npx, "remotion", "bundle", "--out-dir=out/bundle"], cwd=proj, check=True, capture_output=True)
frames = sorted({f for r in sb["rows"] for f, _ in r["frames"]})
for f in frames:
    dst = os.path.join("out", "storyboard", f"f{f:05d}.jpg")
    subprocess.run([npx, "remotion", "still", "out/bundle", sb["composition"], dst, f"--frame={f}",
                    "--scale=0.4", "--image-format=jpeg", "--jpeg-quality=82"], cwd=proj, check=True, capture_output=True)
    print("still", f)


def img(f):
    with open(os.path.join(still_dir, f"f{f:05d}.jpg"), "rb") as fh:
        return "data:image/jpeg;base64," + base64.b64encode(fh.read()).decode()


fps = sb.get("fps", 30)
tc = lambda f: f"{int(f / fps) // 60}:{f / fps % 60:04.1f}"
e = html.escape
rows_html = []
for i, r in enumerate(sb["rows"], 1):
    shots = "".join(
        f'<figure><img src="{img(f)}" alt="{e(cap)}"><figcaption><b>{tc(f)}</b> {e(cap)}</figcaption></figure>'
        for f, cap in r["frames"])
    facts = "".join(f"<dt>{k}</dt><dd>{e(r[key])}</dd>" for k, key in
                    [("On screen", "text"), ("Zoom", "zoom"), ("SFX", "sfx"), ("Into next", "next")] if r.get(key))
    rows_html.append(f"""
<section class="row">
  <header><span class="num">{i}</span><span class="out">{e(r['out'])}</span>
    <span class="clip">{e(r['clip'])}</span><span class="src">source {e(r['source'])}</span></header>
  <p class="line">“{e(r['line'])}”</p>
  <div class="shots">{shots}</div>
  <dl>{facts}</dl>
</section>""")

notes = "".join(f"<li>{e(n)}</li>" for n in sb.get("notes", []))
page = f"""<!doctype html><html lang="ms"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(sb['title'])} storyboard</title>
<style>
:root{{--bg:#f6f4ef;--fg:#1b1b1b;--mut:#666;--card:#fff;--line:#e3e0d8;--acc:#E63946;--hi:#FFD60A}}
@media (prefers-color-scheme:dark){{:root{{--bg:#121212;--fg:#eee;--mut:#9a9a9a;--card:#1d1d1d;--line:#2e2e2e}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}}
main{{max-width:1180px;margin:0 auto;padding:24px 16px 64px}}h1{{margin:0 0 4px;font-size:26px}}
.meta{{color:var(--mut);margin:0 0 16px}}ul.notes{{margin:0 0 24px;padding-left:20px;color:var(--mut)}}
.row{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:0 0 16px}}
.row header{{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline}}
.num{{background:var(--acc);color:#fff;border-radius:6px;padding:0 8px;font-weight:700}}
.out{{font-weight:700;font-variant-numeric:tabular-nums}}.clip{{font-weight:700;text-transform:uppercase;letter-spacing:.04em}}
.src{{color:var(--mut)}}.line{{margin:8px 0 12px;font-style:italic}}
.shots{{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}}
figure{{margin:0;flex:0 0 auto;width:180px}}figure img{{width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:8px;display:block;background:#000}}
figcaption{{font-size:12px;color:var(--mut);margin-top:4px}}figcaption b{{color:var(--fg)}}
dl{{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;margin:12px 0 0}}dt{{color:var(--mut)}}dd{{margin:0}}
@media (max-width:600px){{figure{{width:140px}}dl{{grid-template-columns:1fr}}dt{{margin-top:6px}}}}
</style></head><body><main>
<h1>{e(sb['title'])}</h1>
<p class="meta">{len(sb['rows'])} parts · total {tc(sb['totalFrames'])} · 1080×1920 · {fps} fps · frames below are real renders from the composition</p>
<ul class="notes">{notes}</ul>
{''.join(rows_html)}
</main></body></html>"""
with open(out_html, "w", encoding="utf-8") as fh:
    fh.write(page)
print("wrote", out_html)
