import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, 120], [1.0, 1.18]);
  const imgOpacity = interpolate(frame, [0, 15, 100, 120], [0, 1, 1, 0.3]);
  const line1 = spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 140 } });
  const line2 = spring({ frame: frame - 55, fps, config: { damping: 18, stiffness: 140 } });
  const accent = spring({ frame: frame - 85, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <Img
        src={staticFile("images/stadium.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom})`,
          opacity: imgOpacity,
          filter: "contrast(1.1) saturate(0.85) brightness(0.55)",
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)" }} />

      <AbsoluteFill style={{ padding: "180px 80px 200px", justifyContent: "flex-end" }}>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: 130,
              lineHeight: 0.92,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: -3,
              transform: `translateY(${interpolate(line1, [0, 1], [120, 0])}px)`,
              opacity: line1,
            }}
          >
            The game
          </div>
        </div>
        <div style={{ overflow: "hidden", marginTop: 8 }}>
          <div
            style={{
              fontFamily: "Anton, sans-serif",
              fontSize: 130,
              lineHeight: 0.92,
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: -3,
              transform: `translateY(${interpolate(line2, [0, 1], [120, 0])}px)`,
              opacity: line2,
            }}
          >
            behind the <span style={{ color: "#FF6B00" }}>game.</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 32,
            height: 6,
            background: "#FF6B00",
            width: `${interpolate(accent, [0, 1], [0, 60])}%`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
