// Example (maza-blindbox-long): the blind-box talk in the reel looks over the whole approved cut. Copy to src/Looks.tsx and rewrite the steps/segments for your talk. Timing from timeline.ts only.
import { Composition, interpolate, Sequence } from "remotion";
import { CLIPS, type ClipData } from "./data/clips";
import { EndCard } from "./Overlays";
import { AbsoluteFill } from "remotion";
import { BehindThePerson, type BehindSegment } from "./looks/BehindThePerson";
import { During, WideCut } from "./looks/core";
import { Explainer, type ExplainerSegment } from "./looks/Explainer";
import { SplitScreen, type SplitStep } from "./looks/SplitScreen";
import { end, START, TOTAL_FRAMES, word } from "./timeline";

export const END_CARD = 90;
export const endCard = end("closer", -END_CARD);
// speech fades out under the end card (as in the house cut)
export const closerVolume = (clip: ClipData) =>
  clip.id === "closer"
    ? (f: number) => interpolate(f, [CLIPS.closer.frames - END_CARD, CLIPS.closer.frames - END_CARD + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : undefined;

export const P = (f: string) => `popups/${f}.png`;
export const TOYS = ["blindbox", "kereta", "patung", "bola_kotak", "basikal", "bola_je", "bola_merah_biru", "tikam"].map(P);

export const STEPS: SplitStep[] = [
  { from: 0, to: START.gharar, badge: "Soalan", headline: "Beli *blind box*?", visual: { type: "checklist", bar: "apa hukumnya?", items: [
    { text: "Tak tahu *isi*", at: word("hook_2", "isi") },
    { text: "Apa sahaja *barang*", at: word("hook_4", "barang") },
    { text: "*Tak sah* jual beli", at: word("hook_5", "sah") },
  ] } },
  { from: START.gharar, to: START.tikam, badge: "Langkah 1", headline: "Ada *gharar* & maisir", visual: { type: "checklist", bar: "kenapa haram?", items: [
    { text: "*Gharar*: tidak jelas", at: word("gharar", "gharar") },
    { text: "*Maisir*: iaitu judi", at: word("gharar", "maisir") },
  ] } },
  { from: START.tikam, to: START.anak, badge: "Langkah 2", headline: "Macam *tikam*", visual: { type: "image", src: P("tikam"), bar: "untung nasib", scroll: 40 } },
  { from: START.anak, to: START.yasir, badge: "Langkah 3", headline: "Mainan dalam *kotak*", visual: { type: "grid-pick", search: "nasib dapat apa?", images: TOYS, pick: 1, pickAt: word("anak", "kereta"), scroll: 0 } },
  { from: START.yasir, to: START.bola, badge: "Langkah 4", headline: "Kecuali yang *sedikit*", visual: { type: "checklist", bar: "gharar yasir", items: [
    { text: "Gharar *yasir*: sedikit", at: word("yasir", "yasir") },
    { text: "Benda *utama* kita tahu", at: word("yasir_2", "utama") },
  ] } },
  { from: START.bola, to: START.boleh, badge: "Contoh", headline: "Bola *merah* atau biru", visual: { type: "image", src: P("bola_merah_biru"), bar: "warna je tak tahu", scroll: 0 } },
  { from: START.boleh, to: START.basikal, badge: "Hukumnya", headline: "*Boleh*", visual: { type: "checklist", bar: "gharar yasir", items: [
    { text: "Bola tetap *bola*", at: word("boleh", "boleh") },
    { text: "Gharar *sedikit*", at: word("boleh", "sedikit") },
  ] } },
  { from: START.basikal, to: START.closer, badge: "Tapi", headline: "Ingat *basikal*…", visual: { type: "grid-pick", search: "dapat apa?", images: [P("basikal"), P("bola_je"), P("blindbox"), P("kereta"), P("patung"), P("bola_kotak"), P("tikam"), P("bola_merah_biru")], pick: 1, pickAt: word("basikal_2", "bola"), scroll: 0 } },
  { from: START.closer, to: endCard, badge: "Hukumnya", headline: "Tak tahu isi? *Haram*", visual: { type: "checklist", bar: "hukumnya", items: [
    { text: "Benda dalam *kotak*", at: word("closer", "benda") },
    { text: "*Tak tahu* isinya", at: word("closer", "tak") },
    { text: "Hukumnya *haram*", at: word("closer", "haram") },
    { text: "Termasuk *maisir*", at: word("closer", "maisir") },
  ] } },
];

export const End = () => (
  <Sequence name="End card" from={endCard} durationInFrames={END_CARD}>
    <EndCard durationInFrames={END_CARD} message="Tak tahu isinya? Haram." sub="Kecuali gharar yang sedikit (yasir)." speaker="S.S. Dato' Dr. MAZA" source="PROmedia Tajdid" />
  </Sequence>
);

export const BlindBoxSteps: React.FC = () => (
  <>
    <SplitScreen steps={STEPS} volume={closerVolume} />
    <End />
  </>
);

// ---------------------------------------------------------------- Depth: behind-the-person + explainer, by section
export const GRID = { type: "grid" as const, images: TOYS, tabs: ["Blind box", "Mainan", "Hadiah"] };
export const BEHIND: BehindSegment[] = [
  { from: 0, to: START.gharar, panel: { ...GRID, highlight: { index: 0, at: word("hook", "blind"), label: "Tak tahu isi?", labelAt: word("hook_2", "isi") } },
    chest: [
      { text: "blind box", at: word("hook", "blind") }, { text: "apa hukum?", at: word("hook_2", "tak") },
      { text: "apa sahaja", at: word("hook_4", "semualah") }, { text: "tak tahu", at: word("hook_4", "tak") }, { text: "tak sah", at: word("hook_5", "sah") },
    ] },
  { from: START.anak, to: START.yasir, panel: { ...GRID, highlight: { index: 0, at: word("anak", "mainan-mainan"), slides: [P("kereta"), P("patung")], swipeAt: [word("anak", "kereta"), word("anak", "patung")], label: "Haram", labelAt: word("anak", "haram") } },
    chest: [
      { text: "mainan dalam kotak", at: word("anak", "mainan-mainan") }, { text: "kereta?", at: word("anak", "kereta") },
      { text: "anak patung?", at: word("anak", "patung") }, { text: "haram", at: word("anak", "haram") },
    ] },
  { from: START.bola, to: START.boleh, panel: { type: "grid", images: [P("bola_kotak"), P("bola_merah_biru"), P("bola_je"), P("blindbox"), P("kereta"), P("patung")], tabs: ["Bola", "Warna", "Harga"], highlight: { index: 1, at: word("bola", "merah"), label: "Merah / biru", labelAt: word("bola", "biru") } },
    chest: [
      { text: "beli bola", at: word("bola", "beli") }, { text: "warna apa?", at: word("bola", "warna") }, { text: "merah", at: word("bola", "merah") },
      { text: "biru", at: word("bola", "biru") }, { text: "bola tetap bola", at: word("bola", "tetap") }, { text: "kita reda", at: word("bola", "reda") },
      { text: "harga sama", at: word("bola_2", "harganya") },
    ] },
  { from: START.closer, to: endCard, panel: { ...GRID, highlight: { index: 0, at: word("closer", "benda"), slides: [P("kereta"), P("patung")], swipeAt: [word("closer", "kotak"), word("closer", "tahu")], label: "Haram", labelAt: word("closer", "haram") } },
    chest: [
      { text: "dalam kotak", at: word("closer", "benda") }, { text: "tak tahu", at: word("closer", "tak") }, { text: "haram", at: word("closer", "haram") },
      { text: "tak boleh beli", at: word("closer", "kita") }, { text: "maisir", at: word("closer", "maisir") }, { text: "perjudian", at: word("closer", "perjudian") },
    ] },
];
export const EXPLAIN: ExplainerSegment[] = [
  { from: START.gharar, to: START.anak, title: "Kenapa *haram*?", visual: { type: "list", items: [
    { text: "Ada *gharar*: tidak jelas", at: word("gharar", "gharar") },
    { text: "Ada *maisir*: judi", at: word("gharar", "maisir") },
    { text: "Macam *tikam*", at: word("tikam", "tikam") },
    { text: "Ulama *sepakat* haram", at: word("tikam", "sepakat") },
  ] } },
  { from: START.yasir, to: START.bola, title: "Kecuali *yasir*", visual: { type: "list", items: [
    { text: "Gharar yang *sedikit*", at: word("yasir", "sedikit") },
    { text: "Benda *utama* kita tahu", at: word("yasir_2", "utama") },
  ] } },
  { from: START.boleh, to: START.closer, title: "Boleh atau *haram*?", visual: { type: "compare",
    left: { label: "Gharar yasir", big: "Bola\n*merah / biru*", small: "boleh: yang utama kita tahu", at: word("boleh", "boleh") },
    right: { label: "Tak tahu isi", big: "Ingat\n*basikal*", small: "tengok-tengok, bola je", at: word("basikal", "ingat"), revealAt: word("basikal_2", "bola") },
    arrowAt: word("basikal", "tapi") } },
];
export const KEYS = ["gharar", "maisir", "yasir", "haram", "boleh", "basikal", "bola"];

export const BlindBoxDepth: React.FC = () => (
  <>
    {BEHIND.map((s, i) => (
      <During key={`b${i}`} from={s.from} to={s.to}><BehindThePerson segments={[s]} volume={closerVolume} /></During>
    ))}
    {EXPLAIN.map((s, i) => (
      <During key={`e${i}`} from={s.from} to={s.to}><Explainer segments={[s]} keys={KEYS} volume={closerVolume} /></During>
    ))}
    <End />
  </>
);

export const LooksCompositions = () => (
  <>
    {/* alignment check: cut-out over red, the base ghosted on top (misalignment shows as a double edge) */}
    <Composition id="CutoutCheck" component={() => (
      <AbsoluteFill style={{ backgroundColor: "#d00" }}><WideCut cutout /><AbsoluteFill style={{ opacity: 0.35 }}><WideCut /></AbsoluteFill></AbsoluteFill>
    )} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BlindBoxDepth" component={BlindBoxDepth} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="BlindBoxSteps" component={BlindBoxSteps} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
