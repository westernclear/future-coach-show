import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const FifaScene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const trophy = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const title = spring({ frame: frame - 20, fps, config: { damping: 16 } });
  const cta = spring({ frame: frame - 55, fps, config: { damping: 14 } });
  const brand = spring({ frame: frame - 95, fps, config: { damping: 18 } });
  const url = spring({ frame: frame - 120, fps, config: { damping: 18 } });
  const pulse = 1 + Math.sin(frame / 5) * 0.025;

  // Radial gold glow
  const glow = 0.3 + Math.sin(frame / 10) * 0.1;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 35%, rgba(233,199,88,${glow}) 0%, #07172E 60%, #000 100%)`,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          fontSize: 280,
          lineHeight: 1,
          opacity: trophy,
          transform: `scale(${interpolate(trophy, [0, 1], [0.4, 1]) * pulse})`,
          filter: "drop-shadow(0 0 40px rgba(233,199,88,0.7))",
        }}
      >
        🏆
      </div>

      <div
        style={{
          marginTop: 30,
          fontFamily: "Anton, sans-serif",
          fontSize: 110,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: -2,
          lineHeight: 0.92,
          textAlign: "center",
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [30, 0])}px)`,
        }}
      >
        Build your<br />
        <span style={{ color: "#E9C758" }}>FIFA Special XI</span>
      </div>

      <div
        style={{
          marginTop: 45,
          padding: "30px 70px",
          background: "#E9C758",
          color: "#07172E",
          fontFamily: "Anton, sans-serif",
          fontSize: 54,
          textTransform: "uppercase",
          letterSpacing: 2,
          opacity: cta,
          transform: `scale(${interpolate(cta, [0, 1], [0.8, 1])})`,
          boxShadow: "0 20px 50px rgba(233,199,88,0.4)",
        }}
      >
        Enter Free
      </div>

      <div
        style={{
          marginTop: 60,
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: brand,
        }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            background: "#FF6B00",
            display: "grid",
            placeItems: "center",
            fontFamily: "Anton, sans-serif",
            fontSize: 42,
            color: "#0a0a0a",
          }}
        >
          CF
        </div>
        <div
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: 56,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: -1,
          }}
        >
          Coach<span style={{ color: "#FF6B00" }}>Face</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 30,
          color: "#9bb3d0",
          letterSpacing: 4,
          opacity: url,
        }}
      >
        COACHFACE.COM / FIFA
      </div>
    </AbsoluteFill>
  );
};
