// Every overlay/SFX frame is derived from the clip data, so changing a cut in config.json
// (then re-running gen_data.py) moves all cards and sounds with it. No hand-shifting.
import { CLIPS, type ClipData } from "./data/clips";

export const FPS = 30;

export const makeTimeline = <T extends Record<string, ClipData>>(clips: T) => {
  type Id = keyof T & string;
  /** Clip order on the timeline (back-to-back; flash overlays don't consume frames). */
  const ORDER = Object.keys(clips) as Id[];
  const START = {} as Record<Id, number>;
  let t = 0;
  for (const id of ORDER) {
    START[id] = t;
    t += clips[id].frames;
  }
  return {
    ORDER,
    START,
    TOTAL_FRAMES: t,
    /** Absolute frame of a local offset inside a clip. */
    at: (id: Id, local: number) => START[id] + local,
    /** Clip end (absolute) plus an offset. */
    end: (id: Id, offset = 0) => START[id] + clips[id].frames + offset,
    /** Absolute frame where `text` is spoken in clip `id` (nth match, case-insensitive, punctuation ignored). */
    word: (id: Id, text: string, nth = 0) => {
      const norm = (s: string) => s.trim().toLowerCase().replace(/[.,?!"“”]/g, "");
      const w = clips[id].words.filter((x) => norm(x.text) === norm(text))[nth];
      if (!w) throw new Error(`word "${text}" (#${nth}) not found in clip ${id}`);
      return START[id] + Math.round((w.startMs * FPS) / 1000);
    },
  };
};

export const { ORDER, START, TOTAL_FRAMES, at, end, word } = makeTimeline(CLIPS);
