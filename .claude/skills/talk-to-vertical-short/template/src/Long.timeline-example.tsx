import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import { Fragment } from "react";
import { AbsoluteFill, Composition, interpolate, Sequence, staticFile } from "remotion";
import { Captions } from "./Captions";
import { type ClipData } from "./data/clips";
import { CLIPS } from "./data/clipsLong";
import { EndCard, Flash, Grade, HookTitle, KeyCard, NameTag, ProgressBar } from "./Overlays";
import { makeTimeline } from "./timeline";
import { TrackedVideo } from "./TrackedVideo";

// Full-context cut keeping the whole hadith explanation (al-Tirmizi, Khandaq, azan + iqamat per prayer).
// All frames derive from clipsLong.ts — change cuts in config_long.json, re-run gen_data, render.
const { ORDER, START, TOTAL_FRAMES, at, end, word } = makeTimeline(CLIPS);
type Id = (typeof ORDER)[number];

// Clips that only drop a pause (or a short Arabic line he immediately translates): jump cut, no flash.
const JUMP_CUT = new Set<Id>(["myth2", "hsrc", "four2", "azan", "asar", "maghrib", "isyak", "practical", "practical2", "practical3", "ruling"]);
const END_CARD = 90;

export const LongComposition = () => (
  <Composition id="QadhaLong" component={QadhaLong} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
);

const Scene: React.FC<{ clip: ClipData; volume?: (f: number) => number }> = ({ clip, volume }) => (
  <AbsoluteFill>
    <TrackedVideo clip={clip} volume={volume} />
    <Grade />
    <Captions words={clip.words} durationInFrames={clip.frames} />
  </AbsoluteFill>
);

const fadeOut = (start: number, stop: number) => (f: number) =>
  interpolate(f, [start, stop], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const speechEnd = CLIPS.ruling.frames - END_CARD;
const rulingVolume = fadeOut(speechEnd, speechEnd + 6);

const Card: React.FC<{ name: string; from: number; to: number; label: string; title: string; sub?: string }> = ({
  name, from, to, label, title, sub,
}) => (
  <Sequence name={`Card: ${name}`} from={from} durationInFrames={to - from}>
    <KeyCard durationInFrames={to - from} label={label} title={title} sub={sub} />
  </Sequence>
);

export const QadhaLong: React.FC = () => {
  const endCard = end("ruling", -END_CARD);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries name="Highlights (long)">
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
      <Card name="dalil" from={word("hsrc", "hadith")} to={end("hsrc", -2)} label="Dalilnya" title="Hadis al-Tirmizi" sub="Peristiwa Perang Khandaq" />
      <Card name="Khandaq" from={word("khandaq", "nabi")} to={end("khandaq", -2)} label="Perang Khandaq" title="Nabi SAW tertinggal 4 solat" sub="disibukkan oleh musyrikin" />
      <Card name="4 solat" from={word("four1", "zuhur")} to={end("four2", -2)} label="4 solat tertinggal" title="Zuhur, Asar, Maghrib, Isyak" />
      <Card name="malam" from={at("night", 8)} to={end("night", -2)} label="Sehingga" title="Lewat malam" sub="“habis malam, tinggal sikit”" />
      <Card name="azan" from={word("azan", "maka")} to={end("azan", -2)} label="Nabi suruh Bilal" title="Azan" sub="walaupun solat qada'" />
      <Card name="1 zuhur" from={word("zuhur", "kemudian")} to={end("zuhur", -2)} label="Iqamat, kemudian solat" title="1. Zuhur" />
      <Card name="2 asar" from={at("asar", 20)} to={end("asar", -2)} label="Iqamat, kemudian solat" title="2. Asar" />
      <Card name="3 maghrib" from={at("maghrib", 8)} to={end("maghrib", -2)} label="Iqamat, kemudian solat" title="3. Maghrib" />
      <Card name="4 isyak" from={at("isyak", 8)} to={word("isyak", "iaitu") - 4} label="Iqamat, kemudian solat" title="4. Isyak" />
      <Card name="kesimpulan" from={word("isyak", "iaitu")} to={end("isyak", -2)} label="Kesimpulan hadis" title="Satu azan, iqamat setiap solat" sub="Nabi himpunkan semua solat qada'" />
      <Card name="serentak" from={word("serentak", "serentak")} to={word("practical", "jadi") - 4} label="Nabi SAW" title="Qada' serentak" sub="sebelum turun syariat solat khauf" />
      <Card name="pengsan" from={word("practical", "katalah") - 33} to={end("practical", 0)} label="Contoh" title="Pengsan / operation" sub="dari pagi hingga malam" />
      <Card name="baru sedar" from={at("practical3", 6)} to={end("practical3", -2)} label="Baru sedar" title="Lepas Isyak" sub="Zuhur, Asar, Maghrib tertinggal" />
      <Card name="qada semua" from={word("ruling", "tak") - 2} to={endCard} label="Jawapannya" title="Qada' semua sekali" sub="jika mampu, tak perlu tunggu" />
      <Sequence name="End card" from={endCard} durationInFrames={END_CARD}>
        <EndCard durationInFrames={END_CARD} message="Qada' bila ingat" sub="jangan tunggu waktu fardu." speaker="S.S. Dato' Dr. MAZA" source="PROmedia Tajdid" />
      </Sequence>

      <ProgressBar />
      <LongSfx />
    </AbsoluteFill>
  );
};

/** SFX: `hit` = frame the sound's peak should land on. */
const S: React.FC<{ name: string; hit: number; peak: number; dur: number; src: string; volume: number | ((f: number) => number); trimBefore?: number }> = ({
  name, hit, peak, dur, src, volume, trimBefore,
}) => (
  <Sequence name={`SFX ${name}`} from={Math.max(0, hit - peak)} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${src}`)} volume={volume} trimBefore={trimBefore} />
  </Sequence>
);

const LongSfx: React.FC = () => (
  <>
    <S name="drop · hook" hit={0} peak={0} dur={60} src="drop.mp3" trimBefore={18} volume={(f) => 0.22 * fadeOut(30, 60)(f)} />
    <S name="click · name tag" hit={205} peak={2} dur={10} src="mouse-click.mp3" volume={0.6} />

    {/* Punch-ins */}
    <S name="flick · qada'" hit={word("hook", "qada'")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · salah" hit={word("myth2", "salah")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · Khandaq" hit={word("khandaq", "khandaq")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · Isyak" hit={word("four2", "isyak")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · himpunkan" hit={word("isyak", "himpunkan")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · pengsan" hit={word("practical", "pengsan")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · sedar" hit={word("practical3", "sedar")} peak={3} dur={10} src="flick.mp3" volume={0.5} />

    {/* Main message: "itu tidak BENAR" */}
    <S name="drop · tidak benar" hit={word("myth", "benar")} peak={26} dur={75} src="drop.mp3" volume={(f) => 0.28 * fadeOut(45, 75)(f)} />

    {/* A different whoosh per flash cut: subuh, myth, khandaq, four1, night, zuhur, serentak */}
    <S name="fastwoosh · subuh" hit={START.subuh} peak={3} dur={12} src="fastwoosh.mp3" volume={0.35} />
    <S name="woosh2 · myth" hit={START.myth} peak={14} dur={30} src="woosh2.mp3" volume={0.45} />
    <S name="woosh3 · khandaq" hit={START.khandaq} peak={9} dur={30} src="woosh3.mp3" volume={0.5} />
    <S name="fastwoosh · four" hit={START.four1} peak={3} dur={12} src="fastwoosh.mp3" volume={0.35} />
    <S name="woosh2 · night" hit={START.night} peak={14} dur={30} src="woosh2.mp3" volume={0.4} />
    <S name="woosh3 · zuhur" hit={START.zuhur} peak={9} dur={30} src="woosh3.mp3" volume={0.45} />
    <S name="woosh · serentak (into the lesson)" hit={START.serentak} peak={17} dur={45} src="woosh.mp3" volume={0.4} />

    {/* Key cards (varied); the prayer-by-prayer cards get a soft click */}
    <S name="shutter · subuh" hit={at("subuh", 41)} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S name="hi-tech · pesanan" hit={at("myth", 45)} peak={8} dur={30} src="hitech-click.wav" volume={0.9} />
    <S name="camera · boleh tapi" hit={word("myth2", "kalau")} peak={4} dur={12} src="camera-click.mp3" volume={0.55} />
    <S name="shutter · dalil" hit={word("hsrc", "hadith")} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S name="hi-tech · Khandaq" hit={word("khandaq", "nabi")} peak={8} dur={30} src="hitech-click.wav" volume={0.9} />
    <S name="camera · 4 solat" hit={word("four1", "zuhur")} peak={4} dur={12} src="camera-click.mp3" volume={0.55} />
    <S name="shutter · malam" hit={at("night", 8)} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S name="camera · azan" hit={word("azan", "maka")} peak={4} dur={12} src="camera-click.mp3" volume={0.55} />
    <S name="click · 1 zuhur" hit={word("zuhur", "kemudian")} peak={2} dur={10} src="mouse-click.mp3" volume={0.5} />
    <S name="click · 2 asar" hit={at("asar", 20)} peak={2} dur={10} src="mouse-click.mp3" volume={0.5} />
    <S name="click · 3 maghrib" hit={at("maghrib", 8)} peak={2} dur={10} src="mouse-click.mp3" volume={0.5} />
    <S name="click · 4 isyak" hit={at("isyak", 8)} peak={2} dur={10} src="mouse-click.mp3" volume={0.5} />
    <S name="hi-tech · kesimpulan" hit={word("isyak", "iaitu")} peak={8} dur={30} src="hitech-click.wav" volume={0.9} />
    <S name="shutter · serentak" hit={word("serentak", "serentak")} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S name="camera · pengsan" hit={word("practical", "katalah") - 33} peak={4} dur={12} src="camera-click.mp3" volume={0.55} />
    <S name="shutter · baru sedar" hit={at("practical3", 6)} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S name="click · qada semua" hit={word("ruling", "tak") - 2} peak={2} dur={10} src="mouse-click.mp3" volume={0.6} />

    {/* Build into the answer "qada' SEMUA": riser + ding on the word */}
    <S name="riser · semua" hit={word("ruling", "semua")} peak={50} dur={53} src="riser.mp3" volume={0.3} />
    <S name="ding · semua" hit={word("ruling", "semua")} peak={4} dur={60} src="ding.mp3" volume={0.5} />
    <S name="music box · brand logo" hit={end("ruling", -END_CARD + 28)} peak={12} dur={60} src="music-box.wav" volume={(f) => fadeOut(48, 60)(f)} />
  </>
);
