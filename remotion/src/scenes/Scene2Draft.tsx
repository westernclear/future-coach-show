import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const coaches = [
  { initials: "AR", name: "Andy Reid", role: "Chiefs · NFL" },
  { initials: "MA", name: "Mikel Arteta", role: "Arsenal · EPL" },
  { initials: "LE", name: "Luis Enrique", role: "PSG · UCL" },
  { initials: "DR", name: "Dave Roberts", role: "Dodgers · MLB" },
];

export const Scene2Draft: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eyebrow = spring({ frame: frame - 5, fps, config: { damping: 18 } });
  const title = spring({ frame: frame - 18, fps, config: { damping: 16, stiffness: 130 } });
  const strike = interpolate(frame, [55, 80], [0, 1], { extrapolateRight: "clamp" });
  const swap = spring({ frame: frame - 75, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #0d0d0d 0%, #1a1a1a 100%)",
        padding: "200px 80px",
      }}
    >
      <div
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 28,
          color: "#FF6B00",
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: eyebrow,
          transform: `translateY(${interpolate(eyebrow, [0, 1], [20, 0])}px)`,
        }}
      >
        Coachface · Fantasy
      </div>

      <div
        style={{
          marginTop: 24,
          fontFamily: "Anton, sans-serif",
          fontSize: 140,
          lineHeight: 0.9,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: -3,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [40, 0])}px)`,
          position: "relative",
          display: "inline-block",
        }}
      >
        Don't draft<br />
        <span style={{ position: "relative", display: "inline-block" }}>
          the players.
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: 12,
              background: "#FF6B00",
              transform: `scaleX(${strike})`,
              transformOrigin: "left",
            }}
          />
        </span>
        <br />
        <span
          style={{
            color: "#FF6B00",
            opacity: swap,
            display: "inline-block",
            transform: `translateY(${interpolate(swap, [0, 1], [30, 0])}px)`,
          }}
        >
          Draft the coaches.
        </span>
      </div>

      <div style={{ marginTop: 80, display: "flex", flexDirection: "column", gap: 18 }}>
        {coaches.map((c, i) => {
          const s = spring({ frame: frame - (110 + i * 12), fps, config: { damping: 18, stiffness: 180 } });
          return (
            <div
              key={c.initials}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "20px 28px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,107,0,0.4)",
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  background: "#FF6B00",
                  color: "#0a0a0a",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Anton, sans-serif",
                  fontSize: 36,
                }}
              >
                {c.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 36, color: "#fff" }}>
                  {c.name}
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 24, color: "#999", marginTop: 2 }}>
                  {c.role}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: 28,
                  color: "#FF6B00",
                  border: "2px solid #FF6B00",
                  padding: "8px 18px",
                }}
              >
                +
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
