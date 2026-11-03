"""Copy popup assets from assets_to_insert/ into public/popups/ with clean names, cropped to the subject.

Usage (from the project folder): python <skill>/scripts/prep_popups.py [scripts/popups.json]

popups.json lists one entry per asset (see template/popups.example.json):
  {"name": "kereta", "file": "scene04_mainan/car.png"}                     transparent: cropped to its alpha bounds
  {"name": "bola_je", "file": "scene08/small ball.jpg", "crop": [l,t,r,b]}  photo: crop box in source pixels
  {"name": "unboxing", "file": "scene04_mainan/unboxing.mp4"}               clip: copied as-is (trim + mute it first)
Stills are saved as <name>.png, upscaled so the short side is >= 600 px. Originals are left untouched.
Re-run after replacing any asset."""
import json, os, shutil, sys
from PIL import Image

A, OUT = "assets_to_insert", "public/popups"

def alpha_crop(im, pad=12):
    box = im.getchannel("A").getbbox()
    if not box or box == (0, 0, im.width, im.height):
        return im
    l, t, r, b = box
    return im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))

def save(name, im, min_side=600):
    s = min_side / min(im.size)
    if s > 1:  # small cut-outs: upscale once here so the browser doesn't blur them
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(f"{OUT}/{name}.png")
    print(name, im.size)

def main():
    sys.stdout.reconfigure(encoding="utf-8")
    spec = sys.argv[1] if len(sys.argv) > 1 else "scripts/popups.json"
    os.makedirs(OUT, exist_ok=True)
    for p in json.load(open(spec, encoding="utf-8")):
        src = f"{A}/{p['file']}"
        ext = os.path.splitext(src)[1].lower()
        if ext in (".mp4", ".webm", ".mov"):
            shutil.copy(src, f"{OUT}/{p['name']}{ext}")
            print(f"{p['name']}{ext}")
            continue
        im = Image.open(src)
        if "crop" in p:
            im = im.convert("RGB").crop(tuple(p["crop"]))
        elif im.mode in ("RGBA", "LA", "P"):
            im = alpha_crop(im.convert("RGBA"))
        else:
            im = im.convert("RGB")
        save(p["name"], im)

if __name__ == "__main__":
    main()
