// trial-reels: the same stretch packaged three ways, to post as trial reels and keep the best 3-second hold.
// v1 big yellow title + karaoke · v2 white post-card header + punch-in zooms · v3 dark grid, pixel stat, framed clip.
// Render each over the hook with <Stretch> (a composition per version).
import { Img, staticFile, useCurrentFrame } from "remotion";
import type { ClipData } from "../data/clips";
import { Karaoke, WordCaps } from "./captions";
import { bare, E, mix, ramp, rich, sec, WORDS } from "./core";
import { HouseCut } from "./Storytelling";

type Vol = { volume?: (clip: ClipData) => ((f: number) => number) | undefined };

/** v1: the claim as a 3-line title (*line* = bigger), clean karaoke captions */
export const TrialV1: React.FC<Vol & { from: number; title: string[]; captionTop?: number }> = ({ from, title, captionTop = 1400, volume }) => {
  const f = useCurrentFrame() - from;
  const a = ramp(f, 0, sec(0.25), E.back(2));
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#000" }}>
      <HouseCut volume={volume} />
      <div style={{ position: "absolute", left: 0, width: 1080, top: 238, textAlign: "center", font: "900 84px/1.02 'TikTok Sans','Archivo Black'", color: "#FCF000", textShadow: "0 5px 0 rgba(0,0,0,.55),0 0 18px rgba(0,0,0,.4)", textTransform: "uppercase", letterSpacing: "-.01em", opacity: ramp(f, 0, sec(0.15)), scale: String(mix(0.8, 1, a)) }}>
        {title.map((l, i) => <div key={i}>{rich(l, { fontStyle: "normal", fontSize: 118 })}</div>)}
      </div>
      <Karaoke top={captionTop} />
    </div>
  );
};

/** v2: the hook as a post headline under avatar + name; caption keys yellow; punch-ins on `punches` (frames) */
export const TrialV2: React.FC<Vol & {
  from: number; to: number; avatar?: string; name: string; sub?: string; headline: string; keys: string[]; punches?: number[]; captionTop?: number;
}> = ({ from, to, avatar, name, sub, headline, keys, punches, captionTop = 1260, volume }) => {
  const abs = useCurrentFrame();
  const f = abs - from;
  // default punches: the first key words, at least 1.5 s apart, at most 3
  const kb = new Set(keys.map(bare));
  const ps = (punches ?? WORDS.filter((w) => w.f >= from && w.f < to - sec(0.6) && kb.has(bare(w.text))).map((w) => w.f))
    .reduce<number[]>((acc, p) => (acc.length < 3 && (!acc.length || p - acc[acc.length - 1] >= sec(1.5)) ? [...acc, p] : acc), []);
  // slow drift 1.16 -> 1.22; on a punch snap to 1.33 and ease back to 1.2
  let scale = mix(1.16, 1.22, ramp(abs, from, (ps[0] ?? to) - from, E.lin));
  for (const p of ps) {
    if (abs >= p) scale = mix(1.22, 1.33, ramp(abs, p, sec(0.12), E.out2));
    if (abs >= p + sec(0.8)) scale = mix(1.33, 1.2, ramp(abs, p + sec(0.8), sec(0.5), E.inOut2));
  }
  const a = ramp(f, 0, sec(0.3), E.back(1.6));
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#000" }}>
      <div style={{ position: "absolute", inset: 0, scale: String(scale), transformOrigin: "540px 820px" }}>
        <HouseCut volume={volume} />
      </div>
      <div style={{ position: "absolute", left: 110, top: 236, width: 860, padding: "30px 36px", borderRadius: 30, background: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,.35)", opacity: ramp(f, 0, sec(0.2)), translate: `0 ${mix(-40, 0, a)}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          {avatar && <Img src={staticFile(avatar)} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />}
          <div>
            <b style={{ font: "800 30px/1.1 Inter", color: "#111" }}>{name}</b>
            <span style={{ font: "500 25px Inter", color: "#777", display: "block" }}>{sub}</span>
          </div>
        </div>
        <div style={{ font: "700 50px/1.14 Inter", color: "#111", letterSpacing: "-.02em" }}>{headline}</div>
      </div>
      <WordCaps top={captionTop} keys={keys} maxw={2} maxc={18} pop={[1.25, sec(0.12)]} upper
        style={{ font: "900 86px/1 'Archivo Black'", color: "#fff", letterSpacing: "-.01em", WebkitTextStroke: "6px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 rgba(0,0,0,.5)" }}
        keyStyle={{ color: "#FFE14D" }} />
    </div>
  );
};

/** v3: one number or comparison he says, in a pixel font, over the clip in an orange frame with a blinking REC tag */
export const TrialV3: React.FC<Vol & { from: number; stat: string; line: string; pulseAt?: number; captionTop?: number }> = ({ from, stat, line, pulseAt, captionTop = 1330, volume }) => {
  const abs = useCurrentFrame();
  const f = abs - from;
  const SC = 0.78, VW = 1080 * SC, VH = 1920 * SC, FT = 410, FH = 1898 - 410;
  const step = Math.floor(ramp(f, 0, sec(0.24), E.lin) * 4) / 4;
  const pulse = pulseAt !== undefined && abs >= pulseAt && abs < pulseAt + 6 ? (Math.floor((abs - pulseAt) / 3) % 2 ? 1 : 1.18) : 1;
  const fr = ramp(f, 0, sec(0.35));
  return (
    <div style={{ position: "absolute", inset: 0, background: "#121110" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.035) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.035) 2px,transparent 2px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "absolute", left: (1080 - VW) / 2, top: FT, width: VW, height: FH, borderRadius: 40, overflow: "hidden", boxShadow: "0 0 0 3px #D97757,0 30px 80px rgba(0,0,0,.6)", opacity: fr, translate: `0 ${mix(60, 0, fr)}px` }}>
        <div style={{ position: "absolute", left: 0, top: FH - VH, width: 1080, height: 1920, scale: String(SC), transformOrigin: "0 0" }}>
          <HouseCut volume={volume} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 170, textAlign: "center", font: "700 190px/0.9 'Pixelify Sans'", color: "#FF8A4C", letterSpacing: ".01em", opacity: step, translate: `0 ${mix(-16, 0, step)}px` }}>
        <span style={{ display: "inline-block", scale: String(pulse) }}>{stat}</span>
        <small style={{ display: "block", font: "500 52px/1.1 'Pixelify Sans'", color: "#f3efe8", marginTop: 4, letterSpacing: ".02em" }}>{line}</small>
      </div>
      <div style={{ position: "absolute", left: (1080 - VW) / 2 + 28, top: 438, padding: "8px 16px", borderRadius: 10, background: "rgba(0,0,0,.6)", font: "500 30px 'Pixelify Sans'", color: "#FF8A4C", opacity: Math.floor(f / sec(0.25)) % 2 ? 0.2 : 1 }}>● REC</div>
      <Karaoke top={captionTop} maxc={20} size={54} plate={false} font="500 {s}px/1 'Pixelify Sans'" grey="rgba(255,255,255,.35)" shadow="0 3px 10px rgba(0,0,0,.7)" />
    </div>
  );
};
