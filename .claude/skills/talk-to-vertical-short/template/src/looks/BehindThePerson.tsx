// behind-the-person: a panel BEHIND the speaker (he is cut out and stands in front of it), big words on the chest as
// they are said, an optional profile card that counts up. One `segment` per panel, over the whole cut.
import { Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ClipData } from "../data/clips";
import { BottomFade, E, HOUSE, formatNumber, mix, parseNumber, ramp, sec, WideCut } from "./core";

export type BehindPanel =
  | {
      type: "grid"; images: string[]; tabs?: string[]; scroll?: number; icons?: boolean;
      highlight?: { index: number; at: number; slides?: string[]; swipeAt?: number[]; label?: string; labelAt?: number };
    }
  | { type: "bars"; title?: string; bars: { label: string; value: number; show?: string }[]; highlight?: number; at?: number; color?: string }
  | { type: "image"; src: string; scroll?: number };
export type BehindSegment = {
  from: number; to: number; panel?: BehindPanel; chest: { text: string; at: number }[];
  card?: { avatar: string; name: string; label?: string; count?: string; at: number; countAt?: number; button?: string; pressed?: string; pressAt?: number };
};

const CarIcon = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" style={{ position: "absolute", right: 12, top: 12, filter: "drop-shadow(0 1px 3px rgba(0,0,0,.5))" }}>
    <rect x="7" y="3" width="14" height="14" rx="2.5" fill="none" stroke="#fff" strokeWidth="2" />
    <path d="M4 7v11.5A2.5 2.5 0 0 0 6.5 21H17" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Grid: React.FC<{ p: Extract<BehindPanel, { type: "grid" }>; f: number; from: number; dur: number }> = ({ p, f, from, dur }) => {
  const hl = p.highlight;
  const tabs = p.tabs ?? ["Posts", "Reels", "Tagged"];
  const hi = hl?.index ?? -1;
  const slides = hl?.slides ?? [];
  const ta = hl ? hl.at - from : 0;
  const swipes = (hl?.swipeAt ?? slides.map((_, k) => hl!.at + sec(0.33 + k * 0.6))).slice(0, slides.length).map((t) => t - from);
  const x = (hi % 3) * 287 - 5, y = Math.floor(hi / 3) * 357 - 5;
  const la = hl?.labelAt !== undefined ? hl.labelAt - from : ta + sec(1);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 900, height: 112, display: "flex", alignItems: "center", gap: 46, padding: "0 40px", font: "600 38px Inter", color: "#8d8d8d", zIndex: 2, background: "#0d0d0e" }}>
        {tabs.map((t, k) => k === 0 ? (
          <b key={k} style={{ color: "#fff", fontWeight: 700, position: "relative" }}>{t}<div style={{ position: "absolute", left: 0, right: 0, bottom: -30, height: 4, background: "#fff", borderRadius: 2 }} /></b>
        ) : <span key={k}>{t}</span>)}
      </div>
      <div style={{ position: "absolute", left: 24, top: 124, width: 852, display: "grid", gridTemplateColumns: "repeat(3,278px)", gap: 9, translate: `0 ${-(p.scroll ?? 150) * ramp(f, 0, dur, E.lin)}px` }}>
        {Array.from({ length: 12 }, (_, i) => {
          const strip = [p.images[i % p.images.length], ...(i === hi ? slides : [])];
          const sx = -278 * swipes.reduce((n, t) => n + ramp(f, t, sec(0.32), E.inOut2), 0);
          return (
            <div key={i} style={{ position: "relative", width: 278, height: 348, overflow: "hidden", borderRadius: 6, background: "#222" }}>
              <div style={{ display: "flex", height: 348, translate: i === hi ? `${sx}px 0` : undefined }}>
                {strip.map((s, k) => <Img key={k} src={staticFile(s)} style={{ width: 278, height: 348, objectFit: "cover", flex: "none" }} />)}
              </div>
              {(strip.length > 1 || p.icons !== false) && <CarIcon />}
            </div>
          );
        })}
        {hl && f >= ta && (
          <div style={{ position: "absolute", left: x, top: y, width: 288, height: 358, border: "5px solid #fff", borderRadius: 10, boxShadow: "0 0 0 3px rgba(0,0,0,.4),0 0 40px rgba(255,255,255,.35)", opacity: ramp(f, ta, sec(0.22)), scale: String(mix(1.15, 1, ramp(f, ta, sec(0.22), E.out2))) }} />
        )}
        {hl?.label && f >= la && (
          <div style={{ position: "absolute", left: x + 21, top: y + 305, padding: "6px 14px", borderRadius: 30, background: "#fff", color: "#111", font: "800 26px Inter", opacity: ramp(f, la, sec(0.22)), scale: String(mix(0.6, 1, ramp(f, la, sec(0.22), E.back(2)))), transformOrigin: "0 50%" }}>
            {hl.label}
          </div>
        )}
      </div>
    </>
  );
};

const Bars: React.FC<{ p: Extract<BehindPanel, { type: "bars" }>; f: number; from: number }> = ({ p, f, from }) => {
  const top = Math.max(...p.bars.map((b) => b.value)) || 1;
  const n = p.bars.length;
  const bw = Math.min(150, (780 - (n - 1) * 26) / n);
  const x0 = (900 - (n * bw + (n - 1) * 26)) / 2;
  const t0 = (p.at ?? from + sec(0.3)) - from;
  const hi = p.highlight ?? n - 1;
  return (
    <>
      <div style={{ position: "absolute", left: 44, top: 40, font: "800 46px/1.1 Inter", color: "#fff", letterSpacing: "-.02em" }}>{p.title}</div>
      {p.bars.map((b, i) => {
        const h = (520 * b.value) / top;
        const x = x0 + i * (bw + 26);
        const g = ramp(f, t0 + sec(i * 0.12), sec(0.5));
        return (
          <div key={i}>
            <div style={{ position: "absolute", bottom: 170, left: x, width: bw, height: h, borderRadius: "14px 14px 4px 4px", background: i === hi ? p.color ?? HOUSE.yellow : "rgba(255,255,255,.22)", scale: `1 ${g}`, transformOrigin: "50% 100%" }} />
            <div style={{ position: "absolute", left: x - 20, width: bw + 40, bottom: 170 + h + 12, textAlign: "center", font: "800 40px Inter", color: "#fff", opacity: ramp(f, t0 + sec(i * 0.12 + 0.3), sec(0.3)) }}>{b.show ?? b.value}</div>
            <div style={{ position: "absolute", left: x - 20, width: bw + 40, bottom: 110, textAlign: "center", font: "600 28px Inter", color: "#9a9a9a" }}>{b.label}</div>
          </div>
        );
      })}
    </>
  );
};

const Panel: React.FC<{ p: BehindPanel; from: number; dur: number; top: number; height: number }> = ({ p, from, dur, top, height }) => {
  const f = useCurrentFrame();
  const a = ramp(f, 0, sec(0.42));
  return (
    <div style={{ position: "absolute", left: 90, top, width: 900, height, borderRadius: 44, background: "#0d0d0e", overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,.55),inset 0 0 0 1.5px rgba(255,255,255,.09)", opacity: a, translate: `0 ${mix(60, 0, a)}px`, scale: String(mix(0.96, 1, a)) }}>
      {p.type === "grid" && <Grid p={p} f={f} from={from} dur={dur} />}
      {p.type === "bars" && <Bars p={p} f={f} from={from} />}
      {p.type === "image" && <Img src={staticFile(p.src)} style={{ position: "absolute", left: 0, top: 0, width: 900, height: "auto", translate: `0 ${-(p.scroll ?? 200) * ramp(f, 0, dur, E.lin)}px` }} />}
    </div>
  );
};

const Chest: React.FC<{ seg: BehindSegment; top: number }> = ({ seg, top }) => {
  const f = useCurrentFrame() + seg.from;
  const i = seg.chest.findIndex((w, k) => f >= w.at && f < (seg.chest[k + 1]?.at ?? seg.to));
  if (i < 0) return null;
  const w = seg.chest[i];
  const g = ramp(f, w.at, sec(0.16), E.back(2));
  const count = seg.card?.count ? parseNumber(seg.card.count) : null;
  const ca = seg.card?.countAt ?? w.at;
  const txt = count ? w.text.replace("{count}", formatNumber(Math.round(count[0] * ramp(f, ca, sec(0.62), E.out2)), count[1])) : w.text;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top, textAlign: "center", font: "800 84px/1 Inter", color: "#fff", letterSpacing: "-.02em", textShadow: "0 4px 24px rgba(0,0,0,.55)", scale: String(mix(0.86, 1, g)), translate: `0 ${mix(10, 0, g)}px` }}>
      {txt}
    </div>
  );
};

const Card: React.FC<{ seg: BehindSegment; top: number }> = ({ seg, top }) => {
  const f = useCurrentFrame() + seg.from;
  const c = seg.card!;
  if (f < c.at) return null;
  const a = ramp(f, c.at, sec(0.3), E.back(1.6));
  const count = c.count ? parseNumber(c.count) : null;
  const n = count ? formatNumber(Math.round(count[0] * ramp(f, c.countAt ?? c.at, sec(0.62), E.out2)), count[1]) : "";
  const pressed = c.pressed && f >= (c.pressAt ?? seg.to - sec(0.8));
  return (
    <div style={{ position: "absolute", left: 170, top, width: 740, height: 150, borderRadius: 30, background: "rgba(16,16,18,.9)", boxShadow: "0 20px 50px rgba(0,0,0,.45),inset 0 0 0 1.5px rgba(255,255,255,.1)", display: "flex", alignItems: "center", gap: 24, padding: "0 26px", opacity: a, translate: `0 ${mix(30, 0, a)}px` }}>
      <Img src={staticFile(c.avatar)} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover" }} />
      <div>
        <div style={{ font: "700 38px/1.1 Inter", color: "#fff" }}>{c.name}</div>
        <div style={{ font: "500 27px/1.3 Inter", color: "#9a9a9a" }}>{count && <b style={{ color: HOUSE.yellow }}>+{n} </b>}{c.label ?? ""}</div>
      </div>
      <div style={{ marginLeft: "auto", padding: "16px 30px", borderRadius: 40, background: pressed ? "#2c2c2e" : HOUSE.red, color: "#fff", font: "700 30px Inter" }}>{pressed ? c.pressed : c.button ?? "Follow"}</div>
    </div>
  );
};

export const BehindThePerson: React.FC<{
  segments: BehindSegment[]; panelTop?: number; panelHeight?: number; chestTop?: number; cardTop?: number;
  volume?: (clip: ClipData) => ((f: number) => number) | undefined;
}> = ({ segments, panelTop = 150, panelHeight = 870, chestTop = 1370, cardTop = 1235, volume }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <WideCut volume={volume} />
    {segments.map((s, i) => s.panel && (
      <Sequence key={`p${i}`} name={`Panel ${i + 1}`} from={s.from} durationInFrames={s.to - s.from}>
        <Panel p={s.panel} from={s.from} dur={s.to - s.from} top={panelTop} height={panelHeight} />
      </Sequence>
    ))}
    <WideCut cutout />
    <BottomFade />
    {segments.map((s, i) => (
      <Sequence key={`c${i}`} name={`Chest ${i + 1}`} from={s.from} durationInFrames={s.to - s.from}>
        <Chest seg={s} top={chestTop} />
        {s.card && <Card seg={s} top={cardTop} />}
      </Sequence>
    ))}
  </div>
);
