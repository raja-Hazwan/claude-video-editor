import { loadFont } from "@remotion/google-fonts/Montserrat";
import { AbsoluteFill, Img, Still, staticFile } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["800", "900"], subsets: ["latin"] });
const YELLOW = "#FFD60A";
const RED = "#E63946";

// TikTok cover: 1080x1920. Text kept inside the centre 3:4 band (y 240-1680) that the profile grid shows.
export const ThumbnailStill = () => (
  <Still id="Thumbnail" component={Thumbnail} width={1080} height={1920} />
);

const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black", fontFamily }}>
    {/* Source frame 0:00.3, cropped 9:16 around the face */}
    <Img
      src={staticFile("cover-frame.png")}
      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.08) saturate(1.15)", scale: "1.04", translate: "0 -40px" }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0) 320px, rgba(0,0,0,0) 980px, rgba(0,0,0,0.75) 1300px, rgba(0,0,0,0.92) 1920px)",
      }}
    />
    <AbsoluteFill style={{ boxShadow: "inset 0 0 260px rgba(0,0,0,0.55)" }} />

    <AbsoluteFill style={{ top: 1100, alignItems: "center", textAlign: "center", padding: "0 30px" }}>
      <div
        style={{
          backgroundColor: RED,
          color: "white",
          fontWeight: 900,
          fontSize: 50,
          letterSpacing: 2,
          padding: "12px 34px",
          borderRadius: 16,
          textTransform: "uppercase",
          rotate: "-2deg",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        Ditegur, terus kata:
      </div>
      <div
        style={{
          marginTop: 26,
          fontWeight: 900,
          fontSize: 112,
          whiteSpace: "nowrap",
          letterSpacing: -2,
          lineHeight: 1.0,
          color: YELLOW,
          textTransform: "uppercase",
          WebkitTextStroke: "16px black",
          paintOrder: "stroke fill",
          textShadow: "0 12px 40px rgba(0,0,0,0.7)",
        }}
      >
        “Orang lain
        <br />
        lagi teruk!”
      </div>
      <div
        style={{
          marginTop: 34,
          color: "white",
          fontWeight: 800,
          fontSize: 44,
          backgroundColor: "rgba(0,0,0,0.6)",
          borderLeft: `10px solid ${YELLOW}`,
          padding: "12px 28px",
          borderRadius: 12,
        }}
      >
        Prof. Dr. Rozaimi
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
