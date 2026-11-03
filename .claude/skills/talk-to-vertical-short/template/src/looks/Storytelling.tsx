// storytelling: three cards across the top, a black-box title and a white subtitle, all landing together, over one
// continuous take with TikTok-style captions. One `story` per stretch (show it with <During>).
import { Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ClipData } from "../data/clips";
import { WordCaps } from "./captions";
import { ClipSeries, E, HOUSE, formatNumber, mix, parseNumber, ramp, rich, sec } from "./core";
import { Grade } from "../Overlays";
import { TrackedVideo } from "../TrackedVideo";

export type StoryCard =
  | { type: "image"; src: string }
  | { type: "cover"; image?: string; text: string; cta?: string }
  | { type: "stat"; label: string; value: string; unit?: string; ring?: number; at?: number; countFor?: number }
  | { type: "comments"; title?: string; rows: [string, string][] }
  | { type: "text"; big: string; small?: string };
export type Story = { from: number; to: number; cards: [StoryCard, StoryCard, StoryCard]; title: string[]; subtitle?: string };

const DOTS = ["#f87171", "#60a5fa", "#fbbf24", "#4ade80", "#a78bfa"];

/** carousel cover card (4:5): photo, dark fade, big uppercase text (*word* yellow), small CTA */
export const Cover: React.FC<{ w: number; image?: string; text: string; cta?: string; drift?: number }> = ({ w, image, text, cta = "SWIPE →", drift = 0 }) => {
  const s = w / 280;
  return (
    <div style={{ width: w, height: w * 1.25, position: "relative", overflow: "hidden", borderRadius: 10 * s, background: image ? "#222" : "linear-gradient(160deg,#2b2b2e,#111)", translate: `0 ${drift}px` }}>
      {image && <Img src={staticFile(image)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.72) 100%)" }} />
      <div style={{ position: "absolute", left: 14 * s, right: 14 * s, bottom: 38 * s, font: `${29 * s}px/0.98 'Archivo Black'`, color: "#fff", textTransform: "uppercase", letterSpacing: "-.01em", textAlign: "center", textShadow: `0 ${2 * s}px ${8 * s}px rgba(0,0,0,.45)` }}>
        {rich(text, { fontStyle: "normal", color: "#FFD400" })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 14 * s, textAlign: "center", font: `700 ${10 * s}px Inter`, color: "#fff", letterSpacing: ".12em" }}>{cta}</div>
    </div>
  );
};

const Card: React.FC<{ k: StoryCard; f: number; from: number; dur: number }> = ({ k, f, from, dur }) => {
  if (k.type === "image") return <Img src={staticFile(k.src)} style={{ width: 296, height: 296, objectFit: "cover" }} />;
  if (k.type === "cover") return <Cover w={296} image={k.image} text={k.text} cta={k.cta} drift={-60 * ramp(f, sec(0.1), dur - sec(0.1), E.lin)} />;
  if (k.type === "stat") {
    const num = parseNumber(k.value);
    const t = ramp(f, (k.at ?? from + sec(0.15)) - from, sec(k.countFor ?? 1.6), E.out2);
    return (
      <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", font: "700 26px Inter", color: "#8a8a8a", letterSpacing: ".04em" }}>{k.label}</div>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: "absolute", left: 58, top: 82 }}>
          <circle cx="90" cy="90" r="78" fill="none" stroke="#eee" strokeWidth="12" />
          <circle cx="90" cy="90" r="78" fill="none" stroke={HOUSE.red} strokeWidth="12" strokeLinecap="round" strokeDasharray="490" strokeDashoffset={490 * (1 - (k.ring ?? 0.75) * t)} transform="rotate(-90 90 90)" />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 132, textAlign: "center", font: "800 56px/1 Inter", color: "#111", letterSpacing: "-.02em" }}>{num ? formatNumber(Math.round(num[0] * t), num[1]) : k.value}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 192, textAlign: "center", font: "600 22px Inter", color: "#8a8a8a" }}>{k.unit}</div>
      </>
    );
  }
  if (k.type === "comments")
    return (
      <>
        <div style={{ padding: "22px 22px 8px", textAlign: "center", font: "700 24px Inter", color: "#111" }}>{k.title ?? "Comments"}</div>
        {k.rows.slice(0, 4).map(([h, tx], q) => (
          <div key={q} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 18px" }}>
            <i style={{ width: 40, height: 40, borderRadius: "50%", flex: "none", background: DOTS[q % DOTS.length] }} />
            <div>
              <div style={{ font: "500 16px/1.1 Inter", color: "#8a8a8a" }}>{h} · 1m</div>
              <div style={{ font: "800 23px/1.1 Inter", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{tx}</div>
            </div>
          </div>
        ))}
      </>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 20, textAlign: "center", height: "100%" }}>
      <div style={{ font: "800 84px/1 Inter", color: "#111", letterSpacing: "-.03em" }}>{k.big}</div>
      <div style={{ font: "600 24px/1.2 Inter", color: "#8a8a8a" }}>{k.small}</div>
    </div>
  );
};

const Top: React.FC<{ s: Story }> = ({ s }) => {
  const f = useCurrentFrame();
  // everything lands together, in one beat
  const a = ramp(f, 1, sec(0.32), E.back(1.8));
  const land: React.CSSProperties = { opacity: ramp(f, 1, sec(0.2)), scale: String(mix(0.7, 1, a)), translate: `0 ${mix(24, 0, a)}px` };
  const y0 = 528;
  return (
    <>
      {s.cards.map((k, i) => (
        <div key={i} style={{ position: "absolute", top: 212, left: [78, 392, 706][i], width: 296, height: 296, borderRadius: 28, background: "#fff", overflow: "hidden", boxShadow: "0 20px 44px rgba(0,0,0,.38)", ...land }}>
          <Card k={k} f={f} from={s.from} dur={s.to - s.from} />
        </div>
      ))}
      {s.title.map((line, n) => (
        <div key={n} style={{ position: "absolute", left: 0, width: 1080, top: y0 + n * 100, textAlign: "center", ...land }}>
          <span style={{ display: "inline-block", background: "#000", color: "#fff", font: "800 72px/1 Inter", letterSpacing: "-.03em", padding: "12px 26px 16px", borderRadius: 16 }}>{line}</span>
        </div>
      ))}
      {s.subtitle && (
        <div style={{ position: "absolute", left: 0, width: 1080, top: y0 + s.title.length * 100 + 12, textAlign: "center", ...land }}>
          <span style={{ display: "inline-block", background: "#fff", color: "#111", font: "700 42px/1 Inter", letterSpacing: "-.01em", padding: "9px 18px 12px", borderRadius: 10 }}>{s.subtitle}</span>
        </div>
      )}
    </>
  );
};

/** the house framing (face-tracked / locked crop, camera moves) as the base under a look */
export const HouseCut: React.FC<{ volume?: (clip: ClipData) => ((f: number) => number) | undefined }> = ({ volume }) => (
  <ClipSeries>{(clip) => (<><TrackedVideo clip={clip} volume={volume?.(clip)} /><Grade /></>)}</ClipSeries>
);

export const Storytelling: React.FC<{ stories: Story[]; captionTop?: number; volume?: (clip: ClipData) => ((f: number) => number) | undefined }> = ({ stories, captionTop = 1385, volume }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: "#000" }}>
    <HouseCut volume={volume} />
    {stories.map((s, i) => (
      <Sequence key={i} name={`Story ${i + 1}`} from={s.from} durationInFrames={s.to - s.from}>
        <Top s={s} />
      </Sequence>
    ))}
    <WordCaps top={captionTop} maxw={3} maxc={15} style={{ font: "700 74px/1.05 'TikTok Sans'", color: "#fff", letterSpacing: "-.01em", WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textShadow: "0 5px 12px rgba(0,0,0,.35)" }} />
  </div>
);
