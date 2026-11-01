import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { ClipData } from "./data/clips";

const SRC_W = 1920;
const SRC_H = 1080;
const OUT_W = 1080;
const OUT_H = 1920;
// Base zoom leaves headroom so the face can sit lower than the top-band titles.
const BASE_ZOOM = 1.0;
// Where the face centre sits vertically in the output frame (0 = top).
const FACE_ANCHOR = 0.4;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), Math.max(lo, hi));

const ease = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.inOut(Easing.cubic),
} as const;

/**
 * Crops the 16:9 source to 9:16, following the speaker's face (pre-computed per frame),
 * with an entry zoom kick, a slow push-in and punch-in zooms on key words.
 */
export const TrackedVideo: React.FC<{
  clip: ClipData;
  volume?: (f: number) => number;
}> = ({ clip, volume }) => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.max(frame, 0), clip.frames - 1);

  const entry = interpolate(frame, [0, 14], [0.1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const push = interpolate(frame, [0, clip.frames], [0, 0.05]);
  const punch = clip.punches.reduce(
    (acc, p) =>
      acc + interpolate(frame, [p - 4, p + 3, p + 42, p + 54], [0, 0.13, 0.13, 0], ease),
    0,
  );
  const zoom = Math.max(BASE_ZOOM, clip.zoomFloor) + entry + push + punch;

  const visH = SRC_H / zoom;
  const visW = (visH * OUT_W) / OUT_H;
  const left = clamp(clip.cx[i] * SRC_W - visW / 2, 0, SRC_W - visW);
  const top = clamp(clip.cy[i] * SRC_H - FACE_ANCHOR * visH, 0, clip.maxBottom * SRC_H - visH);
  const s = OUT_H / visH;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black" }}>
      <Video
        src={staticFile("source.mp4")}
        trimBefore={Math.round(clip.startSec * 30)}
        volume={volume}
        style={{
          position: "absolute",
          width: SRC_W * s,
          height: SRC_H * s,
          left: -left * s,
          top: -top * s,
          filter: "contrast(1.06) saturate(1.12) brightness(1.02)",
        }}
      />
    </AbsoluteFill>
  );
};
