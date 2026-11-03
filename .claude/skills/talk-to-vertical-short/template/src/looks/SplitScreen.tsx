// split-screen: visuals in the top half (step badge, serif headline, a window showing the point), the speaker in the
// bottom half, uppercase captions on the seam. One `step` per argument step, over the whole cut.
import { Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SeamCaptions } from "./captions";
import type { ClipData } from "../data/clips";
import { BottomFade, E, mix, ramp, rich, sec, WideCut } from "./core";

const ACC = "#D97757";
const ACC_DK = "#C15F3C";

export type SplitVisual =
  | { type: "checklist"; bar?: string; items: { text: string; at: number }[] }
  | { type: "image"; src: string; bar?: string; scroll?: number }
  | {
      type: "grid-pick"; search?: string; images: string[]; chips?: string[]; chipsAt?: number; pick?: number; pickAt?: number;
      scroll?: number; button?: string; buttonAt?: number; clickAt?: number; fan?: string[];
    };
export type SplitStep = { from: number; to: number; badge?: string; headline: string; visual: SplitVisual };

const Star = () => (
  <svg width="40" height="40" viewBox="0 0 100 100">
    <g stroke="#fff" strokeWidth="11" strokeLinecap="round">
      {Array.from({ length: 12 }, (_, a) => (
        <line key={a} x1="50" y1="50" x2={50 + 42 * Math.cos(a * 0.5236)} y2={50 + 42 * Math.sin(a * 0.5236)} />
      ))}
    </g>
  </svg>
);
const Lens = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
    <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#777" strokeWidth="2.4" />
    <path d="M15.5 15.5l5 5" stroke="#777" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const Window: React.FC<{ bar: string; f: number; children: React.ReactNode }> = ({ bar, f, children }) => (
  <div
    style={{
      position: "absolute", left: 110, top: 410, width: 860, height: 520, borderRadius: 30, background: "#fff", overflow: "hidden",
      boxShadow: "0 30px 70px rgba(60,40,20,.18),0 0 0 1px rgba(0,0,0,.06)",
      translate: `0 ${mix(50, 0, ramp(f, 0, sec(0.4)))}px`, opacity: ramp(f, 0, sec(0.4)),
    }}
  >
    <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 78, display: "flex", alignItems: "center", gap: 10, padding: "0 26px", borderBottom: "1px solid #eee", background: "#fff", zIndex: 3 }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c }} />)}
      <div style={{ marginLeft: 20, flex: 1, height: 46, borderRadius: 23, background: "#f2f0ec", display: "flex", alignItems: "center", padding: "0 22px", font: "500 26px Inter", color: "#555", whiteSpace: "nowrap", overflow: "hidden" }}>
        <Lens />
        {bar}
      </div>
    </div>
    {children}
  </div>
);

const Check = () => (
  <svg viewBox="0 0 24 24" width="34" height="34">
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Checklist: React.FC<{ v: Extract<SplitVisual, { type: "checklist" }>; f: number; from: number }> = ({ v, f, from }) => (
  <Window bar={v.bar ?? "checklist"} f={f}>
    <div style={{ position: "absolute", left: 40, top: 110, right: 40 }}>
      {v.items.map((it, i) => {
        const t = it.at - from;
        const on = f >= t;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, height: 96, font: "600 40px/1.1 Inter", color: "#1d1b18", letterSpacing: "-.01em", opacity: ramp(f, t - sec(0.35), sec(0.3)), translate: `${mix(-30, 0, ramp(f, t - sec(0.35), sec(0.3)))}px 0` }}>
            <div style={{ width: 58, height: 58, borderRadius: 16, border: `4px solid ${on ? ACC : "#d8d2c8"}`, background: on ? ACC : "transparent", display: "grid", placeItems: "center", flex: "none", scale: String(on ? mix(1.25, 1, ramp(f, t, sec(0.25), E.back(3))) : 1) }}>
              <div style={{ opacity: on ? 1 : 0, display: "grid" }}><Check /></div>
            </div>
            <span>{rich(it.text, { font: "italic 400 48px 'Instrument Serif'", color: ACC_DK })}</span>
          </div>
        );
      })}
    </div>
  </Window>
);

const Shot: React.FC<{ v: Extract<SplitVisual, { type: "image" }>; f: number; dur: number }> = ({ v, f, dur }) => (
  <Window bar={v.bar ?? ""} f={f}>
    <Img src={staticFile(v.src)} style={{ position: "absolute", left: 0, top: 78, width: 860, height: "auto", translate: `0 ${-(v.scroll ?? 120) * ramp(f, 0, dur, E.inOut2)}px` }} />
  </Window>
);

const Cursor: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <svg viewBox="0 0 24 24" style={{ position: "absolute", left: 0, top: 0, width: 46, height: 46, zIndex: 9, translate: `${x}px ${y}px`, scale: String(s), filter: "drop-shadow(0 3px 5px rgba(0,0,0,.35))" }}>
    <path d="M5 2.5v17.2l4.6-4.3 2.9 6.6 3-1.3-2.9-6.5h6.3z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

const GridPick: React.FC<{ v: Extract<SplitVisual, { type: "grid-pick" }>; f: number; from: number; dur: number }> = ({ v, f, from, dur }) => {
  const n = Math.min(16, Math.max(8, v.images.length));
  const pick = (v.pick ?? 5) % n;
  const col = pick % 4, row = Math.floor(pick / 4);
  const px = 26 + col * 204, py = 100 + row * 252;
  const pickAt = v.pickAt !== undefined ? v.pickAt - from : Math.min(dur * 0.6, sec(3.36));
  const moveAt = Math.max(sec(0.2), pickAt - sec(0.66));
  const scroll = v.scroll ?? (row >= 1 ? 150 : 0);
  const y = -scroll * ramp(f, 0, moveAt, E.inOut2);
  const picked = f >= pickAt;
  const ba = v.buttonAt !== undefined ? v.buttonAt - from : pickAt + sec(0.6);
  const ca = v.clickAt !== undefined ? v.clickAt - from : ba + sec(0.45);
  const fa = ca + sec(0.12);
  const press = (t: number) => (f >= t - 2 && f < t + 2 ? 0.82 : 1);
  // cursor: in from the corner, onto the pick, then to the button
  const m1 = ramp(f, moveAt, sec(0.55), E.inOut2), m2 = v.button ? ramp(f, ba + 2, sec(0.32), E.inOut2) : 0;
  const cx = mix(mix(900, 110 + px + 120, m1), 640, m2), cy = mix(mix(1000, 410 + py - scroll + 130, m1), 850, m2);
  return (
    <>
      <Window bar={v.search ?? "search"} f={f}>
        <div style={{ position: "absolute", left: 26, top: 100, display: "grid", gridTemplateColumns: "repeat(4,190px)", gap: 14, translate: `0 ${y}px` }}>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} style={{ position: "relative", width: 190, height: 238, borderRadius: 10, overflow: "hidden", background: "#ddd", opacity: picked && i !== pick ? mix(1, 0.35, ramp(f, pickAt, sec(0.25))) : 1, scale: String(i === pick && picked ? mix(1, 1.1, ramp(f, pickAt, sec(0.25), E.back(2))) : 1), zIndex: i === pick ? 4 : 1 }}>
              <Img src={staticFile(v.images[i % v.images.length])} style={{ width: 190, height: 238, objectFit: "cover" }} />
              {v.chips && (
                <div style={{ position: "absolute", left: 10, bottom: 10, padding: "5px 11px", borderRadius: 9, background: "#16a34a", color: "#fff", font: "800 22px Inter", scale: String(ramp(f, (v.chipsAt !== undefined ? v.chipsAt - from : sec(0.6)) + i, sec(0.2), E.back(2.5))) }}>
                  {v.chips[i % v.chips.length]}
                </div>
              )}
            </div>
          ))}
        </div>
        {picked && <div style={{ position: "absolute", left: px - 11, top: py - scroll - 11, width: 212, height: 260, border: `5px solid ${ACC}`, borderRadius: 14, boxShadow: "0 18px 40px rgba(0,0,0,.3)", opacity: ramp(f, pickAt, sec(0.15)) }} />}
      </Window>
      {v.button && f >= ba && (
        <div style={{ position: "absolute", left: 330, top: 820, padding: "20px 34px", borderRadius: 40, background: f >= ca && f < ca + 6 ? ACC : "#1d1b18", color: "#fff", font: "700 32px Inter", whiteSpace: "nowrap", boxShadow: "0 14px 34px rgba(0,0,0,.3)", zIndex: 6, opacity: ramp(f, ba, sec(0.24)), translate: `0 ${mix(20, 0, ramp(f, ba, sec(0.24), E.back(2)))}px` }}>
          {v.button}
        </div>
      )}
      {(v.fan ?? []).slice(0, 3).map((s, k) => {
        const t = ramp(f, fa + k * 2, sec(0.3), E.out3);
        return f >= fa ? (
          <div key={k} style={{ position: "absolute", left: 110 + px, top: 410 + py - scroll, width: 150, height: 188, borderRadius: 10, overflow: "hidden", boxShadow: "0 10px 26px rgba(0,0,0,.28)", zIndex: 5, opacity: t, translate: `${(434 + k * 150 - col * 204) * t}px ${(42 + scroll - row * 252 + k * 40) * t}px`, rotate: `${(-8 + k * 8) * t}deg` }}>
            <Img src={staticFile(s)} style={{ width: 150, height: 188, objectFit: "cover" }} />
          </div>
        ) : null;
      })}
      <Cursor x={cx} y={cy} s={press(pickAt) * (v.button ? press(ca) : 1)} />
    </>
  );
};

const StepPanel: React.FC<{ step: SplitStep }> = ({ step }) => {
  const f = useCurrentFrame();
  const dur = step.to - step.from;
  const v = step.visual;
  const head = (d: number) => ({ opacity: ramp(f, d, sec(0.35)), translate: `0 ${mix(20, 0, ramp(f, d, sec(0.35)))}px` });
  return (
    <>
      {step.badge && (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 206, textAlign: "center", ...head(0) }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 26px 12px 20px", borderRadius: 16, background: ACC, color: "#fff", font: "500 44px/1 'Instrument Serif'", boxShadow: "0 10px 24px rgba(217,119,87,.35)" }}>
            <Star />
            {step.badge}
          </span>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 276, textAlign: "center", font: "400 96px/1 'Instrument Serif'", color: "#1d1b18", letterSpacing: "-.01em", ...head(2) }}>
        {rich(step.headline, { fontStyle: "italic", color: ACC_DK })}
      </div>
      {v.type === "checklist" && <Checklist v={v} f={f} from={step.from} />}
      {v.type === "image" && <Shot v={v} f={f} dur={dur} />}
      {v.type === "grid-pick" && <GridPick v={v} f={f} from={step.from} dur={dur} />}
    </>
  );
};

/** videoTop: moves the wide frame inside the bottom half so the eyes sit ~220-300 px into it (chin above y 1500) */
export const SplitScreen: React.FC<{ steps: SplitStep[]; videoTop?: number; captionTop?: number; volume?: (clip: ClipData) => ((f: number) => number) | undefined }> = ({
  steps, videoTop = -860, captionTop = 918, volume,
}) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: "#000" }}>
    <div style={{ position: "absolute", left: 0, top: 960, width: 1080, height: 960, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: videoTop, width: 1080, height: 1920 }}>
        <WideCut volume={volume} />
        <BottomFade />
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 960, overflow: "hidden", background: "#F4F1EA" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(0,0,0,.08) 1.6px,transparent 1.7px)", backgroundSize: "36px 36px" }} />
      {steps.map((st, i) => (
        <Sequence key={i} name={`Step: ${st.badge ?? i + 1}`} from={st.from} durationInFrames={st.to - st.from}>
          <StepPanel step={st} />
        </Sequence>
      ))}
    </div>
    <SeamCaptions top={captionTop} />
  </div>
);
