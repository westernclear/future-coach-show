import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const FifaScene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, 120], [1.05, 1.2]);
  const num = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 130 } });
  const sub = spring({ frame: frame - 45, fps, config: { damping: 18 } });
  const cup = spring({ frame: frame - 80, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <Img
        src={staticFile("images/stadium.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom})`,
          filter: "contrast(1.15) saturate(0.7) brightness(0.4) hue-rotate(200deg)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,23,46,0.7) 0%, rgba(7,23,46,0.95) 100%)",
        }}
      />

      <AbsoluteFill style={{ padding: "180px 80px", justifyContent: "center", alignItems: "flex-start" }}>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: "#E9C758",
            letterSpacing: 8,
            textTransform: "uppercase",
            opacity: interpolate(frame, [0, 20], [0, 1]),
          }}
        >
          Limited · World Cup edition
        </div>

        <div
          style={{
            marginTop: 24,
            fontFamily: "Anton, sans-serif",
            fontSize: 380,
            lineHeight: 0.85,
            color: "#fff",
            letterSpacing: -8,
            opacity: num,
            transform: `scale(${interpolate(num, [0, 1], [0.6, 1])})`,
            transformOrigin: "left center",
          }}
        >
          48
        </div>
        <div
          style={{
            fontFamily: "Anton, sans-serif",
            fontSize: 90,
            lineHeight: 0.9,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: -1,
            opacity: sub,
            transform: `translateY(${interpolate(sub, [0, 1], [30, 0])}px)`,
          }}
        >
          coaches.
        </div>

        <div
          style={{
            marginTop: 50,
            fontFamily: "Anton, sans-serif",
            fontSize: 80,
            lineHeight: 0.95,
            color: "#E9C758",
            textTransform: "uppercase",
            opacity: cup,
            transform: `translateX(${interpolate(cup, [0, 1], [-40, 0])}px)`,
          }}
        >
          one cup.<br />one trophy.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
