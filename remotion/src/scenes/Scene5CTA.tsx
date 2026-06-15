import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const tag = spring({ frame: frame - 25, fps, config: { damping: 18 } });
  const cta = spring({ frame: frame - 60, fps, config: { damping: 14 } });
  const url = spring({ frame: frame - 95, fps, config: { damping: 18 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.02;

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #1a1a1a 0%, #000 80%)",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          opacity: logo,
          transform: `scale(${interpolate(logo, [0, 1], [0.6, 1]) * pulse})`,
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            background: "#FF6B00",
            display: "grid",
            placeItems: "center",
            fontFamily: "Anton, sans-serif",
            fontSize: 110,
            color: "#0a0a0a",
            letterSpacing: -2,
          }}
        >
          CF
        </div>
      </div>

      <div
        style={{
          marginTop: 50,
          fontFamily: "Anton, sans-serif",
          fontSize: 130,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: -3,
          lineHeight: 0.9,
          textAlign: "center",
          opacity: tag,
          transform: `translateY(${interpolate(tag, [0, 1], [30, 0])}px)`,
        }}
      >
        Coach<span style={{ color: "#FF6B00" }}>Face</span>
      </div>

      <div
        style={{
          marginTop: 24,
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 36,
          color: "#bbb",
          textAlign: "center",
          letterSpacing: 1,
          opacity: tag,
        }}
      >
        The decision makers
        <br />
        are now in play.
      </div>

      <div
        style={{
          marginTop: 70,
          padding: "28px 64px",
          background: "#FF6B00",
          color: "#0a0a0a",
          fontFamily: "Anton, sans-serif",
          fontSize: 52,
          textTransform: "uppercase",
          letterSpacing: 2,
          opacity: cta,
          transform: `scale(${interpolate(cta, [0, 1], [0.8, 1])})`,
        }}
      >
        Play Free
      </div>

      <div
        style={{
          marginTop: 36,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 38,
          color: "#fff",
          letterSpacing: 4,
          opacity: url,
        }}
      >
        COACHFACE.COM
      </div>
    </AbsoluteFill>
  );
};
