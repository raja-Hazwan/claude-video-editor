import { loadFont } from "@remotion/google-fonts/Montserrat";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });

const YELLOW = "#FFD60A";
const RED = "#E63946";
const GOLD = "#CCB375"; // The Returning Soul brand gold

const inOut = (frame: number, dur: number, len = 10) =>
  interpolate(frame, [0, len, dur - len, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

/** Dark top gradient + vignette so titles and captions stay readable. */
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 85% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.35) 100%)",
      }}
    />
    {/* Bottom fade: hides the source's venue bar and donation banner instead of zooming past them */}
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1480px, rgba(0,0,0,0.92) 1630px, #000 1660px)",
      }}
    />
  </AbsoluteFill>
);

/** Quick white flash on cuts between highlights. */
export const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
        opacity: interpolate(frame, [0, 3, 10], [0, 0.75, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div style={{ height: 12, backgroundColor: "rgba(255,255,255,0.18)" }}>
        <div
          style={{
            height: "100%",
            width: `${(frame / (durationInFrames - 1)) * 100}%`,
            backgroundColor: YELLOW,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Content block that lives in the top band (above the speaker's head). */
const TopBand: React.FC<{ children: React.ReactNode; opacity: number; y: number }> = ({
  children,
  opacity,
  y,
}) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        width: 920,
        opacity,
        translate: `0px ${y}px`,
        fontFamily,
        textAlign: "center",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string }> = ({
  children,
  bg = RED,
  color = "white",
}) => (
  <div
    style={{
      backgroundColor: bg,
      color,
      fontWeight: 800,
      fontSize: 40,
      letterSpacing: 2,
      padding: "10px 28px",
      borderRadius: 14,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const Headline: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({
  children,
  size = 92,
  color = "white",
}) => (
  <div
    style={{
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.05,
      color,
      textTransform: "uppercase",
      WebkitTextStroke: "12px black",
      paintOrder: "stroke fill",
      textShadow: "0 10px 30px rgba(0,0,0,0.6)",
    }}
  >
    {children}
  </div>
);

export const HookTitle: React.FC<{ durationInFrames: number; label: string; title: string; size?: number }> = ({
  durationInFrames,
  label,
  title,
  size = 92,
}) => {
  const frame = useCurrentFrame();
  return (
    <TopBand
      opacity={inOut(frame, durationInFrames, 8)}
      y={interpolate(frame, [0, 10], [-60, 0], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.back(1.6)),
      })}
    >
      <Pill>{label}</Pill>
      <div
        style={{
          scale: interpolate(frame, [6, 16], [0.6, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(2.2)),
          }),
        }}
      >
        <Headline color={YELLOW} size={size}>
          {title}
        </Headline>
      </div>
    </TopBand>
  );
};

export const NameTag: React.FC<{ durationInFrames: number; name: string }> = ({ durationInFrames, name }) => {
  const frame = useCurrentFrame();
  return (
    <TopBand
      opacity={inOut(frame, durationInFrames)}
      y={interpolate(frame, [0, 12], [-30, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) })}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          backgroundColor: "rgba(0,0,0,0.6)",
          borderLeft: `10px solid ${YELLOW}`,
          padding: "16px 30px",
          borderRadius: 14,
        }}
      >
        <span style={{ color: "white", fontWeight: 800, fontSize: 46 }}>{name}</span>
      </div>
    </TopBand>
  );
};

/** Key idea card: small label + big statement, pops into the top band. */
export const KeyCard: React.FC<{
  durationInFrames: number;
  label: string;
  title: string;
  sub?: string;
}> = ({ durationInFrames, label, title, sub }) => {
  const frame = useCurrentFrame();
  return (
    <TopBand opacity={inOut(frame, durationInFrames, 8)} y={0}>
      <Pill bg={YELLOW} color="black">
        {label}
      </Pill>
      <div
        style={{
          scale: interpolate(frame, [0, 10], [0.5, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(2.4)),
          }),
        }}
      >
        <Headline size={title.length > 14 ? 76 : 96}>{title}</Headline>
      </div>
      {sub ? (
        <div
          style={{
            color: "white",
            fontWeight: 600,
            fontSize: 44,
            lineHeight: 1.2,
            backgroundColor: "rgba(0,0,0,0.55)",
            padding: "6px 22px",
            borderRadius: 12,
            opacity: interpolate(frame, [8, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {sub}
        </div>
      ) : null}
    </TopBand>
  );
};

export const EndCard: React.FC<{
  durationInFrames: number;
  message: string;
  sub: string;
  speaker: string;
  source: string;
}> = ({ durationInFrames, message, sub, speaker, source }) => {
  const frame = useCurrentFrame();
  const bg = interpolate(frame, [0, 10], [0, 0.72], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(0,0,0,${bg})`,
        backdropFilter: `blur(${interpolate(frame, [0, 10], [0, 14], { extrapolateRight: "clamp" })}px)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          width: 900,
          textAlign: "center",
          fontFamily,
          opacity: inOut(frame, durationInFrames + 20, 8),
          scale: interpolate(frame, [0, 12], [0.85, 1], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.back(1.8)),
          }),
        }}
      >
        <Headline size={104} color={YELLOW}>
          {message}
        </Headline>
        <div style={{ color: "white", fontWeight: 600, fontSize: 46, lineHeight: 1.25 }}>
          {sub}
        </div>
        <div style={{ width: 160, height: 8, borderRadius: 4, backgroundColor: RED }} />
        <div style={{ color: "white", fontWeight: 800, fontSize: 44 }}>{speaker}</div>
        <div style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 32 }}>
          Sumber: {source}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            marginTop: 50,
            opacity: interpolate(frame, [20, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [20, 36], ["0px 40px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }),
          }}
        >
          <div style={{ color: GOLD, fontWeight: 600, fontSize: 28, letterSpacing: 8, textTransform: "uppercase" }}>
            Edited by
          </div>
          <Img src={staticFile("brand/logo-lockup.png")} style={{ width: 400 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
