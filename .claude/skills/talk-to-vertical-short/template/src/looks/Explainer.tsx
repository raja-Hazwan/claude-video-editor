// explainer: the speaker sits low in a rounded panel on a light backdrop, his head breaking out over its top edge
// (the cut-out above the panel), and the top of the frame explains the point: a before -> after compare or a list.
import { Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { ClipData } from "../data/clips";
import { WordCaps } from "./captions";
import { BottomFade, E, HOUSE, mix, ramp, rich, Scaled, sec, WideCut } from "./core";

const ACC = HOUSE.redDk;
type Side = { label?: string; at?: number; images?: string[]; swipeAt?: number[]; chip?: string; chipAt?: number; big?: string; small?: string; image?: string };
export type ExplainerVisual =
  | { type: "compare"; left: Side; right: Side & { revealAt?: number }; arrowAt?: number }
  | { type: "list"; items: { text: string; at: number }[] };
export type ExplainerSegment = { from: number; to: number; title: string; visual: ExplainerVisual };

const SC = 0.82, VX = 97, VY = 316, PB = 1830;
const VW = 1080 * SC;
const em = { font: "900 64px/1 Montserrat", fontStyle: "normal", color: ACC };

const TextCard: React.FC<{ big: string; small?: string; dark?: boolean }> = ({ big, small, dark }) => (
  <div style={{ width: 270, height: 338, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 24, textAlign: "center", background: dark ? HOUSE.ink : "#fff", color: dark ? "#fff" : "#111" }}>
    <div style={{ font: "800 64px/1 Inter", letterSpacing: "-.03em" }}>{rich(big, em)}</div>
    <div style={{ font: "600 24px/1.25 Inter", color: dark ? "rgba(255,255,255,.6)" : "#6f6f6f" }}>{small}</div>
  </div>
);

const lab: React.CSSProperties = { position: "absolute", font: "800 25px Inter", letterSpacing: ".12em", textTransform: "uppercase", color: "#6f6f6f", whiteSpace: "nowrap" };

const Compare: React.FC<{ v: Extract<ExplainerVisual, { type: "compare" }>; f: number; from: number; dur: number }> = ({ v, f, from, dur }) => {
  const L = v.left, R = v.right;
  const la = (L.at ?? from + sec(0.3)) - from;
  const ra = (R.at ?? from + dur * 0.55) - from;
  const aa = v.arrowAt !== undefined ? v.arrowAt - from : ra + sec(0.6);
  const rv = R.revealAt !== undefined ? R.revealAt - from : aa + sec(0.28);
  const lIn = ramp(f, la, sec(0.32));
  const rIn = ramp(f, ra, sec(0.3));
  const imgs = (L.images ?? []).slice(0, 3);
  const sw = (L.swipeAt ?? []).slice(0, Math.max(0, imgs.length - 1)).reduce((n, t) => n + ramp(f, t - from, sec(0.3), E.inOut2), 0);
  const reveal = ramp(f, rv, sec(0.34));
  return (
    <>
      <div style={{ ...lab, left: 110, top: 340, opacity: lIn, translate: `0 ${mix(30, 0, lIn)}px`, color: f >= ra ? "#111" : "#6f6f6f" }}>{L.label ?? "Before"}</div>
      <div style={{ ...lab, left: 700, top: 340, color: ACC, opacity: rIn, translate: `0 ${mix(30, 0, rIn)}px` }}>{R.label ?? "After"}</div>
      <div style={{ position: "absolute", left: 110, top: 385, width: 270, height: 338, borderRadius: 12, overflow: "hidden", boxShadow: "0 18px 40px rgba(40,30,20,.25)", opacity: lIn, translate: `0 ${mix(30, 0, lIn)}px` }}>
        {imgs.length ? (
          <div style={{ display: "flex", translate: `${-270 * sw}px 0` }}>{imgs.map((s, k) => <Img key={k} src={staticFile(s)} style={{ width: 270, height: 338, objectFit: "cover", flex: "none" }} />)}</div>
        ) : <TextCard big={L.big ?? ""} small={L.small} />}
        {L.chip && f >= (L.chipAt ?? from + la + sec(0.8)) - from && (
          <div style={{ position: "absolute", left: 12, top: 12, padding: "6px 13px", borderRadius: 10, background: HOUSE.red, color: "#fff", font: "800 24px Inter", scale: String(ramp(f, (L.chipAt ?? from + la + sec(0.8)) - from, sec(0.22), E.back(2.5))) }}>{L.chip}</div>
        )}
      </div>
      {f >= ra && reveal < 1 && (
        <div style={{ position: "absolute", left: 700, top: 385, width: 270, height: 338, borderRadius: 12, border: "4px dashed #b5b5b5", display: "grid", placeItems: "center", font: "800 80px Inter", color: "#c4c4c4", opacity: rIn, translate: `0 ${mix(30, 0, rIn)}px` }}>?</div>
      )}
      <div style={{ position: "absolute", left: 700, top: 385, clipPath: `inset(0 ${100 - 100 * reveal}% 0 0)`, scale: String(mix(1.06, 1, ramp(f, rv, sec(0.4)))) }}>
        {R.big && !R.image ? <TextCard big={R.big} small={R.small} dark /> : R.image ? <Img src={staticFile(R.image)} style={{ width: 270, height: 338, objectFit: "cover", borderRadius: 12 }} /> : null}
      </div>
      <svg viewBox="0 0 320 120" style={{ position: "absolute", left: 380, top: 470, width: 320, height: 120, overflow: "visible" }}>
        <path d="M14 64 C 100 -12, 220 -12, 304 60" fill="none" stroke={ACC} strokeWidth="7" strokeLinecap="round" strokeDasharray="420" strokeDashoffset={420 * (1 - ramp(f, aa, sec(0.38), E.inOut2))} />
        <path d="M296.0 31.1 L304 60 L274.2 56.6" fill="none" stroke={ACC} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity={f >= aa + sec(0.34) ? 1 : 0} />
      </svg>
    </>
  );
};

const List: React.FC<{ v: Extract<ExplainerVisual, { type: "list" }>; f: number; from: number }> = ({ v, f, from }) => {
  const rh = Math.min(118, Math.floor(420 / Math.max(1, v.items.length)));
  return (
    <div style={{ position: "absolute", left: 120, top: 330 + Math.floor((430 - rh * v.items.length) / 2), width: 840 }}>
      {v.items.map((it, i) => {
        const a = ramp(f, it.at - from, sec(0.32), E.back(1.6));
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, height: rh, font: "800 46px/1.05 Montserrat", color: "#111", letterSpacing: "-.02em", opacity: a, translate: `${mix(-40, 0, a)}px 0` }}>
            <b style={{ width: 72, height: 72, borderRadius: 20, background: ACC, color: "#fff", display: "grid", placeItems: "center", font: "800 38px Inter", flex: "none" }}>{i + 1}</b>
            <span>{rich(it.text, { fontWeight: 900, fontStyle: "normal", color: ACC })}</span>
          </div>
        );
      })}
    </div>
  );
};

const Top: React.FC<{ seg: ExplainerSegment }> = ({ seg }) => {
  const f = useCurrentFrame();
  const words = seg.title.split(" ");
  const dur = seg.to - seg.from;
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 206, textAlign: "center", font: "900 80px/1 Montserrat", color: "#111", letterSpacing: "-.02em" }}>
        {words.map((w, k) => (
          <span key={k} style={{ display: "inline-block", opacity: ramp(f, sec(0.07 * k), sec(0.3)), translate: `0 ${mix(40, 0, ramp(f, sec(0.07 * k), sec(0.3)))}px` }}>
            {rich(w, { fontStyle: "normal", color: ACC })}
            {k < words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
      {seg.visual.type === "compare" ? <Compare v={seg.visual} f={f} from={seg.from} dur={dur} /> : <List v={seg.visual} f={f} from={seg.from} />}
    </>
  );
};

/** eyeY: the eye line in the wide frame (1080 for the wide head-and-shoulders window) = the panel's top edge */
export const Explainer: React.FC<{
  segments: ExplainerSegment[]; eyeY?: number; captionTop?: number; keys?: string[];
  volume?: (clip: ClipData) => ((f: number) => number) | undefined;
}> = ({ segments, eyeY = 1080, captionTop = 1420, keys = [], volume }) => {
  const PT = VY + eyeY * SC;
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%,#f3f2f0 0%,#e9e7e4 70%,#dcdad7 100%)" }}>
      {segments.map((s, i) => (
        <Sequence key={i} name={`Explain ${i + 1}`} from={s.from} durationInFrames={s.to - s.from}>
          <Top seg={s} />
        </Sequence>
      ))}
      <div style={{ position: "absolute", left: VX, top: PT, width: VW, height: PB - PT, borderRadius: 56, overflow: "hidden", boxShadow: "0 30px 70px rgba(40,30,20,.28)" }}>
        <Scaled left={0} top={VY - PT} width={VW}>
          <WideCut volume={volume} />
          <BottomFade />
        </Scaled>
      </div>
      <div style={{ position: "absolute", left: VX, top: VY, width: VW, height: PT - VY, overflow: "hidden" }}>
        <Scaled left={0} top={0} width={VW}>
          <WideCut cutout />
        </Scaled>
      </div>
      <WordCaps
        top={captionTop} keys={keys} maxw={3} maxc={16} pop={[0.94, sec(0.16)]}
        style={{ font: "800 70px/1 Inter", color: "#fff", letterSpacing: "-.02em", textShadow: "0 3px 6px rgba(0,0,0,.55),0 6px 26px rgba(0,0,0,.6)" }}
        keyStyle={{ color: HOUSE.yellow }}
      />
    </div>
  );
};
