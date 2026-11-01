import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Composition, interpolate, Sequence } from "remotion";
import { Captions } from "./Captions";
import { CLIPS, type ClipData } from "./data/clips";
import { EndCard, Flash, Grade, HookTitle, KeyCard, NameTag, ProgressBar } from "./Overlays";
import { Sfx } from "./Sfx";
import { TrackedVideo } from "./TrackedVideo";

// Timeline (30fps): hook 0 · term 489 · point 633 · nabi 913 · closer 1316 · end 1648
const TOTAL_FRAMES = 1648;

export const MyComposition = () => {
  return (
    <Composition
      id="RozaimiShort"
      component={RozaimiShort}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

const Scene: React.FC<{ clip: ClipData; volume?: (f: number) => number }> = ({ clip, volume }) => (
  <AbsoluteFill>
    <TrackedVideo clip={clip} volume={volume} />
    <Grade />
    <Captions words={clip.words} durationInFrames={clip.frames} />
  </AbsoluteFill>
);

// Fade the speech out under the end card (the next sentence starts at 57.8s in the source).
const closerVolume = (f: number) =>
  interpolate(f, [236, 248], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const RozaimiShort: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries name="Highlights">
        <TransitionSeries.Sequence name="1 Hook (0:00)" durationInFrames={489}>
          <Scene clip={CLIPS.hook} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="2 Whataboutism (1:19)" durationInFrames={144}>
          <Scene clip={CLIPS.term} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="3 Point (2:49)" durationInFrames={280}>
          <Scene clip={CLIPS.point} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="4 Nabi (3:16)" durationInFrames={403}>
          <Scene clip={CLIPS.nabi} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="5 Closer (0:49)" durationInFrames={332}>
          <Scene clip={CLIPS.closer} volume={closerVolume} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence name="Hook title" from={0} durationInFrames={125}>
        <HookTitle durationInFrames={125} />
      </Sequence>
      <Sequence name="Name tag" from={140} durationInFrames={150}>
        <NameTag durationInFrames={150} />
      </Sequence>
      <Sequence name="Card: whataboutism" from={580} durationInFrames={115}>
        <KeyCard
          durationInFrames={115}
          label="Istilahnya"
          title="Whataboutism"
          sub="Ditegur, tuding pula salah orang lain"
        />
      </Sequence>
      <Sequence name="Card: tak jadikan betul" from={800} durationInFrames={118}>
        <KeyCard
          durationInFrames={118}
          label="Ingat"
          title="Salah orang lain"
          sub="tak menjadikan salah kita betul"
        />
      </Sequence>
      <Sequence name="Card: jangan follow" from={1156} durationInFrames={158}>
        <KeyCard
          durationInFrames={158}
          label="Pesan Nabi SAW"
          title="Jangan ikut"
          sub="manusia yang pentingkan diri"
        />
      </Sequence>
      <Sequence name="End card" from={1553} durationInFrames={95}>
        <EndCard durationInFrames={95} />
      </Sequence>

      <ProgressBar />
      <Sfx />
    </AbsoluteFill>
  );
};
