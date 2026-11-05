// The OG house framing (face-tracked / locked 9:16, one camera move per clip, emphasis zooms) for the re-ordered
// cut that the huashu film uses (hook first). Picture only: huashu draws captions/type and mixes the sound.
import { Composition, Series } from "remotion";
import { CLIPS } from "./data/clips";
import PLATE from "./data/plate.json";
import { Grade } from "./Overlays";
import { TrackedVideo } from "./TrackedVideo";

const ORDER = PLATE as [string, number][];
const TOTAL = ORDER.reduce((n, [, f]) => n + f, 0);

const Plate: React.FC = () => (
  <Series>
    {ORDER.map(([id, frames]) => (
      <Series.Sequence key={id} name={id} durationInFrames={frames}>
        <TrackedVideo clip={CLIPS[id as keyof typeof CLIPS]} volume={() => 0} />
        <Grade />
      </Series.Sequence>
    ))}
  </Series>
);

export const PlateComposition = () => (
  <Composition id="TrackedPlate" component={Plate} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
