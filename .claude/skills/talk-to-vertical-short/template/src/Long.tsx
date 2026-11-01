import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Composition, interpolate, Sequence, staticFile } from "remotion";
import { Captions } from "./Captions";
import { CLIPS, type ClipData } from "./data/clipsLong";
import { EndCard, Flash, Grade, HookTitle, KeyCard, NameTag, ProgressBar } from "./Overlays";
import { TrackedVideo } from "./TrackedVideo";

// Long cut (< 2 min) keeping the full reasoning.
// Timeline (30fps): hook 0 · question 119 · principle 267 · tazir 965 · test 1526 · test2 2016 (jump cut)
// · danger 2366 · quran 2585 (jump cut) · ruling 2899 · end 3557
const TOTAL_FRAMES = 3557;

export const LongComposition = () => (
  <Composition
    id="PecahAmanahLong"
    component={PecahAmanahLong}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);

const Scene: React.FC<{ clip: ClipData; volume?: (f: number) => number }> = ({ clip, volume }) => (
  <AbsoluteFill>
    <TrackedVideo clip={clip} volume={volume} />
    <Grade />
    <Captions words={clip.words} durationInFrames={clip.frames} />
  </AbsoluteFill>
);

const fadeOut = (start: number, end: number) => (f: number) =>
  interpolate(f, [start, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// "Saya tak tahu" starts at 273.59s in the source = local 571 of the ruling clip.
const rulingVolume = fadeOut(567, 572);

export const PecahAmanahLong: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries name="Highlights (long)">
        <TransitionSeries.Sequence name="1 Hook (0:00)" durationInFrames={119}>
          <Scene clip={CLIPS.hook} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="2 Question (0:07)" durationInFrames={148}>
          <Scene clip={CLIPS.question} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="3 Maqasid + hudud (0:36)" durationInFrames={698}>
          <Scene clip={CLIPS.principle} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="4 Ta'zir (1:06)" durationInFrames={561}>
          <Scene clip={CLIPS.tazir} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="5a Purpose + test (3:20)" durationInFrames={490}>
          <Scene clip={CLIPS.test} />
        </TransitionSeries.Sequence>
        {/* jump cut: 1.7s pause removed */}
        <TransitionSeries.Sequence name="5b Or already insaf? (3:38)" durationInFrames={350}>
          <Scene clip={CLIPS.test2} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="6a Danger (3:55)" durationInFrames={219}>
          <Scene clip={CLIPS.danger} />
        </TransitionSeries.Sequence>
        {/* jump cut: 1.5s pause removed */}
        <TransitionSeries.Sequence name="6b Quran (4:04)" durationInFrames={314}>
          <Scene clip={CLIPS.quran} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Overlay durationInFrames={10}>
          <Flash />
        </TransitionSeries.Overlay>
        <TransitionSeries.Sequence name="7 Ruling (4:14)" durationInFrames={658}>
          <Scene clip={CLIPS.ruling} volume={rulingVolume} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence name="Hook title" from={0} durationInFrames={235}>
        <HookTitle durationInFrames={235} label="Soalan dahsyat:" title="Kumpul dana untuk pesalah pecah amanah?" size={78} />
      </Sequence>
      <Sequence name="Name tag" from={270} durationInFrames={115}>
        <NameTag durationInFrames={115} name="Prof. Dr. Rozaimi" />
      </Sequence>
      <Sequence name="Card: maqasid" from={398} durationInFrames={125}>
        <KeyCard durationInFrames={125} label="Prinsip" title="Maqasid" sub="Melihat objektif sesuatu hukum" />
      </Sequence>
      <Sequence name="Card: hudud" from={764} durationInFrames={140}>
        <KeyCard durationInFrames={140} label="Hukuman tetap" title="Hudud" sub="Ditetapkan syarak, tak boleh diubah" />
      </Sequence>
      <Sequence name="Card: ta'zir" from={1104} durationInFrames={140}>
        <KeyCard durationInFrames={140} label="Hukuman tak tetap" title="Ta'zir" sub="Contoh: penjara, denda" />
      </Sequence>
      <Sequence name="Card: tujuan" from={1665} durationInFrames={110}>
        <KeyCard durationInFrames={110} label="Tujuan ta'zir" title="Supaya pesalah insaf" sub="sedar akan kesalahannya" />
      </Sequence>
      <Sequence name="Card: insaf?" from={1985} durationInFrames={140}>
        <KeyCard durationInFrames={140} label="Soalan utama" title="Adakah dia insaf?" sub="atau makin berani buat salah?" />
      </Sequence>
      <Sequence name="Card: bahaya" from={2566} durationInFrames={70}>
        <KeyCard durationInFrames={70} label="Jika tak insaf" title="Makin berani" sub="“Kena denda? Buka infak je.”" />
      </Sequence>
      <Sequence name="Card: Al-Ma'idah 2" from={2699} durationInFrames={190}>
        <KeyCard durationInFrames={190} label="Surah Al-Ma'idah: 2" title="Jangan tolong-menolong" sub="dalam dosa dan permusuhan" />
      </Sequence>
      <Sequence name="Card: boleh bantu" from={3149} durationInFrames={135}>
        <KeyCard durationInFrames={135} label="Boleh dibantu jika" title="Benar-benar insaf" sub="dan memang tak mampu" />
      </Sequence>
      <Sequence name="Card: nilai sendiri" from={3324} durationInFrames={140}>
        <KeyCard durationInFrames={140} label="Akhirnya" title="Kita nilai sendiri" sub="Dia insaf ke tak?" />
      </Sequence>
      <Sequence name="End card" from={3468} durationInFrames={89}>
        <EndCard
          durationInFrames={89}
          message="Bantu yang benar-benar insaf"
          sub="bukan yang terus buat salah."
          speaker="Prof. Dr. Rozaimi"
          source="PROmedia Tajdid"
        />
      </Sequence>

      <ProgressBar />
      <LongSfx />
    </AbsoluteFill>
  );
};

/** SFX, each `from` offset so the file's peak lands on the target frame. No SFX over the Quran recitation (~2702-2799). */
const LongSfx: React.FC = () => (
  <>
    <Sequence name="SFX drop · hook" from={0} durationInFrames={60} layout="none">
      <Audio src={staticFile("sfx/drop.mp3")} trimBefore={18} volume={(f) => 0.22 * fadeOut(30, 60)(f)} />
    </Sequence>
    <Sequence name="SFX click · name tag" from={270} durationInFrames={10} layout="none">
      <Audio src={staticFile("sfx/mouse-click.mp3")} volume={0.6} />
    </Sequence>

    {/* Punch-ins without a card: dahsyat 22, amanah 249, hudud 876, duit 1494, insaf 2065, insaf 2347, jawab 3461 */}
    <Sequence name="SFX flick · dahsyat" from={19} durationInFrames={10} layout="none">
      <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
    </Sequence>
    <Sequence name="SFX flick · amanah" from={246} durationInFrames={10} layout="none">
      <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
    </Sequence>
    <Sequence name="SFX flick · hudud" from={873} durationInFrames={10} layout="none">
      <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
    </Sequence>
    <Sequence name="SFX flick · duit" from={1491} durationInFrames={10} layout="none">
      <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
    </Sequence>
    <Sequence name="SFX flick · telah insaf" from={2062} durationInFrames={10} layout="none">
      <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
    </Sequence>
    <Sequence name="SFX flick · tak insaf pun" from={2344} durationInFrames={10} layout="none">
      <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
    </Sequence>
    <Sequence name="SFX flick · jawab" from={3458} durationInFrames={10} layout="none">
      <Audio src={staticFile("sfx/flick.mp3")} volume={0.5} />
    </Sequence>

    {/* A different whoosh per flash cut (119, 267, 965, 1526, 2366, 2899) */}
    <Sequence name="SFX fastwoosh · cut 1" from={116} durationInFrames={12} layout="none">
      <Audio src={staticFile("sfx/fastwoosh.mp3")} volume={0.35} />
    </Sequence>
    <Sequence name="SFX woosh2 · cut 2" from={253} durationInFrames={30} layout="none">
      <Audio src={staticFile("sfx/woosh2.mp3")} volume={0.45} />
    </Sequence>
    <Sequence name="SFX woosh3 · cut 3" from={956} durationInFrames={30} layout="none">
      <Audio src={staticFile("sfx/woosh3.mp3")} volume={0.5} />
    </Sequence>
    <Sequence name="SFX woosh2 · cut 4" from={1512} durationInFrames={30} layout="none">
      <Audio src={staticFile("sfx/woosh2.mp3")} volume={0.45} />
    </Sequence>
    <Sequence name="SFX fastwoosh · cut 5" from={2363} durationInFrames={12} layout="none">
      <Audio src={staticFile("sfx/fastwoosh.mp3")} volume={0.35} />
    </Sequence>
    <Sequence name="SFX woosh · cut 6 (into ruling)" from={2882} durationInFrames={45} layout="none">
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.4} />
    </Sequence>

    {/* Key cards (varied) */}
    <Sequence name="SFX shutter · maqasid" from={396} durationInFrames={26} layout="none">
      <Audio src={staticFile("sfx/old-cam.mp3")} volume={0.45} />
    </Sequence>
    <Sequence name="SFX camera click · hudud" from={764} durationInFrames={12} layout="none">
      <Audio src={staticFile("sfx/camera-click.mp3")} volume={0.55} />
    </Sequence>
    <Sequence name="SFX hi-tech click · ta'zir" from={1100} durationInFrames={30} layout="none">
      <Audio src={staticFile("sfx/hitech-click.wav")} volume={0.9} />
    </Sequence>
    <Sequence name="SFX camera click · tujuan" from={1665} durationInFrames={12} layout="none">
      <Audio src={staticFile("sfx/camera-click.mp3")} volume={0.55} />
    </Sequence>
    <Sequence name="SFX hi-tech click · insaf?" from={1981} durationInFrames={30} layout="none">
      <Audio src={staticFile("sfx/hitech-click.wav")} volume={0.9} />
    </Sequence>
    <Sequence name="SFX shutter · bahaya" from={2566} durationInFrames={26} layout="none">
      <Audio src={staticFile("sfx/old-cam.mp3")} volume={0.45} />
    </Sequence>
    <Sequence name="SFX camera click · boleh bantu" from={3149} durationInFrames={12} layout="none">
      <Audio src={staticFile("sfx/camera-click.mp3")} volume={0.55} />
    </Sequence>
    <Sequence name="SFX click · nilai sendiri" from={3326} durationInFrames={10} layout="none">
      <Audio src={staticFile("sfx/mouse-click.mp3")} volume={0.6} />
    </Sequence>

    {/* Main message: "...dalam perkara dosa" (2859) */}
    <Sequence name="SFX drop · dosa" from={2833} durationInFrames={75} layout="none">
      <Audio src={staticFile("sfx/drop.mp3")} volume={(f) => 0.28 * fadeOut(45, 75)(f)} />
    </Sequence>
    {/* Build into "dibenarkan" (3255) + ding on the word, brand logo lands ~3496 */}
    <Sequence name="SFX riser · dibenarkan" from={3205} durationInFrames={53} layout="none">
      <Audio src={staticFile("sfx/riser.mp3")} volume={0.35} />
    </Sequence>
    <Sequence name="SFX ding · dibenarkan" from={3251} durationInFrames={60} layout="none">
      <Audio src={staticFile("sfx/ding.mp3")} volume={0.5} />
    </Sequence>
    <Sequence name="SFX music box · brand logo" from={3484} durationInFrames={60} layout="none">
      <Audio src={staticFile("sfx/music-box.wav")} volume={(f) => fadeOut(48, 60)(f)} />
    </Sequence>
  </>
);
