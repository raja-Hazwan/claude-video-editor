// Example (maza-blindbox-long, export 08) — the HOUSE REEL: stickers + split-screen alternating by section, house
// captions on top. Copy to src/Reel.tsx (with Looks.timeline-example.tsx -> src/Looks.tsx, BikeWish.example.tsx ->
// src/BikeWish.tsx), register <ReelComposition /> in Root.tsx, then rewrite SECTIONS / SPLIT / STICKERS for your talk.
// One reel over the whole approved cut (same length as export 07), alternating two looks per section of the talk:
// hook / anak / bola / basikal = stickers over the wide framing · gharar-tikam / yasir / boleh / closer = split-screen.
// No orbit (carousel), no explainer panel, no behind-the-person post panel (user, 2026-11-03). Captions: house captions.
import { Audio } from "@remotion/media";
import { AbsoluteFill, Composition, interpolate, Sequence, staticFile } from "remotion";
import { BikeWish, type BikeWishBeats } from "./BikeWish";
import { Captions } from "./Captions";
import { closerVolume, End, endCard, P, STEPS } from "./Looks";
import { Flash } from "./Overlays";
import { StickerCut, type StickerSpec } from "./looks/Stickers";
import { ClipSeries, During, HOUSE } from "./looks/core";
import { SplitScreen, type SplitStep } from "./looks/SplitScreen";
import { end, START, TOTAL_FRAMES, word } from "./timeline";

type Section = { look: "sticker" | "split"; from: number; to: number };
export const SECTIONS: Section[] = [
  { look: "sticker", from: 0, to: START.gharar },
  { look: "split", from: START.gharar, to: START.anak },
  { look: "sticker", from: START.anak, to: START.yasir },
  { look: "split", from: START.yasir, to: START.bola },
  { look: "sticker", from: START.bola, to: START.boleh },
  { look: "split", from: START.boleh, to: START.basikal },
  { look: "sticker", from: START.basikal, to: START.closer },
  { look: "split", from: START.closer, to: TOTAL_FRAMES },
];
// caption top per look: on his chest in the wide framing, under his face in the split's bottom half
const CAPTION_TOP = { sticker: 1390, split: 1500 };
const lookAt = (f: number) => SECTIONS.find((s) => f >= s.from && f < s.to)?.look ?? "split";

// gharar + tikam as one step (the reasons it is haram)
const SEBAB: SplitStep = { from: START.gharar, to: START.anak, badge: "Sebabnya", headline: "Kenapa *haram*?", visual: { type: "checklist", bar: "blind box", items: [
  { text: "Ada *gharar*: tidak jelas", at: word("gharar", "gharar") },
  { text: "Ada *maisir*: judi", at: word("gharar", "maisir") },
  { text: "Macam *tikam*", at: word("tikam", "tikam") },
  { text: "Ulama *sepakat* haram", at: word("tikam", "sepakat") },
] } };
const SPLIT: SplitStep[] = [
  SEBAB,
  { ...STEPS[4], badge: "Pengecualian" },
  { ...STEPS[6], badge: "Boleh" },
  { ...STEPS[8], to: TOTAL_FRAMES },
];
// stickers land 3f before the word, in the wall above his head: left (x 280) / centre (540) / right (800)
const st = (at: number, dur: number, x: number, y: number, rest: Partial<StickerSpec>): StickerSpec => ({ at: at - 3, dur, x, y, ...rest });
const STICKERS: StickerSpec[] = [
  // hook
  st(word("hook", "blind"), 140, 540, 330, { src: P("blindbox"), width: 360, tilt: -5 }),
  st(word("hook_2", "isi"), 90, 540, 560, { text: "TAK TAHU ISI?", tilt: 3 }),
  st(word("hook_4", "barang"), 120, 260, 360, { src: P("kereta"), width: 330, tilt: -7 }),
  st(word("hook_4", "barang") + 10, 110, 820, 340, { src: P("patung"), width: 230, tilt: 6 }),
  st(word("hook_4", "tak"), 80, 540, 560, { text: "TAK TAHU", tilt: -3 }),
  st(word("hook_5", "sah"), 70, 540, 380, { text: "TAK SAH", tilt: -4 }),
  // anak
  st(word("anak", "mainan-mainan"), 100, 540, 340, { src: P("blindbox"), width: 340, tilt: 5 }),
  st(word("anak", "kereta"), 110, 260, 360, { src: P("kereta"), width: 330, tilt: -6 }),
  st(word("anak", "patung"), 100, 820, 330, { src: P("patung"), width: 230, tilt: 6 }),
  st(word("anak", "haram"), 50, 540, 420, { text: "HARAM", tilt: -5 }),
  // bola
  st(word("bola", "bola"), 150, 540, 340, { src: P("bola_kotak"), width: 330, tilt: -4 }),
  st(word("bola", "merah"), 190, 540, 360, { src: P("bola_merah_biru"), width: 470, tilt: 3 }),
  st(word("bola", "tetap"), 110, 540, 380, { text: "BOLA TETAP BOLA", color: HOUSE.ink, tilt: -3 }),
  st(word("bola", "reda"), 120, 540, 380, { text: "KITA REDA", tilt: 4 }),
  st(word("bola_2", "harganya"), 150, 540, 380, { text: "HARGA SAMA", color: HOUSE.ink, tilt: -4 }),
];

// basikal: click the box, dream of the bike, the box opens, just a small ball
const BIKE: BikeWishBeats = { click: word("basikal", "ingat"), dream: word("basikal", "basikal") - 3, shake: word("basikal", "tengok-tengok"), open: word("basikal_2", "bola") - 3, end: START.closer };

const S: React.FC<{ hit: number; peak: number; dur: number; src: string; volume: number | ((f: number) => number); trimBefore?: number }> = ({ hit, peak, dur, src, volume, trimBefore }) => (
  <Sequence from={Math.max(0, hit - peak)} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${src}`)} volume={volume} trimBefore={trimBefore} />
  </Sequence>
);
const fade = (a: number, b: number) => (f: number) => interpolate(f, [a, b], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// Flash only where content is skipped (as in 07); the other look changes are hard cuts on a jump cut.
const FLASH_AT = [START.gharar, START.anak, START.boleh, START.closer];

const ReelSfx: React.FC = () => (
  <>
    <S hit={0} peak={0} dur={60} src="drop.mp3" trimBefore={18} volume={(f) => 0.22 * fade(30, 60)(f)} />
    {/* look changes: a different whoosh each */}
    <S hit={START.gharar} peak={14} dur={30} src="woosh2.mp3" volume={0.4} />
    <S hit={START.anak} peak={9} dur={30} src="woosh3.mp3" volume={0.45} />
    <S hit={START.yasir} peak={3} dur={20} src="fastwoosh.mp3" volume={0.35} />
    <S hit={START.bola} peak={14} dur={30} src="woosh2.mp3" volume={0.35} />
    <S hit={START.boleh} peak={3} dur={20} src="fastwoosh.mp3" volume={0.4} />
    <S hit={START.closer} peak={17} dur={45} src="woosh.mp3" volume={0.4} />
    {/* checklist items landing, panel highlights */}
    <S hit={word("gharar", "gharar")} peak={8} dur={30} src="hitech-click.wav" volume={0.7} />
    <S hit={word("gharar", "maisir")} peak={4} dur={12} src="camera-click.mp3" volume={0.5} />
    <S hit={word("tikam", "tikam")} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S hit={word("tikam", "sepakat")} peak={26} dur={75} src="drop.mp3" volume={(f) => 0.28 * fade(45, 75)(f)} />
    <S hit={word("anak", "haram")} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S hit={word("yasir", "yasir")} peak={8} dur={30} src="hitech-click.wav" volume={0.7} />
    <S hit={word("yasir_2", "utama")} peak={4} dur={12} src="camera-click.mp3" volume={0.5} />
    <S hit={word("bola", "reda")} peak={3} dur={10} src="flick.mp3" volume={0.45} />
    <S hit={word("boleh", "boleh")} peak={8} dur={30} src="hitech-click.wav" volume={0.7} />
    <S hit={word("boleh", "boleh")} peak={4} dur={30} src="ding.mp3" volume={0.5} />
    <S hit={BIKE.click} peak={2} dur={10} src="mouse-click.mp3" volume={0.5} />
    <S hit={BIKE.dream} peak={2} dur={10} src="pop.mp3" volume={0.4} />
    <S hit={BIKE.open} peak={2} dur={10} src="pop.mp3" volume={0.5} />
    <S hit={BIKE.open + 10} peak={4} dur={30} src="ding.mp3" volume={0.3} />
    <S hit={word("closer", "haram")} peak={4} dur={12} src="camera-click.mp3" volume={0.55} />
    <S hit={word("closer", "perjudian")} peak={50} dur={53} src="riser.mp3" volume={0.3} />
    {STICKERS.map((k, i) => <S key={`pop${i}`} hit={k.at + 3} peak={2} dur={10} src="pop.mp3" volume={0.4} />)}
    <S hit={end("closer", -90 + 28)} peak={12} dur={60} src="music-box.wav" volume={(f) => fade(48, 60)(f)} />
  </>
);

export const BlindBoxReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    {SECTIONS.filter((s) => s.look === "sticker").map((s) => (
      <During key={s.from} from={s.from} to={s.to}><StickerCut stickers={STICKERS} volume={closerVolume} /><BikeWish b={BIKE} /></During>
    ))}
    {SECTIONS.filter((s) => s.look === "split").map((s) => (
      <During key={s.from} from={s.from} to={s.to}><SplitScreen steps={SPLIT} seam={false} volume={closerVolume} /></During>
    ))}
    {/* house captions, per clip, placed for the look on screen; none under the end card */}
    <Sequence durationInFrames={endCard}>
      <ClipSeries>{(clip) => <Captions words={clip.words} durationInFrames={clip.frames} top={CAPTION_TOP[lookAt(START[clip.id as keyof typeof START])]} />}</ClipSeries>
    </Sequence>
    <End />
    {FLASH_AT.map((f) => (
      <Sequence key={f} from={f - 3} durationInFrames={10}><Flash /></Sequence>
    ))}
    <ReelSfx />
  </AbsoluteFill>
);

export const ReelComposition = () => (
  <Composition id="BlindBoxReel" component={BlindBoxReel} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
);
