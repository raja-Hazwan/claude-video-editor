import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { at, end, START, word } from "./timeline";

// Each `from` is (target frame − peak) so the sound's peak lands on the target.
// Peaks: woosh 17f, woosh2 14f, woosh3 9f, fastwoosh 3f, drop 26f, riser 50f, old-cam 6f,
// hitech 8f, camera-click 4f, flick 3f, mouse-click 2f, ding 4f, music-box 12f.
const fadeOut = (start: number, end: number) => (f: number) =>
  interpolate(f, [start, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const S: React.FC<{
  name: string;
  hit: number; // frame the peak should land on
  peak: number;
  dur: number;
  src: string;
  volume: number | ((f: number) => number);
  trimBefore?: number;
}> = ({ name, hit, peak, dur, src, volume, trimBefore }) => (
  <Sequence name={`SFX ${name}`} from={Math.max(0, hit - peak)} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${src}`)} volume={volume} trimBefore={trimBefore} />
  </Sequence>
);

export const Sfx: React.FC = () => (
  <>
    <S name="drop · hook" hit={0} peak={0} dur={60} src="drop.mp3" trimBefore={18} volume={(f) => 0.22 * fadeOut(30, 60)(f)} />
    <S name="click · name tag" hit={205} peak={2} dur={10} src="mouse-click.mp3" volume={0.6} />

    {/* Punch-ins */}
    <S name="flick · qada'" hit={word("hook", "qada'")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · salah" hit={word("myth2", "salah")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · Khandaq" hit={word("hadith", "khandaq")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · pengsan" hit={word("practical", "pengsan")} peak={3} dur={10} src="flick.mp3" volume={0.5} />
    <S name="flick · sedar" hit={word("practical3", "sedar")} peak={3} dur={10} src="flick.mp3" volume={0.5} />

    {/* Main message: "itu tidak BENAR" */}
    <S name="drop · tidak benar" hit={word("myth", "benar")} peak={26} dur={75} src="drop.mp3" volume={(f) => 0.28 * fadeOut(45, 75)(f)} />

    {/* A different whoosh per flash cut */}
    <S name="fastwoosh · cut 1" hit={START.subuh} peak={3} dur={12} src="fastwoosh.mp3" volume={0.35} />
    <S name="woosh2 · cut 2" hit={START.myth} peak={14} dur={30} src="woosh2.mp3" volume={0.45} />
    <S name="woosh3 · cut 3" hit={START.hadith} peak={9} dur={30} src="woosh3.mp3" volume={0.5} />
    <S name="fastwoosh · cut 4" hit={START.serentak} peak={3} dur={12} src="fastwoosh.mp3" volume={0.35} />
    <S name="woosh · cut 5 (into the story)" hit={START.practical} peak={17} dur={45} src="woosh.mp3" volume={0.4} />

    {/* Key cards (varied) — hit = card start */}
    <S name="shutter · subuh" hit={at("subuh", 41)} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S name="hi-tech · pesanan" hit={at("myth", 45)} peak={8} dur={30} src="hitech-click.wav" volume={0.9} />
    <S name="camera · boleh tapi" hit={word("myth2", "kalau")} peak={4} dur={12} src="camera-click.mp3" volume={0.55} />
    <S name="shutter · Khandaq" hit={word("hadith", "nabi")} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S name="hi-tech · serentak" hit={word("serentak", "serentak")} peak={8} dur={30} src="hitech-click.wav" volume={0.9} />
    <S name="camera · pengsan" hit={word("practical", "katalah") - 33} peak={4} dur={12} src="camera-click.mp3" volume={0.55} />
    <S name="shutter · baru sedar" hit={at("practical3", 6)} peak={6} dur={26} src="old-cam.mp3" volume={0.45} />
    <S name="click · qada semua" hit={word("ruling", "tak") - 2} peak={2} dur={10} src="mouse-click.mp3" volume={0.6} />

    {/* Build into the answer "qada' SEMUA": riser + ding on the word */}
    <S name="riser · semua" hit={word("ruling", "semua")} peak={50} dur={53} src="riser.mp3" volume={0.3} />
    <S name="ding · semua" hit={word("ruling", "semua")} peak={4} dur={60} src="ding.mp3" volume={0.5} />

    {/* Brand logo lands ~28f into the end card */}
    <S name="music box · brand logo" hit={end("ruling", -90 + 28)} peak={12} dur={60} src="music-box.wav" volume={(f) => fadeOut(48, 60)(f)} />
  </>
);
