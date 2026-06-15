import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { FifaScene1Hook } from "./scenes/FifaScene1Hook";
import { FifaScene2Pick } from "./scenes/FifaScene2Pick";
import { FifaScene3Live } from "./scenes/FifaScene3Live";
import { FifaScene4Board } from "./scenes/FifaScene4Board";
import { FifaScene5CTA } from "./scenes/FifaScene5CTA";

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
      pointerEvents: "none",
    }}
  />
);

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const x = (frame * 7) % 13;
  const y = (frame * 11) % 17;
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          "radial-gradient(circle at 25% 25%, rgba(233,199,88,0.05) 0, transparent 40%), radial-gradient(circle at 75% 80%, rgba(14,122,63,0.08) 0, transparent 45%)",
        transform: `translate(${x}px, ${y}px)`,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

export const FifaVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const flashes = [0, 120, 300, 510, 720];
  const flash = flashes.reduce((acc, f) => {
    const d = frame - f;
    if (d < 0 || d > 6) return acc;
    return Math.max(acc, interpolate(d, [0, 3, 6], [0, 0.45, 0], { extrapolateRight: "clamp" }));
  }, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "#07172E", overflow: "hidden" }}>
      <Audio src={staticFile("audio/music-fifa.mp3")} volume={0.32} />
      <Sequence from={30}>
        <Audio src={staticFile("audio/vo-fifa.mp3")} volume={1} />
      </Sequence>

      <Sequence from={0} durationInFrames={120}><FifaScene1Hook /></Sequence>
      <Sequence from={120} durationInFrames={180}><FifaScene2Pick /></Sequence>
      <Sequence from={300} durationInFrames={210}><FifaScene3Live /></Sequence>
      <Sequence from={510} durationInFrames={210}><FifaScene4Board /></Sequence>
      <Sequence from={720} durationInFrames={180}><FifaScene5CTA /></Sequence>

      <Vignette />
      <Grain />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
