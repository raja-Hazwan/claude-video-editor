import { createTikTokStyleCaptions, type TikTokPage } from "@remotion/captions";
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Word } from "./data/clips";

const { fontFamily } = loadFont("normal", { weights: ["900"], subsets: ["latin"] });

const SWITCH_CAPTIONS_EVERY_MS = 1000;
const PAUSE_SPLIT_MS = 700;
const ACTIVE = "#FFD60A";
const KEY_BG = "#E63946";

const CaptionPage: React.FC<{ page: TikTokPage; keys: Set<number>; top: number }> = ({ page, keys, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: top }}>
      <div
        style={{
          width: 800,
          textAlign: "center",
          fontFamily,
          fontWeight: 900,
          fontSize: 66,
          lineHeight: 1.18,
          textTransform: "uppercase",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          rowGap: 5,
          color: "white",
          WebkitTextStroke: "11px black",
          paintOrder: "stroke fill",
          textShadow: "0 8px 24px rgba(0,0,0,0.55)",
          scale: interpolate(frame, [0, 6], [0.82, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(2)),
          }),
          opacity: interpolate(frame, [0, 3], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {page.tokens.map((token) => {
          const isActive = token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          const isKey = keys.has(token.fromMs);
          const highlight = isActive && isKey;
          return (
            <span
              key={token.fromMs}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                color: highlight ? "white" : isActive ? ACTIVE : isKey ? ACTIVE : "white",
                backgroundColor: highlight ? KEY_BG : "transparent",
                WebkitTextStroke: highlight ? "0px" : "11px black",
                borderRadius: 14,
                padding: highlight ? "0 11px" : "0 10px",
                margin: highlight ? "0 5px" : "0",
                translate: isActive ? "0px -3px" : "0px 0px",
              }}
            >
              {token.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Word-by-word TikTok-style captions for one clip (times relative to the clip start). */
export const Captions: React.FC<{ words: Word[]; durationInFrames: number; top?: number }> = ({
  words,
  durationInFrames,
  top = 1180,
}) => {
  const { fps } = useVideoConfig();

  const { pages, keys } = useMemo(() => {
    const keys = new Set(words.filter((w) => w.key).map((w) => w.startMs));
    // Never let a page span a pause (e.g. an Arabic recitation): split at gaps, then page each run.
    const runs: Word[][] = [];
    for (const w of words) {
      const run = runs[runs.length - 1];
      if (run && w.startMs - run[run.length - 1].endMs <= PAUSE_SPLIT_MS) run.push(w);
      else runs.push([w]);
    }
    const pages = runs.flatMap(
      (run) =>
        createTikTokStyleCaptions({
          captions: run.map(({ key: _key, ...c }) => c),
          combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
        }).pages,
    );
    return { pages, keys };
  }, [words]);

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const lastToken = page.tokens[page.tokens.length - 1];
        const endFrame = Math.min(
          nextPage ? Math.round((nextPage.startMs / 1000) * fps) : durationInFrames,
          Math.round((lastToken.toMs / 1000) * fps) + 18,
          durationInFrames,
        );
        if (endFrame - startFrame <= 0) return null;
        return (
          <Sequence key={index} from={startFrame} durationInFrames={endFrame - startFrame} name={`Caption ${index + 1}`}>
            <CaptionPage page={page} keys={keys} top={top} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
