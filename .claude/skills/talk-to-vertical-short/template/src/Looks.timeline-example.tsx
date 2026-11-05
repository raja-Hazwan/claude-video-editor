// Example (maza-blindbox-long): the blind-box talk's split steps over the whole approved cut (used by Reel.timeline-example.tsx). Copy to src/Looks.tsx and rewrite the steps/segments for your talk. Timing from timeline.ts only.
import { Composition, interpolate, Sequence } from "remotion";
import { CLIPS, type ClipData } from "./data/clips";
import { EndCard } from "./Overlays";
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

export const LooksCompositions = () => (
  <>
    <Composition id="BlindBoxSteps" component={BlindBoxSteps} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
