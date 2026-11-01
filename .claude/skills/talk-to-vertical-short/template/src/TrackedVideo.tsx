import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { ClipData, Move } from "./data/clips";

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

const quick = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
} as const;
const slow = { ...ease, easing: Easing.inOut(Easing.sin) } as const;

// One camera move per clip (video-style skill): very slow push/pull over the whole clip, or a quick zoom at the start.
const moveZoom = (move: Move, frame: number, frames: number) => {
  switch (move) {
    case "pushIn":
      return interpolate(frame, [0, frames], [0, 0.06], slow);
    case "pullOut":
      return interpolate(frame, [0, frames], [0.06, 0], slow);
    case "zoomIn":
      return interpolate(frame, [0, 18], [0, 0.08], quick);
    case "zoomOut":
      return interpolate(frame, [0, 18], [0.1, 0], quick);
    default:
      return 0;
  }
};

/**
 * Crops the 16:9 source to 9:16 — locked on the speaker or gently following him (`clip.framing`, pre-computed
 * per frame) — with the clip's camera move and one emphasis zoom on its key word.
 */
export const TrackedVideo: React.FC<{
  clip: ClipData;
  volume?: (f: number) => number;
}> = ({ clip, volume }) => {
  const frame = useCurrentFrame();
  const i = Math.min(Math.max(frame, 0), clip.frames - 1);

  const punch = clip.punches.reduce(
    (acc, p) =>
      acc + interpolate(frame, [p - 3, p + 4, p + 40, p + 52], [0, 0.1, 0.1, 0], ease),
    0,
  );
  const zoom = Math.max(BASE_ZOOM, clip.zoomFloor) + moveZoom(clip.move, frame, clip.frames) + punch;

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
