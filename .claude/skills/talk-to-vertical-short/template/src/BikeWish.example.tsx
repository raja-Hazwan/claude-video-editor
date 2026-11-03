// Example story scene (maza-blindbox-long); copy to src/BikeWish.tsx and swap the pictures / beats for your talk.
// "ingat dapat basikal, tengok-tengok dapat bola je": a cursor clicks the blind box, a cartoon avatar dreams of the
// bike in a thought bubble, the box shakes and pops open, out comes a small ball, the bubble bursts, his face falls.
// Lives in the wall above the speaker (y 120-640), over StickerCut's wide framing.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { E, HOUSE, mix, ramp } from "./looks/core";
import { OUTLINE, SHADOW } from "./looks/Stickers";

export type BikeWishBeats = { click: number; dream: number; shake: number; open: number; end: number };

const BOX = { x: 720, y: 430, w: 270 };
const AV = { x: 230, y: 470 };

const pop = (f: number, at: number, dur = 9) => ramp(f, at, dur, E.back(2.6));

const Cursor: React.FC<{ f: number; b: BikeWishBeats }> = ({ f, b }) => {
  const m = ramp(f, b.click - 16, 14, E.inOut2);
  const gone = ramp(f, b.click + 14, 8);
  if (f < b.click - 18 || gone >= 1) return null;
  const press = f >= b.click - 1 && f < b.click + 3 ? 0.8 : 1;
  return (
    <svg viewBox="0 0 24 24" style={{ position: "absolute", left: mix(1000, BOX.x + 30, m), top: mix(700, BOX.y + 10, m), width: 70, height: 70, zIndex: 20, scale: String(press), opacity: 1 - gone, filter: "drop-shadow(0 4px 6px rgba(0,0,0,.4))" }}>
      <path d="M5 2.5v17.2l4.6-4.3 2.9 6.6 3-1.3-2.9-6.5h6.3z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
};

/** a round yellow face on red shoulders; `sad` 0 = hopeful grin, 1 = let down */
const Avatar: React.FC<{ sad: number; look: number }> = ({ sad, look }) => (
  <svg viewBox="0 0 240 260" width={240} height={260} style={{ display: "block" }}>
    <path d="M30 260 C 30 190, 210 190, 210 260 Z" fill={HOUSE.red} />
    <circle cx="120" cy="110" r="92" fill={HOUSE.yellow} stroke={HOUSE.ink} strokeWidth="7" />
    {/* eyes glance at the box (look), droop when sad */}
    <ellipse cx={88 + 8 * look} cy={98 + 6 * sad} rx="11" ry={mix(15, 8, sad)} fill={HOUSE.ink} />
    <ellipse cx={152 + 8 * look} cy={98 + 6 * sad} rx="11" ry={mix(15, 8, sad)} fill={HOUSE.ink} />
    {/* brows tilt down at the sides when sad */}
    <path d={`M70 ${70 - 4 * (1 - sad)} L104 ${70 + 10 * sad}`} stroke={HOUSE.ink} strokeWidth="7" strokeLinecap="round" opacity={sad} />
    <path d={`M136 ${70 + 10 * sad} L170 ${70 - 4 * (1 - sad)}`} stroke={HOUSE.ink} strokeWidth="7" strokeLinecap="round" opacity={sad} />
    {/* mouth: grin -> frown */}
    <path d={`M78 ${146 + 4 * sad} Q120 ${mix(190, 120, sad)} 162 ${146 + 4 * sad}`} fill="none" stroke={HOUSE.ink} strokeWidth="8" strokeLinecap="round" />
    {/* sweat drop */}
    <path d="M196 64 C 186 84, 192 96, 200 96 C 208 96, 214 84, 204 64 Z" fill="#7cc6ff" stroke={HOUSE.ink} strokeWidth="4" opacity={sad} />
  </svg>
);

export const BikeWish: React.FC<{ b: BikeWishBeats }> = ({ b }) => {
  const f = useCurrentFrame();
  if (f < b.click - 20 || f >= b.end) return null;
  const outAll = ramp(f, b.end - 8, 8, E.in3);
  const boxIn = pop(f, b.click - 20);
  const shake = f >= b.shake && f < b.open ? 6 * Math.sin((f - b.shake) * 1.9) : 0;
  const clickBump = f >= b.click && f < b.click + 6 ? mix(0.9, 1, ramp(f, b.click, 6, E.back(3))) : 1;
  const opened = ramp(f, b.open, 8, E.back(2));
  const avIn = pop(f, b.click + 2, 10);
  const dreamIn = pop(f, b.dream, 10);
  const dreamOut = ramp(f, b.open + 4, 7, E.in3);
  const ball = ramp(f, b.open, 14, E.back(1.6));
  const sad = ramp(f, b.open + 6, 10, E.inOut2);
  const bob = (k: number) => 4 * Math.sin((f - b.click) / 12 + k);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 12, opacity: 1 - outAll }}>
      {/* the blind box: lid flips up when it opens */}
      <div style={{ position: "absolute", left: BOX.x, top: BOX.y + bob(0), translate: "-50% -50%", rotate: `${shake + mix(-12, 4, boxIn)}deg`, scale: String(mix(0.2, 1, boxIn) * clickBump), filter: `${OUTLINE} ${SHADOW}` }}>
        <Img src={staticFile("popups/blindbox.png")} style={{ width: BOX.w, display: "block", translate: `0 ${mix(0, 26, opened)}px`, scale: String(mix(1, 0.92, opened)) }} />
      </div>
      {/* the small ball rising out of it */}
      {f >= b.open && (
        <div style={{ position: "absolute", left: BOX.x, top: mix(BOX.y, BOX.y - 190, ball), translate: "-50% -50%", scale: String(mix(0.2, 1, ball)), rotate: `${mix(-30, 6, ball)}deg`, filter: `${OUTLINE} ${SHADOW}`, zIndex: 3 }}>
          <Img src={staticFile("stickers/ball.png")} style={{ width: 120, display: "block" }} />
        </div>
      )}
      {f >= b.open + 10 && (
        <div style={{ position: "absolute", left: BOX.x - 260, top: BOX.y - 190, translate: "-50% -50%", rotate: "-6deg", scale: String(pop(f, b.open + 10)), filter: `${OUTLINE} ${SHADOW}`, zIndex: 4 }}>
          <div style={{ padding: "10px 22px 14px", borderRadius: 18, background: HOUSE.red, color: "#fff", font: "900 46px/1 Montserrat", whiteSpace: "nowrap" }}>BOLA JE?!</div>
        </div>
      )}
      {/* avatar */}
      <div style={{ position: "absolute", left: AV.x, top: AV.y + bob(1), translate: "-50% -50%", scale: String(mix(0.2, 0.9, avIn)), filter: `${OUTLINE} ${SHADOW}` }}>
        <Avatar sad={sad} look={ramp(f, b.open, 8)} />
      </div>
      <Cursor f={f} b={b} />
      {/* thought bubble with the bike */}
      {f >= b.dream && dreamOut < 1 && (
        <>
          {[[AV.x + 70, AV.y - 150, 18], [AV.x + 105, AV.y - 195, 26]].map(([x, y, r], i) => (
            <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: "#fff", boxShadow: "0 6px 14px rgba(0,0,0,.25)", scale: String(pop(f, b.dream + 2 * i) * (1 - dreamOut)) }} />
          ))}
          <div style={{ position: "absolute", left: AV.x + 230, top: AV.y - 300 + bob(2), translate: "-50% -50%", width: 330, height: 230, borderRadius: "50%", background: "#fff", overflow: "hidden", boxShadow: "0 14px 30px rgba(0,0,0,.3)", scale: String(mix(0.2, 1, dreamIn) * mix(1, 1.25, dreamOut)), opacity: 1 - dreamOut, display: "grid", placeItems: "center" }}>
            <Img src={staticFile("popups/basikal.png")} style={{ width: 260, display: "block", mixBlendMode: "multiply" }} />
          </div>
        </>
      )}
    </div>
  );
};
