import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const events = [
  { label: "Starting XI confirmed", pts: 5.0, at: 15 },
  { label: "Tactical switch · 4-3-3", pts: 3.5, at: 50 },
  { label: "60' substitution", pts: 2.5, at: 90 },
  { label: "Match result · Win", pts: 6.0, at: 130 },
];

export const FifaScene3Live: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const header = spring({ frame: frame - 5, fps, config: { damping: 16 } });
  const total = events.reduce((acc, e) => (frame >= e.at ? acc + e.pts : acc), 0);

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #07172E 0%, #0B2444 100%)",
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
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#FF3B3B",
            boxShadow: `0 0 ${10 + Math.sin(frame / 4) * 6}px #FF3B3B`,
          }}
        />
        LIVE · Match day
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: "Anton, sans-serif",
          fontSize: 115,
          lineHeight: 0.9,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: -2,
          opacity: header,
        }}
      >
        Every call,<br />scored.
      </div>

      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 18 }}>
        {events.map((e, i) => {
          const s = spring({ frame: frame - e.at, fps, config: { damping: 14, stiffness: 200 } });
          const flash = interpolate(frame - e.at, [0, 6, 22], [1, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "24px 28px",
                background: `rgba(233,199,88,${0.08 + flash * 0.28})`,
                borderLeft: "6px solid #E9C758",
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [80, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 32, color: "#fff" }}>
                {e.label}
              </div>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 60, color: "#E9C758" }}>
                +{e.pts.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 60,
          padding: "30px 36px",
          background: "#E9C758",
          color: "#07172E",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 30, textTransform: "uppercase", letterSpacing: 2 }}>
          Manager Score
        </div>
        <div style={{ fontFamily: "Anton, sans-serif", fontSize: 110, lineHeight: 1 }}>
          {total.toFixed(1)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
