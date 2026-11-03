// The five photographic styles (shape-shift, picture-stack, scene-switch, visual-notes, orbit-reel). Upstream they are
// silent 4.2 s templates; here each is a segment [from, to) over the cut, its timings stretched to the segment
// (`at(1.5)` = 1.5 s into a 4.2 s segment), with his voice kept. Cut-out styles need public/cutout (cutout_clips.py).
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import type { ClipData } from "../data/clips";
import { BottomFade, E, HOUSE, mix, ramp, Scaled, sec, WideCut } from "./core";

type Vol = { volume?: (clip: ClipData) => ((f: number) => number) | undefined };
type Seg = { from: number; to: number };
type Box = { left: number; top: number; width: number };
const BASE = 4.2;
/** template seconds -> frames inside this segment, stretched to its length */
const timing = ({ from, to }: Seg) => (s: number) => from + ((to - from) * s) / BASE;
const quiet: React.CSSProperties = { position: "absolute", left: 120, width: 820, textAlign: "center", font: "600 49px/1.1 'TikTok Sans'", color: "#fff", WebkitTextStroke: "4px #141414", paintOrder: "stroke fill", zIndex: 25 };
const Voice: React.FC<Vol> = ({ volume }) => <AbsoluteFill style={{ opacity: 0 }}><WideCut volume={volume} /></AbsoluteFill>;
const Presenter: React.FC<{ box: Box }> = ({ box }) => <Scaled {...box}><WideCut cutout /><BottomFade /></Scaled>;
const cover = (src: string, style: React.CSSProperties = {}) => <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />;

/** shape-shift: circular subjects matched at one anchor (a 620 px circle), cutting every `every` seconds over the
 * speaker established below. Give each photo the crop that puts its round subject in the circle (objectPosition/zoom). */
export const ShapeShift: React.FC<Vol & Seg & {
  photos: { src: string; bg: string; objectPosition?: string; zoom?: number }[];
  eyebrow: string; headline: string; footer: string; ink?: string; every?: number; presenter?: Box;
}> = ({ from, to, photos, eyebrow, headline, footer, ink = "#352314", every = 0.9, presenter = { left: 90, top: 550, width: 900 }, volume }) => {
  const f = useCurrentFrame();
  const t = timing({ from, to });
  const i = Math.floor((f - from) / (t(every) - from)) % photos.length;
  const p = photos[i];
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <Voice volume={volume} />
      <div style={{ position: "absolute", left: 210, top: 390, width: 620, height: 620, overflow: "hidden", borderRadius: "50%", scale: String(mix(0.9, 1, ramp(f, from, t(0.48) - from, E.out3))) }}>
        {cover(p.src, { objectPosition: p.objectPosition ?? "50% 50%", scale: String(p.zoom ?? 1) })}
      </div>
      <div style={{ position: "absolute", left: 120, top: 240, font: "500 25px Inter", letterSpacing: 4, textTransform: "uppercase", color: ink, zIndex: 20 }}>{eyebrow}</div>
      <div style={{ position: "absolute", left: 120, top: 300, font: "900 92px/.98 Montserrat", letterSpacing: -2, color: ink, zIndex: 15 }}>{headline}</div>
      <div style={{ position: "absolute", left: 0, top: 1110, width: 1080, height: 810, background: "#202a26" }} />
      <Presenter box={presenter} />
      <div style={{ position: "absolute", left: 120, top: 1420, zIndex: 20, font: "800 50px Montserrat", color: "#eee9db" }}>{footer}</div>
      <div style={{ position: "absolute", right: 160, top: 1440, zIndex: 20, font: "26px Inter", color: "#d4d4b8", letterSpacing: 4 }}>
        {String(i + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};

/** picture-stack: three photos collect above his head in the room, then two leave and the third takes focus */
export const PictureStack: React.FC<Vol & Seg & { photos: [string, string, string]; captions: [string, string] }> = ({ from, to, photos, captions, volume }) => {
  const f = useCurrentFrame();
  const t = timing({ from, to });
  const r = (a: number, d: number, e = E.out2) => ramp(f, t(a), t(a + d) - t(a), e);
  const drift = r(0.7, 1.5, E.inOut1), out = r(2.05, 0.28, E.in2), focus = r(2.05, 0.5, E.inOut3);
  const frame: React.CSSProperties = { position: "absolute", overflow: "hidden", border: "3px solid #f3efe7" };
  return (
    <AbsoluteFill style={{ background: "#171917" }}>
      <WideCut volume={volume} />
      <BottomFade />
      <div style={{ ...frame, left: 138, top: 275, width: 244, height: 320, rotate: `${mix(-5, -3, drift)}deg`, translate: `${mix(10 * drift, -70, out)}px 0`, opacity: 1 - out }}>{cover(photos[0])}</div>
      <div style={{ ...frame, left: 410, top: 250, width: 250, height: 330, rotate: "3deg", opacity: r(0.24, 0.25) * (1 - out), translate: `${-60 * out}px ${mix(24, 0, r(0.24, 0.25))}px` }}>{cover(photos[1])}</div>
      <div style={{ ...frame, left: 683, top: 305, width: 248, height: 238, rotate: `${mix(mix(-3, 0, drift), 0, focus)}deg`, opacity: r(0.48, 0.25), translate: `${mix(-8 * drift, -280, focus)}px ${mix(mix(24, 0, r(0.48, 0.25)), 20, focus)}px`, scale: String(mix(1, 1.42, focus)) }}>{cover(photos[2])}</div>
      <div style={{ ...quiet, top: 1120 }}>{f >= t(2.22) ? captions[1] : captions[0]}</div>
    </AbsoluteFill>
  );
};

/** scene-switch: sharp full-frame photos change behind the continuously visible cut-out (at 1/3 and 2/3) */
export const SceneSwitch: React.FC<Vol & Seg & { scenes: [string, string, string]; captions: [string, string]; presenter?: Box }> = ({
  from, to, scenes, captions, presenter = { left: -80, top: 200, width: 1240 }, volume,
}) => {
  const f = useCurrentFrame();
  const t = timing({ from, to });
  const k = f >= t(2.8) ? 2 : f >= t(1.4) ? 1 : 0;
  const z = [mix(1.02, 1.08, ramp(f, from, t(1.4) - from, E.lin)), mix(1.06, 1, ramp(f, t(1.4), t(2.8) - t(1.4), E.lin)), mix(1, 1.04, ramp(f, t(2.8), to - t(2.8), E.lin))][k];
  return (
    <AbsoluteFill>
      <Voice volume={volume} />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>{cover(scenes[k], { scale: String(z) })}</div>
      <Presenter box={presenter} />
      <div style={{ ...quiet, top: 1350, fontSize: 56 }}>{k === 2 ? captions[1] : captions[0]}</div>
    </AbsoluteFill>
  );
};

/** visual-notes: the whole image first, then (at 1.5 s) a close-up of one real detail in an orange frame */
export const VisualNotes: React.FC<Vol & Seg & {
  image: string; detail: { left: number; top: number; width: number; height: number }; tag: [string, string]; callout: React.ReactNode; note: string; presenter?: Box;
}> = ({ from, to, image, detail, tag, callout, note, presenter = { left: 30, top: 430, width: 1000 }, volume }) => {
  const f = useCurrentFrame();
  const t = timing({ from, to });
  const shrink = ramp(f, t(1.5), t(1.88) - t(1.5), E.inOut2), iris = ramp(f, t(1.5), t(1.92) - t(1.5), E.out3);
  const call = ramp(f, t(1.85), t(2.1) - t(1.85)), pan = ramp(f, t(2.1), t(3.4) - t(2.1), E.inOut1);
  return (
    <AbsoluteFill style={{ background: "#101210" }}>
      <Voice volume={volume} />
      <div style={{ position: "absolute", left: 135, top: 240, font: "500 25px Inter", letterSpacing: 3, color: "#c7ccbe" }}>{f >= t(1.85) ? tag[1] : tag[0]}</div>
      <div style={{ position: "absolute", left: 215, top: 310, width: 650, height: 550, overflow: "hidden", border: "2px solid #d9dbc8", background: "#e8e4dc", scale: String(mix(1, 0.92, shrink)), opacity: mix(1, 0.25, shrink) }}>
        {cover(image, { objectFit: "contain" })}
      </div>
      <div style={{ position: "absolute", left: 235, top: 345, width: 590, height: 490, border: `3px solid ${HOUSE.yellow}`, overflow: "hidden", zIndex: 3, opacity: iris, scale: String(mix(0.65, 1, iris)) }}>
        <Img src={staticFile(image)} style={{ position: "absolute", maxWidth: "none", ...detail, translate: `${-18 * pan}px ${8 * pan}px`, scale: String(mix(1, 1.08, pan)) }} />
      </div>
      <div style={{ position: "absolute", left: 166, top: 845, width: 750, textAlign: "center", font: "500 37px Inter", color: "#dfdccc", opacity: call, translate: `0 ${mix(14, 0, call)}px` }}>{callout}</div>
      <Presenter box={presenter} />
      <div style={{ ...quiet, top: 1410, fontSize: 54 }}>{note}</div>
    </AbsoluteFill>
  );
};

/** orbit-reel: portrait cards travel round him on a 3D ellipse (570 px wide, 290 px deep), behind his head and
 * across the foreground. Projected by hand: cards with z < 0 are drawn under the cut-out, the rest over it. */
export const OrbitReel: React.FC<Vol & Seg & { cards: string[]; title: [string, string]; speed?: number; centerY?: number; fit?: "cover" | "contain"; ink?: string }> = ({
  from, to, cards, title, speed = 36, centerY = 1010, fit = "cover", ink, volume,
}) => {
  const f = useCurrentFrame();
  const PERSP = 1400, OX = 540, OY = 900;
  const n = Math.max(cards.length, 8);
  const pos = Array.from({ length: n }, (_, i) => {
    const th = ((10.3 + (360 / n) * i + speed * ((f - from) / 30)) * Math.PI) / 180;
    const x = 540 + 570 * Math.cos(th), y = centerY + 185 * Math.sin(th), z = 290 * Math.sin(th);
    const k = PERSP / (PERSP - z);   // perspective from (540, 900)
    return { i, z, sx: OX + (x - OX) * k, sy: OY + (y - OY) * k, k, ry: -24 * Math.cos(th), rz: -3 * Math.cos(th) };
  });
  const card = (p: (typeof pos)[number]) => (
    <div key={p.i} style={{ position: "absolute", left: p.sx - 110, top: p.sy - 180, width: 220, height: 360, border: "3px solid #f6f0e5", borderRadius: 17, overflow: "hidden", background: "#dfd9d0", boxShadow: "0 5px 12px #0003", scale: String(p.k), transform: `perspective(1400px) rotateY(${p.ry}deg) rotateZ(${p.rz}deg)` }}>
      {cover(cards[p.i % cards.length], fit === "contain" ? { objectFit: "contain", padding: 18, boxSizing: "border-box" } : {})}
    </div>
  );
  const sorted = [...pos].sort((a, b) => a.z - b.z);
  return (
    <AbsoluteFill style={{ background: "#171917" }}>
      <WideCut volume={volume} />
      {sorted.filter((p) => p.z < 0).map(card)}
      <WideCut cutout />
      <BottomFade />
      {sorted.filter((p) => p.z >= 0).map(card)}
      <div style={{ position: "absolute", left: 140, top: 240, width: 800, textAlign: "center", zIndex: 6, font: "700 65px/1.18 'TikTok Sans'", color: ink ?? "#fff", textShadow: ink ? "none" : "0 2px 3px #000a" }}>
        {title[0]}
        <div style={{ display: "block", width: "max-content", margin: "8px auto 0", background: "#fff", color: "#121412", textShadow: "none", padding: "0 12px 5px" }}>{title[1]}</div>
      </div>
    </AbsoluteFill>
  );
};

export const PHOTO_SECONDS = sec(BASE);
