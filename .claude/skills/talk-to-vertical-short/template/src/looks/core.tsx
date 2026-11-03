// Shared pieces for the reel looks (split-screen, behind-the-person, explainer, storytelling, trial-reels,
// ranking-list and the photographic styles). Ported from claude-editing-skills (HyperFrames) to Remotion: every
// look is a layer over the project's approved cut (CLIPS / timeline.ts), timed with word(clip, "x") frames.
import { loadFont } from "@remotion/fonts";
import { Video } from "@remotion/media";
import { Fragment } from "react";
import { AbsoluteFill, Easing, Freeze, interpolate, Series, staticFile, useCurrentFrame } from "remotion";
import { CLIPS, type ClipData } from "../data/clips";
import { ORDER, START } from "../timeline";

// ---------------------------------------------------------------- fonts (public/fonts, copied from .claude/kit/fonts)
const font = (file: string, family: string, weight = "400", style = "normal") =>
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, style });
font("inter-400-normal.woff2", "Inter", "400");
font("inter-500-normal.woff2", "Inter", "500");
font("inter-600-normal.woff2", "Inter", "600");
font("inter-700-normal.woff2", "Inter", "700");
font("inter-800-normal.woff2", "Inter", "800");
font("archivo-black-400-normal.woff2", "Archivo Black");
font("dm-serif-display-400-italic.woff2", "DM Serif Display", "400", "italic");
font("InstrumentSerif-400-normal.woff2", "Instrument Serif");
font("InstrumentSerif-400-italic.woff2", "Instrument Serif", "400", "italic");
font("PixelifySans-500-normal.woff2", "Pixelify Sans", "500");
font("PixelifySans-700-normal.woff2", "Pixelify Sans", "700");
font("TikTokSans.ttf", "TikTok Sans", "100 900");

// ---------------------------------------------------------------- time + easing
export const FPS = 30;
/** seconds -> frames */
export const sec = (s: number) => Math.round(s * FPS);
export const E = {
  lin: Easing.linear,
  out2: Easing.out(Easing.quad),
  out3: Easing.out(Easing.cubic),
  in2: Easing.in(Easing.quad),
  in3: Easing.in(Easing.cubic),
  inOut1: Easing.inOut(Easing.sin),
  inOut2: Easing.inOut(Easing.quad),
  inOut3: Easing.inOut(Easing.cubic),
  back: (k = 1.7) => Easing.out(Easing.back(k)),
};
/** 0 -> 1 between frame `at` and `at + dur` (clamped) */
export const ramp = (f: number, at: number, dur: number, easing: (t: number) => number = E.out3) =>
  interpolate(f, [at, at + Math.max(1, dur)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** "Steal what *works*\nnow" -> text with <em> for *word* and <br/> for \n */
export const rich = (text: string, em: React.CSSProperties = {}) =>
  text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line.split(/(\*[^*]+\*)/).map((p, k) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2 ? <em key={k} style={em}>{p.slice(1, -1)}</em> : p,
      )}
    </Fragment>
  ));

// ---------------------------------------------------------------- the approved words on the whole timeline
export type W = { text: string; f: number; e: number; clip: string };
/** every caption word with absolute frames. "mainan" + "-mainan" join; "duduk dalam" (one token) splits. */
export const WORDS: W[] = (() => {
  const out: W[] = [];
  for (const id of ORDER) {
    for (const w of CLIPS[id].words) {
      const a = START[id] + (w.startMs * FPS) / 1000;
      const b = START[id] + (w.endMs * FPS) / 1000;
      const t = w.text.trim();
      if (t.startsWith("-") && out.length && out[out.length - 1].clip === id) {
        out[out.length - 1] = { ...out[out.length - 1], text: out[out.length - 1].text + t, e: b };
        continue;
      }
      const parts = t.split(/\s+/);
      parts.forEach((p, k) =>
        out.push({ text: p, f: a + ((b - a) * k) / parts.length, e: a + ((b - a) * (k + 1)) / parts.length, clip: id }),
      );
    }
  }
  return out;
})();
/** a word as captions compare it: lowercase, no punctuation */
export const bare = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}'’-]/gu, "").replace(/^-+|-+$/g, "");

/** caption groups: at most maxw words / maxc characters, broken at punctuation, pauses > 0.7 s and clip changes */
export const groups = (maxw: number, maxc: number, punct = true) => {
  const out: W[][] = [];
  let cur: W[] = [];
  for (const w of WORDS) {
    const last = cur[cur.length - 1];
    const len = [...cur, w].map((x) => bare(x.text)).join(" ").length;
    if (cur.length && (cur.length >= maxw || len > maxc || w.clip !== last.clip || w.f - last.e > 0.7 * FPS)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
    if (punct && /[.,?!]$/.test(w.text) && cur.length >= 1) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

/** the group showing at frame f (from its first word until the next group, at most 0.6 s past its last word) */
export const activeGroup = (gs: W[][], f: number, lead = 1) => {
  for (let i = 0; i < gs.length; i++) {
    const g = gs[i];
    const start = g[0].f - lead;
    const next = i + 1 < gs.length ? gs[i + 1][0].f - lead : Infinity;
    if (f >= start && f < Math.min(next, g[g.length - 1].e + 0.6 * FPS)) return { g, i, start };
  }
  return null;
};

// ---------------------------------------------------------------- the clips, back to back
/** the approved cut as a Series: children get each clip (inside its own Sequence, local frames) */
export const ClipSeries: React.FC<{ children: (clip: ClipData) => React.ReactNode }> = ({ children }) => (
  <Series>
    {ORDER.map((id) => (
      <Series.Sequence key={id} name={id} durationInFrames={CLIPS[id].frames} layout="none">
        {children(CLIPS[id])}
      </Series.Sequence>
    ))}
  </Series>
);

/** show a look only between two frames of the timeline, WITHOUT shifting its time (looks use absolute frames) */
export const During: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <>{children}</> : null;
};

/** hold the clip's last real frame once the source file ends (the closer's end-card extend) */
export const FreezeAfter: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) =>
  useCurrentFrame() >= frame ? <Freeze frame={frame}>{children}</Freeze> : <>{children}</>;

// ---------------------------------------------------------------- wide head-and-shoulders framing
// The tight face-tracked crop leaves no room for panels, so the cut-out looks use a wider window of the source,
// scaled to the frame width and placed low; above it a plain wall-coloured fill, its edge feathered.
// public/cutout/<clip>.webm is made from the same window (.claude/kit/cutout_clips.py --crop X,W,H).
// PER PROJECT: x = his centre in the source minus w/2 (read a source frame), h = above any table/desk edge,
// srcEnd = the source's duration (the last frame is held after it). Same numbers as cutout_clips.py --crop X,W,H.
export const WIDE = { x: 500, w: 771, h: 1040, fill: "#E9E7E4", srcW: 1920, srcH: 1080, srcEnd: 211.48 };
export const WIDE_SC = 1080 / WIDE.w;
export const WIDE_TOP = 1920 - WIDE.h * WIDE_SC;
const wideBox: React.CSSProperties = { position: "absolute", left: 0, top: WIDE_TOP, width: 1080, height: WIDE.h * WIDE_SC };
const freezeAt = (clip: ClipData) => Math.min(clip.frames, Math.floor((WIDE.srcEnd - clip.startSec) * FPS));

/** the source in the wide window, with sound (volume per clip-local frame) */
export const WideBase: React.FC<{ clip: ClipData; volume?: (f: number) => number }> = ({ clip, volume }) => (
  <AbsoluteFill style={{ backgroundColor: WIDE.fill }}>
    <FreezeAfter frame={freezeAt(clip)}>
      <div style={{ ...wideBox, overflow: "hidden" }}>
        <Video
          src={staticFile("source.mp4")}
          trimBefore={Math.round(clip.startSec * FPS)}
          volume={volume}
          style={{ position: "absolute", left: -WIDE.x * WIDE_SC, top: 0, width: WIDE.srcW * WIDE_SC, height: WIDE.srcH * WIDE_SC, maxWidth: "none" }}
        />
      </div>
    </FreezeAfter>
    <div style={{ ...wideBox, height: 140, background: `linear-gradient(180deg, ${WIDE.fill} 0%, ${WIDE.fill}00 100%)` }} />
  </AbsoluteFill>
);

/** the speaker alone (alpha), in the same place as WideBase */
export const WideCutout: React.FC<{ clip: ClipData }> = ({ clip }) => (
  <FreezeAfter frame={freezeAt(clip)}>
    <div style={wideBox}>
      <Video src={staticFile(`cutout/${clip.id}.webm`)} muted style={{ width: "100%", height: "100%" }} />
    </div>
  </FreezeAfter>
);

/** bottom fade to black (y 1640 -> 1715): hides the source's account banner and name bars. Above the cut-out. */
export const BottomFade: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 1640px, #000 1715px)", pointerEvents: "none" }} />
);

/** the whole cut in the wide window (base, or the cut-out on its own) */
export const WideCut: React.FC<{ cutout?: boolean; volume?: (clip: ClipData) => ((f: number) => number) | undefined }> = ({ cutout, volume }) => (
  <ClipSeries>{(clip) => (cutout ? <WideCutout clip={clip} /> : <WideBase clip={clip} volume={volume?.(clip)} />)}</ClipSeries>
);

/** a 1080x1920 layer drawn smaller: the presenter box of the photographic styles and the explainer panel */
export const Scaled: React.FC<{ left: number; top: number; width: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  left, top, width, children, style,
}) => (
  <div style={{ position: "absolute", left, top, width: 1080, height: 1920, scale: String(width / 1080), transformOrigin: "0 0", ...style }}>
    {children}
  </div>
);

/** numbers that count up: "10,000" -> [10000, comma]; "4:12" -> [252, time]; "12" -> [12, plain] */
export const parseNumber = (v: string): [number, "comma" | "time" | "plain"] | null => {
  const s = String(v).trim();
  if (/^\d+:\d\d$/.test(s)) {
    const [m, x] = s.split(":");
    return [Number(m) * 60 + Number(x), "time"];
  }
  if (/^\d{1,3}(,\d{3})+$/.test(s)) return [Number(s.replace(/,/g, "")), "comma"];
  if (/^\d+$/.test(s)) return [Number(s), s.length > 3 ? "comma" : "plain"];
  return null;
};
export const formatNumber = (n: number, fmt: "comma" | "time" | "plain") =>
  fmt === "time" ? `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}` : fmt === "comma" ? n.toLocaleString("en-US") : String(n);

/** a full-frame absolute box */
export const FULL: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920 };
