// stickers: transparent cut-outs (or short text) with a white die-cut outline that pop in over the wide framing when
// he names the thing, float, and pop out. They live in the light wall above his head (y ~120-640), never on his face.
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import type { ClipData } from "../data/clips";
import { BottomFade, E, HOUSE, mix, ramp, WideCut } from "./core";

export type StickerSpec = {
  at: number; // frame it lands (put it ~3f before the word)
  dur: number;
  x: number; // centre
  y: number;
  /** a picture in public/ ... */
  src?: string;
  width?: number;
  /** ... or a text sticker */
  text?: string;
  color?: string;
  tilt?: number;
};

// white outline: stacked hard drop-shadows round the alpha edge, then a soft shadow
export const OUTLINE = [0, 45, 90, 135, 180, 225, 270, 315]
  .map((a) => `drop-shadow(${(7 * Math.cos((a * Math.PI) / 180)).toFixed(1)}px ${(7 * Math.sin((a * Math.PI) / 180)).toFixed(1)}px 0 #fff)`)
  .join(" ");
export const SHADOW = "drop-shadow(0 14px 18px rgba(0,0,0,.35))";

export const Sticker: React.FC<{ s: StickerSpec }> = ({ s }) => {
  const f = useCurrentFrame();
  if (f < s.at - 1 || f >= s.at + s.dur) return null;
  const tilt = s.tilt ?? 0;
  const inT = ramp(f, s.at - 1, 9, E.back(2.6));
  const out = ramp(f, s.at + s.dur - 7, 7, E.in3);
  const scale = mix(0.2, 1, inT) * mix(1, 0.3, out);
  const rot = mix(tilt - 14, tilt, ramp(f, s.at - 1, 12, E.back(1.8))) + 1.6 * Math.sin((f - s.at) / 11);
  const bob = 5 * Math.sin((f - s.at) / 14);
  const w = s.width ?? 340;
  return (
    <div style={{ position: "absolute", left: s.x, top: s.y + bob, translate: "-50% -50%", rotate: `${rot}deg`, scale: String(scale), opacity: 1 - out, filter: `${OUTLINE} ${SHADOW}`, zIndex: 12 }}>
      {s.src ? (
        <Img src={staticFile(s.src)} style={{ width: w, display: "block" }} />
      ) : (
        <div style={{ padding: "14px 30px 18px", borderRadius: 22, background: s.color ?? HOUSE.red, color: "#fff", font: "900 64px/1 Montserrat", letterSpacing: ".02em", whiteSpace: "nowrap" }}>
          {s.text}
        </div>
      )}
    </div>
  );
};

/** the wide framing with stickers over it (the house captions go on top, from the composition) */
export const StickerCut: React.FC<{ stickers: StickerSpec[]; volume?: (clip: ClipData) => ((f: number) => number) | undefined }> = ({ stickers, volume }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <WideCut volume={volume} />
    <BottomFade />
    {stickers.map((s, i) => <Sticker key={i} s={s} />)}
  </AbsoluteFill>
);
