// alive.ts: the rossark-motion engine ported to Remotion (skill `rossark-motion-skill`, MIT, rossark0).
// For pictures, stickers, drawn characters and scenes that should feel ALIVE without getting busy:
// calm curves, small amplitudes, out-of-phase idle loops, nothing teleports. Read MOTION.md (next to src/) first.
//
// Remotion renders frames independently, so there are no clocks here: time is a pure function of the frame.
//   const f = useCurrentFrame();
//   const t = ms(f);                       // or ms(f - s.at) for time since an item landed
//   const bob = 4 * wave(t, 3600, seeded(i));
// No Math.random(), no timers, no CSS animation: everything below is deterministic per frame.
import { Easing } from "remotion";
import { FPS } from "./core";

/** frames -> milliseconds (the engine's unit, like the skill's recipes) */
export const ms = (frame: number, fps = FPS) => (frame * 1000) / fps;

/** Things that travel (gaze, sway, a head turning, a lid closing). */
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
/** Things that open or arrive (a mouth, a lid reopening, a prop appearing). */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** Only for things leaving or falling away. */
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);

/** A keyframe: time (ms), value, and the curve of the segment ARRIVING here ('out', or ease-in-out by default). */
export type Key = readonly [number, number, "out"?];
export type Keys = readonly Key[];

/** ONE move (a blink, a lid, a door): eases into and out of every key. Last key = first, so loops never jump. */
export function track(t: number, keys: Keys): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const k1 = keys[i];
    if (t <= k1[0]) {
      const k0 = keys[i - 1];
      const span = k1[0] - k0[0];
      const p = span > 0 ? (t - k0[0]) / span : 1;
      const e = k1[2] === "out" ? EASE_OUT(p) : EASE_IN_OUT(p);
      return k0[1] + (k1[1] - k0[1]) * e;
    }
  }
  return keys[keys.length - 1][1];
}

/** A key pose for `flow`: time (ms) and value, sorted by time. */
export type FlowKey = readonly [number, number];

/**
 * Acting (a chain of poses: a body, arms, a head turn). Passes through every key with a continuous speed and
 * never overshoots one (monotone cubic), so the character doesn't stop dead at each pose like a robot.
 * Repeat a value to hold, and layer idle `wave`s on top of the hold.
 */
export function flow(t: number, k: readonly FlowKey[]): number {
  const n = k.length;
  if (t <= k[0][0]) return k[0][1];
  if (t >= k[n - 1][0]) return k[n - 1][1];
  let i = 0;
  while (k[i + 1][0] < t) i++;
  const slope = (j: number) => (k[j + 1][1] - k[j][1]) / (k[j + 1][0] - k[j][0]);
  const tangent = (j: number) => {
    if (j === 0 || j === n - 1) return 0;
    const a = slope(j - 1);
    const b = slope(j);
    if (a * b <= 0) return 0;
    const h0 = k[j][0] - k[j - 1][0];
    const h1 = k[j + 1][0] - k[j][0];
    const w0 = 2 * h1 + h0;
    const w1 = h1 + 2 * h0;
    return (w0 + w1) / (w0 / a + w1 / b);
  };
  const h = k[i + 1][0] - k[i][0];
  const s = (t - k[i][0]) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * k[i][1] +
    (s3 - 2 * s2 + s) * h * tangent(i) +
    (-2 * s3 + 3 * s2) * k[i + 1][1] +
    (s3 - s2) * h * tangent(i + 1)
  );
}

/** 0 -> 1 inside the window [a, b] ms (eased), 0 before, 1 after. One beat of a scene. */
export function seg(t: number, a: number, b: number, curve: "out" | "inOut" = "out"): number {
  if (t <= a) return 0;
  if (t >= b) return 1;
  const p = (t - a) / (b - a);
  return curve === "out" ? EASE_OUT(p) : EASE_IN_OUT(p);
}

/** A smooth back-and-forth from -1 to 1 (sway, bob, breathing). `phase` (0 to 1) offsets one item from the next. */
export function wave(t: number, period: number, phase = 0): number {
  return Math.sin((t / period + phase) * Math.PI * 2);
}

/** Progress through a loop, 0 to 1, with a phase (drifting or falling items). Linear. */
export function loop(t: number, period: number, phase = 0): number {
  const p = (t / period + phase) % 1;
  return p < 0 ? p + 1 : p;
}

/** 0 at both ends of a loop and 1 in the middle: fade in and out (steam, sparkles, ripples). */
export function bell(p: number): number {
  return Math.sin(Math.PI * Math.min(1, Math.max(0, p)));
}

/** A stable pseudo-random number in [0, 1) for item `i`: variety that is the same every render. */
export function seeded(i: number, salt = 0): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Idle life for a picture / sticker / card that is on screen: a float on one period and a small sway on another,
 * out of phase with its neighbours (pass the item's index). Amplitudes are the house ones (float ±4 px, sway ±1.6°);
 * scale them down rather than up.
 */
export function idle(t: number, i: number, amp = 1) {
  const p = seeded(i);
  const speed = 0.85 + seeded(i, 1) * 0.3; // ±15% so neighbours never sync
  return {
    y: amp * 4 * wave(t * speed, 3200, p),
    rot: amp * 1.6 * wave(t * speed, 4700, p + 0.3),
    breathe: 1 + amp * 0.012 * wave(t * speed, 3900, p + 0.6),
  };
}
