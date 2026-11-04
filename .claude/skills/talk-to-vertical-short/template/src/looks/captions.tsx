// Caption styles of the reel looks, all fed by WORDS (the approved words on the whole timeline).
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { activeGroup, bare, E, groups, mix, ramp } from "./core";

const lineBox = (top: number): React.CSSProperties => ({ position: "absolute", left: 0, width: 1080, top, textAlign: "center" });

/** split-screen: uppercase pill on the seam, each word brightening as it is said */
export const SeamCaptions: React.FC<{ top?: number }> = ({ top = 918 }) => {
  const f = useCurrentFrame();
  const gs = useMemo(() => groups(4, 16), []);
  const a = activeGroup(gs, f);
  if (!a) return null;
  return (
    <div style={{ ...lineBox(top), zIndex: 20 }}>
      <span
        style={{
          display: "inline-block", padding: "18px 34px 20px", borderRadius: 24, background: "#151515",
          font: "800 66px/1 Inter", letterSpacing: "0.01em", textTransform: "uppercase", whiteSpace: "nowrap",
          boxShadow: "0 12px 30px rgba(0,0,0,.4)", scale: String(mix(0.92, 1, ramp(f, a.start, 4, E.back(2)))),
        }}
      >
        {a.g.map((w, k) => (
          <span key={k} style={{ color: f >= w.f - 1 ? "#fff" : "rgba(255,255,255,.42)" }}>
            {(k ? " " : "") + bare(w.text)}
          </span>
        ))}
      </span>
    </div>
  );
};

/** short word groups (1-3 words) in one style; `keys` words get the key style. Optional pop on each group. */
export const WordCaps: React.FC<{
  top: number;
  style: React.CSSProperties;
  keyStyle?: React.CSSProperties;
  keys?: string[];
  maxw?: number;
  maxc?: number;
  pop?: [number, number];
  upper?: boolean;
  dim?: string;
}> = ({ top, style, keyStyle, keys = [], maxw = 3, maxc = 15, pop, upper, dim }) => {
  const f = useCurrentFrame();
  const gs = useMemo(() => groups(maxw, maxc), [maxw, maxc]);
  const kb = useMemo(() => new Set(keys.map(bare)), [keys]);
  const a = activeGroup(gs, f);
  if (!a) return null;
  const scale = pop ? mix(pop[0], 1, ramp(f, a.start, pop[1], E.back(2))) : 1;
  return (
    <div style={{ ...lineBox(top), ...style, scale: String(scale), zIndex: 20 }}>
      {a.g.map((w, k) => {
        const t = bare(w.text);
        const shown = upper ? t.toUpperCase() : t;
        const c = dim && f < w.f - 1 ? { color: dim } : {};
        return (
          <span key={k} style={{ ...c, ...(kb.has(t) ? keyStyle : {}) }}>
            {(k ? " " : "") + shown}
          </span>
        );
      })}
    </div>
  );
};

/** one-line karaoke: lowercase, words turn from grey to white as they are said, optional dark plate */
export const Karaoke: React.FC<{
  top: number;
  maxc?: number;
  size?: number;
  plate?: boolean;
  font?: string;
  grey?: string;
  white?: string;
  upper?: boolean;
  shadow?: string;
}> = ({ top, maxc = 22, size = 56, plate = true, font = "700 {s}px/1 Inter", grey = "#6f6f6f", white = "#fff", upper, shadow }) => {
  const f = useCurrentFrame();
  const gs = useMemo(() => groups(4, maxc), [maxc]);
  const a = activeGroup(gs, f);
  if (!a) return null;
  return (
    <div style={{ ...lineBox(top), zIndex: 20 }}>
      <span
        style={{
          display: "inline-block", padding: plate ? "14px 24px 16px" : 0, borderRadius: 16,
          background: plate ? "rgba(0,0,0,.88)" : "none", font: font.replace("{s}", String(size)),
          letterSpacing: "-.01em", whiteSpace: "nowrap", textTransform: upper ? "uppercase" : "none", textShadow: shadow,
        }}
      >
        {a.g.map((w, k) => (
          <span key={k} style={{ color: f >= w.f - 1 ? white : grey }}>
            {(k ? " " : "") + bare(w.text)}
          </span>
        ))}
      </span>
    </div>
  );
};

/** dark full-frame base for looks that need one */
export const Dark: React.FC<{ color?: string }> = ({ color = "#000" }) => <AbsoluteFill style={{ backgroundColor: color }} />;
