import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const events = [
  { label: "4th down conversion", pts: 4.0, at: 20 },
  { label: "Red-zone touchdown", pts: 3.5, at: 55 },
  { label: "Challenge won", pts: 2.0, at: 90 },
  { label: "Clock management", pts: 1.5, at: 125 },
];

export const Scene3Scoring: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const header = spring({ frame: frame - 5, fps, config: { damping: 16 } });

  const total = events.reduce((acc, e) => {
    if (frame >= e.at) return acc + e.pts;
    return acc;
  }, 0);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #161616 100%)",
        padding: "180px 80px",
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: "#FF6B00",
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: header,
        }}
      >
        Live scoring
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: "Anton, sans-serif",
          fontSize: 110,
          lineHeight: 0.9,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: -2,
          opacity: header,
        }}
      >
        Every call,<br />scored.
      </div>

      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 20 }}>
        {events.map((e, i) => {
          const s = spring({ frame: frame - e.at, fps, config: { damping: 14, stiffness: 200 } });
          const flash = interpolate(frame - e.at, [0, 6, 18], [1, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "26px 32px",
                background: `rgba(255,107,0,${0.08 + flash * 0.25})`,
                borderLeft: "6px solid #FF6B00",
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [80, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 36, color: "#fff" }}>
                {e.label}
              </div>
              <div
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: 64,
                  color: "#FF6B00",
                }}
              >
                +{e.pts.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 70,
          padding: "32px 40px",
          background: "#fff",
          color: "#0a0a0a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 32, textTransform: "uppercase", letterSpacing: 2 }}>
          Coach Score
        </div>
        <div style={{ fontFamily: "Anton, sans-serif", fontSize: 110, lineHeight: 1, color: "#0a0a0a" }}>
          {total.toFixed(1)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
