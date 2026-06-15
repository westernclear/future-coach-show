import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const rows = [
  { rank: 1, name: "You", score: 312.4, you: true },
  { rank: 2, name: "@gridiron_92", score: 298.1 },
  { rank: 3, name: "@calloftheweek", score: 287.6 },
  { rank: 4, name: "@coachwhisperer", score: 271.0 },
  { rank: 5, name: "@4thanddraft", score: 263.8 },
];

export const Scene4Leaderboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const header = spring({ frame: frame - 5, fps, config: { damping: 16 } });
  const climb = spring({ frame: frame - 90, fps, config: { damping: 16, stiffness: 100 } });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(200deg, #FF6B00 0%, #B84800 100%)",
        padding: "180px 80px",
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: "#0a0a0a",
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: header,
        }}
      >
        Week 14 · Leaderboard
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: "Anton, sans-serif",
          fontSize: 130,
          lineHeight: 0.88,
          color: "#0a0a0a",
          textTransform: "uppercase",
          letterSpacing: -3,
          opacity: header,
        }}
      >
        Climb the<br />board.
      </div>

      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r, i) => {
          const s = spring({ frame: frame - (40 + i * 10), fps, config: { damping: 18 } });
          const youLift = r.you ? interpolate(climb, [0, 1], [0, -8]) : 0;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "22px 30px",
                background: r.you ? "#0a0a0a" : "rgba(0,0,0,0.12)",
                color: r.you ? "#fff" : "#0a0a0a",
                border: r.you ? "3px solid #fff" : "none",
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-50, 0])}px) translateY(${youLift}px)`,
                boxShadow: r.you ? "0 20px 50px rgba(0,0,0,0.4)" : "none",
              }}
            >
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 56, width: 90 }}>
                {String(r.rank).padStart(2, "0")}
              </div>
              <div style={{ flex: 1, fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 38 }}>
                {r.name}
              </div>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 52, color: r.you ? "#FF6B00" : "#0a0a0a" }}>
                {r.score.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
