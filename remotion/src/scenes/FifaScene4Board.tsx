import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const rows = [
  { rank: 1, name: "You", code: "USA", color: "#0A3161", score: 487.2, you: true },
  { rank: 2, name: "@futbol_jefe", code: "MEX", color: "#006847", score: 471.5 },
  { rank: 3, name: "@gaffer_global", code: "ENG", color: "#C8102E", score: 463.0 },
  { rank: 4, name: "@taticas_br", code: "BRA", color: "#009B3A", score: 451.8 },
  { rank: 5, name: "@der_trainer", code: "GER", color: "#1C1C1C", score: 442.4 },
];


export const FifaScene4Board: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const header = spring({ frame: frame - 5, fps, config: { damping: 16 } });
  const climb = spring({ frame: frame - 100, fps, config: { damping: 14, stiffness: 100 } });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(200deg, #0E7A3F 0%, #07172E 100%)",
        padding: "180px 70px",
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: "#E9C758",
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: header,
        }}
      >
        Global · Group stage
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: "Anton, sans-serif",
          fontSize: 125,
          lineHeight: 0.88,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: -3,
          opacity: header,
        }}
      >
        Climb the<br />
        <span style={{ color: "#E9C758" }}>world.</span>
      </div>

      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r, i) => {
          const s = spring({ frame: frame - (40 + i * 10), fps, config: { damping: 18 } });
          const youLift = r.you ? interpolate(climb, [0, 1], [0, -10]) : 0;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "20px 28px",
                background: r.you ? "#E9C758" : "rgba(255,255,255,0.08)",
                color: r.you ? "#07172E" : "#fff",
                border: r.you ? "3px solid #fff" : "1px solid rgba(255,255,255,0.1)",
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-50, 0])}px) translateY(${youLift}px)`,
                boxShadow: r.you ? "0 20px 50px rgba(0,0,0,0.5)" : "none",
              }}
            >
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 52, width: 90 }}>
                {String(r.rank).padStart(2, "0")}
              </div>
              <div
                style={{
                  width: 86,
                  height: 56,
                  marginRight: 18,
                  background: r.color,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Anton, sans-serif",
                  fontSize: 28,
                  letterSpacing: 1,
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                {r.code}
              </div>
              <div style={{ flex: 1, fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 36 }}>
                {r.name}
              </div>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 48, color: r.you ? "#07172E" : "#E9C758" }}>
                {r.score.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
