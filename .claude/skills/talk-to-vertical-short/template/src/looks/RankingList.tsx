// ranking-list: an S-to-F tier table on the speaker's chest; each item pops up when he names it and drops into its
// tier on the verdict. Orange skewed title on top, spoken captions just under the chin. For talks that rank things.
import { Img, staticFile, useCurrentFrame } from "remotion";
import type { ClipData } from "../data/clips";
import { Karaoke } from "./captions";
import { E, mix, ramp, rich, sec } from "./core";
import { HouseCut } from "./Storytelling";

export const TIERS: [string, string][] = [["S", "#FF7F7F"], ["A", "#FFBF7F"], ["B", "#FFDF7F"], ["C", "#BFFF7F"], ["D", "#7FBFFF"], ["E", "#8F8FFF"], ["F", "#FF7FFF"]];
export type RankItem = { name: string; tier: string; pop: number; drop?: number; images?: string[]; icon?: "play"; color?: string };

const SAFE_BOTTOM = 1500;

export const RankingList: React.FC<{
  from: number; title: string; items: RankItem[]; tiers?: [string, string][]; tableTop?: number; itemTop?: number; captionTop?: number; titleColor?: string;
  volume?: (clip: ClipData) => ((f: number) => number) | undefined;
}> = ({ from, title, items, tiers = TIERS, tableTop = 1100, itemTop, captionTop, titleColor = "#F7931E", volume }) => {
  const abs = useCurrentFrame();
  const f = abs - from;
  const TX = 140, TW = 800, RH = 62, TY = tableTop;
  const IY = itemTop ?? TY + 30;
  const CY = captionTop ?? TY - 78;
  const names = tiers.map(([t]) => t);
  const used: Record<string, number> = {};
  const inT = ramp(f, 0, sec(0.3));
  // flash each row when an item lands in it
  const flash = (t: string) => Math.max(0, ...items.filter((it) => it.tier === t).map((it) => {
    const d = (it.drop ?? it.pop + sec(1.1)) + sec(0.34);
    return abs >= d ? 0.9 * (1 - ramp(abs, d, sec(0.5), E.lin)) : 0;
  }));
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#000" }}>
      <HouseCut volume={volume} />
      <div style={{ position: "absolute", left: 0, width: 1080, top: 236, textAlign: "center", font: "italic 800 80px/1.02 Inter", color: titleColor, letterSpacing: "-.01em", textShadow: "0 0 22px rgba(247,147,30,.35),0 3px 10px rgba(0,0,0,.4)", opacity: inT, transform: `translateY(${mix(-30, 0, inT)}px) skewX(-6deg)` }}>
        {rich(title)}
      </div>
      <div style={{ position: "absolute", left: TX, top: TY, width: TW, height: RH * tiers.length + 10, background: "#000", padding: 5, borderRadius: 4, boxShadow: "0 30px 70px rgba(0,0,0,.5)", opacity: inT, translate: `0 ${mix(40, 0, inT)}px` }}>
        {tiers.map(([t, col]) => (
          <div key={t} style={{ position: "relative", height: RH, display: "flex", borderBottom: "3px solid #000" }}>
            <div style={{ width: 76, height: RH - 3, display: "grid", placeItems: "center", font: "800 36px Inter", color: "#111", background: col }}>{t}</div>
            <div style={{ flex: 1, background: "#1c1c1e" }} />
            <div style={{ position: "absolute", left: 76, right: 0, top: 0, bottom: 3, background: "rgba(255,255,255,.18)", opacity: flash(t) }} />
          </div>
        ))}
      </div>
      {items.map((it, n) => {
        const k = used[it.tier] ?? 0;
        used[it.tier] = k + 1;
        const i = names.indexOf(it.tier);
        const sz = Math.max(0.6, Math.min(1, (SAFE_BOTTOM - IY) / 340));   // on a close-up the chest sits low: shrink the card
        const left = 250 + (580 * (1 - sz)) / 2;
        const sx = TX + 5 + 76 + 8 + k * 128, sy = TY + 5 + i * RH + 6, sc = (RH - 15) / 340;
        const drop = it.drop ?? it.pop + sec(1.1);
        if (abs < it.pop) return null;
        const p = ramp(abs, it.pop, sec(0.26), E.back(1.7));
        const d = ramp(abs, drop, sec(0.34), E.in3);
        const col = it.color ?? ["#1d4fb8", "#7a2fb0", "#0f766e", "#b45309", "#be123c"][n % 5];
        const imgs = it.images ?? [];
        return (
          <div key={n} style={{
            position: "absolute", left, top: IY, width: 580, height: 340, borderRadius: 6, overflow: "hidden", transformOrigin: "0 0",
            boxShadow: "0 0 0 4px rgba(255,255,255,.85),0 20px 50px rgba(0,0,0,.5)", background: `radial-gradient(ellipse at 50% 30%,${col} 0%,#0b0b14 100%)`,
            opacity: ramp(abs, it.pop, sec(0.12)), scale: String(mix(mix(0.5 * sz, sz, p), sc, d)),
            translate: `${mix(mix(145 * sz, 0, p), sx - left, d)}px ${mix(mix(85 * sz, 0, p), sy - IY, d)}px`,
          }}>
            {imgs.length >= 2 && imgs.slice(0, 3).map((s, q) => (
              <div key={q} style={{ position: "absolute", top: 34, left: 150 + q * 95, width: 118, height: 148, borderRadius: 7, overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,.5)", rotate: `${(q - 1) * 9}deg`, translate: `0 ${Math.abs(q - 1) * 10}px` }}>
                <Img src={staticFile(s)} style={{ width: 118, height: 148, objectFit: "cover" }} />
              </div>
            ))}
            {imgs.length === 1 && <Img src={staticFile(imgs[0])} style={{ position: "absolute", left: 0, top: 0, width: 580, height: 340, objectFit: "cover" }} />}
            {!imgs.length && it.icon === "play" && (
              <div style={{ position: "absolute", left: 236, top: 40, width: 108, height: 150, borderRadius: 24, border: "7px solid #fff" }}>
                <div style={{ position: "absolute", left: 30, top: 40, borderLeft: "36px solid #fff", borderTop: "22px solid transparent", borderBottom: "22px solid transparent" }} />
              </div>
            )}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: imgs.length === 1 ? 0 : 34, height: imgs.length === 1 ? 150 : undefined, paddingTop: imgs.length === 1 ? 40 : 0, background: imgs.length === 1 ? "linear-gradient(180deg,transparent,rgba(0,0,0,.7))" : undefined, textAlign: "center", font: "72px/1 'Archivo Black'", color: "#FFD93B", letterSpacing: ".01em", textShadow: "0 4px 0 rgba(0,0,0,.35)" }}>
              {it.name}
            </div>
          </div>
        );
      })}
      <Karaoke top={CY} maxc={16} size={50} plate={false} grey="#ffffff" shadow="0 3px 14px rgba(0,0,0,.75)" />
    </div>
  );
};
