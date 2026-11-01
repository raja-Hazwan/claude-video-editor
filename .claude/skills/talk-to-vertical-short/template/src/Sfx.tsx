import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";

// Each `from` is offset so the sound's peak lands on the target frame
// (peak offsets measured from the files: woosh 17f, woosh2 14f, woosh3 9f, fastwoosh 3f, drop 26f, riser 50f, old-cam 6f,
// hitech 8f, camera-click 4f, flick 3f, mouse-click 2f).
const fadeOut = (start: number, end: number) => (f: number) =>
  interpolate(f, [start, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const Sfx: React.FC = () => {
  return (
    <>
      {/* Hook: low impact as the title slams in (peak at frame 8) */}
      <Sequence name="SFX drop · hook" from={0} durationInFrames={60} layout="none">
        <Audio src={staticFile("sfx/drop.mp3")} trimBefore={18} volume={(f) => 0.22 * fadeOut(30, 60)(f)} />
      </Sequence>
      <Sequence name="SFX click · name tag" from={140} durationInFrames={10} layout="none">
        <Audio src={staticFile("sfx/mouse-click.mp3")} volume={0.6} />
      </Sequence>

      {/* Punch-in zooms */}
      <Sequence name="SFX flick · teruk" from={201} durationInFrames={10} layout="none">
        <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
      </Sequence>
      <Sequence name="SFX flick · pendirian" from={462} durationInFrames={10} layout="none">
        <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
      </Sequence>
      <Sequence name="SFX flick · sepatutnya" from={1273} durationInFrames={10} layout="none">
        <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
      </Sequence>

      {/* A different whoosh on each flash cut (489, 633, 913, 1316); peaks: woosh2 14f, fastwoosh 3f, woosh3 9f, woosh 17f */}
      <Sequence name="SFX woosh2 · cut 1" from={475} durationInFrames={30} layout="none">
        <Audio src={staticFile("sfx/woosh2.mp3")} volume={0.45} />
      </Sequence>
      <Sequence name="SFX fastwoosh · cut 2" from={630} durationInFrames={12} layout="none">
        <Audio src={staticFile("sfx/fastwoosh.mp3")} volume={0.35} />
      </Sequence>
      <Sequence name="SFX woosh3 · cut 3" from={904} durationInFrames={30} layout="none">
        <Audio src={staticFile("sfx/woosh3.mp3")} volume={0.5} />
      </Sequence>
      <Sequence name="SFX woosh · cut 4" from={1299} durationInFrames={45} layout="none">
        <Audio src={staticFile("sfx/woosh.mp3")} volume={0.4} />
      </Sequence>

      {/* Key cards */}
      <Sequence name="SFX shutter · whataboutism card" from={579} durationInFrames={26} layout="none">
        <Audio src={staticFile("sfx/old-cam.mp3")} volume={0.45} />
      </Sequence>
      <Sequence name="SFX camera click · salah orang lain card" from={796} durationInFrames={12} layout="none">
        <Audio src={staticFile("sfx/camera-click.mp3")} volume={0.55} />
      </Sequence>
      <Sequence name="SFX hi-tech click · pesan Nabi card" from={1148} durationInFrames={30} layout="none">
        <Audio src={staticFile("sfx/hitech-click.wav")} volume={0.9} />
      </Sequence>

      {/* "jangan follow." punch-in (peak at 1179) */}
      <Sequence name="SFX drop · follow" from={1153} durationInFrames={75} layout="none">
        <Audio src={staticFile("sfx/drop.mp3")} volume={(f) => 0.28 * fadeOut(45, 75)(f)} />
      </Sequence>

      {/* Build into "kebaikan" (1530), then the end card */}
      <Sequence name="SFX riser · kebaikan" from={1480} durationInFrames={53} layout="none">
        <Audio src={staticFile("sfx/riser.mp3")} volume={0.35} />
      </Sequence>
      {/* Music box chime peaks (12f) as the "Edited by The Returning Soul" logo lands (~1578) */}
      <Sequence name="SFX music box · brand logo" from={1566} durationInFrames={60} layout="none">
        <Audio src={staticFile("sfx/music-box.wav")} volume={(f) => fadeOut(48, 60)(f)} />
      </Sequence>
    </>
  );
};
