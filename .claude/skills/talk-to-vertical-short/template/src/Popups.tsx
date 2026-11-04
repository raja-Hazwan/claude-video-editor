import { Video } from "@remotion/media";
import { Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";

// Popup "sticker" cards for concrete things he names (see video-style "Popups").
// One style for all: white card, centred in the empty strip below the captions (his robe / the bottom fade),
// clear of his face and of TikTok's side buttons. Pops in with a small overshoot, floats gently, shrinks out.
// Images live in public/popups (scripts/prep_popups.py).
export const POPUP_TOP = 1350;
const FRAME_W = 1080;

export const Popup: React.FC<{
  durationInFrames: number;
  src: string; // file in public/popups
  width?: number;
  tilt?: number;
  video?: boolean;
}> = ({ durationInFrames, src, width = 320, tilt = 4, video }) => {
  const f = useCurrentFrame();
  const pop = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.8)) });
  const out = interpolate(f, [durationInFrames - 7, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const opacity = Math.min(interpolate(f, [0, 4], [0, 1], { extrapolateRight: "clamp" }), 1 - out);
  const scale = (0.55 + 0.45 * pop) * (1 - 0.2 * out);
  const float = Math.sin(f / 12) * 4;
  const rotate = tilt * (0.4 + 0.6 * pop);

  return (
    <div
      style={{
        position: "absolute",
        top: POPUP_TOP,
        left: (FRAME_W - width) / 2,
        width,
        padding: 12,
        backgroundColor: "white",
        borderRadius: 30,
        boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        opacity,
        transform: `translateY(${float + 20 * out}px) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: "50% 60%",
      }}
    >
      {video ? (
        <div style={{ width: width - 24, height: width - 24, borderRadius: 20, overflow: "hidden" }}>
          <Video
            src={staticFile(`popups/${src}`)}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 45%" }}
          />
        </div>
      ) : (
        <Img src={staticFile(`popups/${src}`)} style={{ display: "block", width: "100%", borderRadius: 20 }} />
      )}
    </div>
  );
};

// `at` = word(clip, "text") - 3 so the card lands just before the word. Keep them from overlapping.
export type PopupSpec = { name: string; at: number; dur: number; src: string; width?: number; tilt: number; video?: boolean };

// Render after the cards, before <ProgressBar/>.
export const PopupLayer: React.FC<{ popups: PopupSpec[] }> = ({ popups }) => (
  <>
    {popups.map((p) => (
      <Sequence key={p.name} name={`Popup: ${p.name}`} from={p.at} durationInFrames={p.dur}>
        <Popup durationInFrames={p.dur} src={p.src} width={p.width} tilt={p.tilt} video={p.video} />
      </Sequence>
    ))}
  </>
);
