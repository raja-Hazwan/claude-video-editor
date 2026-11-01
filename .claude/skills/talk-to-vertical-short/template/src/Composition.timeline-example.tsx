import { TransitionSeries } from "@remotion/transitions";
import { Fragment } from "react";
import { AbsoluteFill, Composition, interpolate, Sequence } from "remotion";
import { Captions } from "./Captions";
import { CLIPS, type ClipData } from "./data/clips";
import { EndCard, Flash, Grade, HookTitle, KeyCard, NameTag, ProgressBar } from "./Overlays";
import { Sfx } from "./Sfx";
import { at, end, ORDER, TOTAL_FRAMES, word } from "./timeline";
import { TrackedVideo } from "./TrackedVideo";

// Clips that continue the previous one after a removed pause: plain jump cut, no flash.
const JUMP_CUT = new Set(["myth2", "practical2", "practical3", "ruling"]);
const END_CARD = 90; // = extend 3.0s on the last clip

export const MyComposition = () => (
  <Composition id="QadhaShort" component={QadhaShort} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
);

const Scene: React.FC<{ clip: ClipData; volume?: (f: number) => number }> = ({ clip, volume }) => (
  <AbsoluteFill>
    <TrackedVideo clip={clip} volume={volume} />
    <Grade />
    <Captions words={clip.words} durationInFrames={clip.frames} />
  </AbsoluteFill>
);

// Speech ends where the extend starts; fade it out under the end card ("Dia duduk pun tak apalah" follows).
const speechEnd = CLIPS.ruling.frames - END_CARD;
const rulingVolume = (f: number) =>
  interpolate(f, [speechEnd, speechEnd + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Card: React.FC<{ name: string; from: number; to: number; label: string; title: string; sub: string }> = ({
  name, from, to, label, title, sub,
}) => (
  <Sequence name={`Card: ${name}`} from={from} durationInFrames={to - from}>
    <KeyCard durationInFrames={to - from} label={label} title={title} sub={sub} />
  </Sequence>
);

export const QadhaShort: React.FC = () => {
  const endCard = end("ruling", -END_CARD);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries name="Highlights">
        {ORDER.map((id, i) => (
          <Fragment key={id}>
            {i > 0 && !JUMP_CUT.has(id) ? (
              <TransitionSeries.Overlay durationInFrames={10}>
                <Flash />
              </TransitionSeries.Overlay>
            ) : null}
            <TransitionSeries.Sequence name={`${i + 1} ${id} (${CLIPS[id].startSec.toFixed(1)}s)`} durationInFrames={CLIPS[id].frames}>
              <Scene clip={CLIPS[id]} volume={id === "ruling" ? rulingVolume : undefined} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>

      <Sequence name="Hook title" from={0} durationInFrames={200}>
        <HookTitle durationInFrames={200} label="Solat tertinggal?" title="Qada' bila ingat, jangan tunggu!" size={80} />
      </Sequence>
      <Sequence name="Name tag" from={205} durationInFrames={100}>
        <NameTag durationInFrames={100} name="S.S. Dato' Dr. MAZA" />
      </Sequence>
      <Card name="subuh" from={at("subuh", 41)} to={at("subuh", 191)} label="Contoh" title="Tinggal Subuh?" sub="Qada' bila ingat, bukan tunggu esok" />
      <Card name="pesanan" from={at("myth", 45)} to={at("myth", 195)} label="Ada orang pesan" title="Qada' ikut waktu fardu" sub="“Sembahyang fardu tu, qada' ikut dia”" />
      <Card name="boleh tapi" from={word("myth2", "kalau")} to={end("myth2", -2)} label="Hakikatnya" title="Boleh, tapi tak wajib" sub="Salah jika dianggap mesti begitu" />
      <Card name="Khandaq" from={word("hadith", "nabi")} to={end("hadith", -2)} label="Hadis riwayat al-Tirmizi" title="Perang Khandaq" sub="Nabi SAW tertinggal 4 solat" />
      <Card name="serentak" from={word("serentak", "serentak")} to={end("serentak", -2)} label="Nabi SAW" title="Qada' serentak" sub="Zuhur, Asar, Maghrib, Isyak" />
      <Card name="pengsan" from={word("practical", "katalah") - 33} to={end("practical", 0)} label="Contoh" title="Pengsan / operation" sub="dari pagi hingga malam" />
      <Card name="baru sedar" from={at("practical3", 6)} to={end("practical3", -2)} label="Baru sedar" title="Lepas Isyak" sub="Zuhur, Asar, Maghrib tertinggal" />
      <Card name="qada semua" from={word("ruling", "tak") - 2} to={endCard} label="Jawapannya" title="Qada' semua sekali" sub="jika mampu, tak perlu tunggu" />
      <Sequence name="End card" from={endCard} durationInFrames={END_CARD}>
        <EndCard
          durationInFrames={END_CARD}
          message="Qada' bila ingat"
          sub="jangan tunggu waktu fardu."
          speaker="S.S. Dato' Dr. MAZA"
          source="PROmedia Tajdid"
        />
      </Sequence>

      <ProgressBar />
      <Sfx />
    </AbsoluteFill>
  );
};

