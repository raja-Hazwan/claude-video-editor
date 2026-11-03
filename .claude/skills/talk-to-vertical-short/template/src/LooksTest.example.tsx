// Test renders of every reel look over short stretches of this cut (not for publishing: the photographic styles use
// the upstream sample photos, the tier list doesn't fit this talk). npx remotion still Test-<Look> --frame=N
import { Composition, Sequence } from "remotion";
import { OrbitReel, PictureStack, SceneSwitch, ShapeShift, VisualNotes } from "./looks/Photographic";
import { RankingList } from "./looks/RankingList";
import { Storytelling } from "./looks/Storytelling";
import { TrialV1, TrialV2, TrialV3 } from "./looks/TrialReels";
import { START, word } from "./timeline";

const S = (f: string) => `showcase/${f}.jpg`;
const P = (f: string) => `popups/${f}.png`;
/** a stretch [from, to) of the cut as its own composition: frame 0 = `from` */
const Stretch = (id: string, from: number, to: number, el: React.ReactNode) => (
  <Composition key={id} id={id} component={() => <Sequence from={-from}>{el}</Sequence>} durationInFrames={to - from} fps={30} width={1080} height={1920} />
);
const HOOK = [0, START.hook_4] as const;
const ph = (a: number) => ({ from: a, to: a + 126 });

export const LooksTests = () => (
  <>
    {Stretch("Test-Storytelling", 0, START.hook_3, <Storytelling stories={[{ from: 0, to: START.hook_3, cards: [{ type: "image", src: P("blindbox") }, { type: "text", big: "?", small: "isi tak tahu" }, { type: "image", src: P("kereta") }], title: ["Beli blind box,", "apa hukumnya?"], subtitle: "Dr MAZA jawab" }]} />)}
    {Stretch("Test-TrialV1", ...HOOK, <TrialV1 from={0} title={["beli barang dalam", "*blind box*", "*apa hukum?*"]} />)}
    {Stretch("Test-TrialV2", ...HOOK, <TrialV2 from={HOOK[0]} to={HOOK[1]} name="S.S. Dato' Dr. MAZA" sub="Fiqh muamalat" headline="Beli blind box, tak tahu isinya: apa hukumnya?" keys={["blind", "hukum"]} />)}
    {Stretch("Test-TrialV3", ...HOOK, <TrialV3 from={0} stat="?" line="tak tahu isi apa" pulseAt={word("hook_2", "isi")} />)}
    {Stretch("Test-RankingList", START.anak, START.yasir, <RankingList from={START.anak} title={"MAINAN DALAM\nKOTAK"} tiers={[["HARAM", "#FF7F7F"], ["BOLEH", "#BFFF7F"]]} items={[
      { name: "KERETA", tier: "HARAM", pop: word("anak", "kereta"), drop: word("anak", "haram"), images: [P("kereta")] },
      { name: "PATUNG", tier: "HARAM", pop: word("anak", "patung"), drop: word("anak", "haram") + 6, images: [P("patung")] },
    ]} />)}
    {Stretch("Test-ShapeShift", ph(START.closer).from, ph(START.closer).to, <ShapeShift {...ph(START.closer)} eyebrow="A study in circles" headline="Same shape." footer="New story." photos={[{ src: S("orange"), bg: "#f58a00" }, { src: S("record"), bg: "#f3f1f5" }, { src: S("camera"), bg: "#ffda34" }]} />)}
    {Stretch("Test-PictureStack", ph(START.gharar).from, ph(START.gharar).to, <PictureStack {...ph(START.gharar)} photos={[S("banana-heels"), S("pixel-fruit"), S("pixel-burger")]} captions={["ordinary things", "extraordinary ideas"]} />)}
    {Stretch("Test-SceneSwitch", ph(START.bola).from, ph(START.bola).to, <SceneSwitch {...ph(START.bola)} scenes={[S("blue-stairs"), S("red-stairs"), S("cactus")]} captions={["change the scene", "keep the story moving"]} />)}
    {Stretch("Test-VisualNotes", ph(START.yasir).from, ph(START.yasir).to, <VisualNotes {...ph(START.yasir)} image={S("pixel-burger")} detail={{ left: -350, top: -200, width: 1100, height: 1034 }} tag={["STUDY / FOOD", "STUDY / THE DETAIL"]} callout={<>Familiar food. <span style={{ color: "#db925e" }}>Unexpected form.</span></>} note="look again." />)}
    {Stretch("Test-OrbitReel", ph(START.tikam).from, ph(START.tikam).to, <OrbitReel {...ph(START.tikam)} cards={["banana-heels", "blue-stairs", "pixel-burger", "cactus", "pixel-fruit", "red-stairs"].map(S)} title={["Put your ideas", "in motion."]} />)}
  </>
);
