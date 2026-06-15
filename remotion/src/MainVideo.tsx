import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Anton";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Draft } from "./scenes/Scene2Draft";
import { Scene3Scoring } from "./scenes/Scene3Scoring";
import { Scene4Leaderboard } from "./scenes/Scene4Leaderboard";
import { Scene5CTA } from "./scenes/Scene5CTA";

loadDisplay();
loadBody("normal", { weights: ["400", "700", "900"] });

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const x = (frame * 7) % 13;
  const y = (frame * 11) % 17;
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.04) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,107,0,0.06) 0, transparent 45%)",
        transform: `translate(${x}px, ${y}px)`,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.7) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const flashes = [0, 180, 360, 540, 720];
  const flash = flashes.reduce((acc, f) => {
    const d = frame - f;
    if (d < 0 || d > 6) return acc;
    return Math.max(acc, interpolate(d, [0, 3, 6], [0, 0.5, 0], { extrapolateRight: "clamp" }));
  }, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
      <Audio src={staticFile("audio/music.mp3")} volume={0.35} />
      <Sequence from={30}>
        <Audio src={staticFile("audio/vo.mp3")} volume={1} />
      </Sequence>

      <Sequence from={0} durationInFrames={120}><Scene1Hook /></Sequence>
      <Sequence from={120} durationInFrames={180}><Scene2Draft /></Sequence>
      <Sequence from={300} durationInFrames={210}><Scene3Scoring /></Sequence>
      <Sequence from={510} durationInFrames={210}><Scene4Leaderboard /></Sequence>
      <Sequence from={720} durationInFrames={180}><Scene5CTA /></Sequence>

      <Vignette />
      <Grain />
      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
