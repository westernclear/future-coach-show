import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const managers = [
  { initials: "LE", name: "Luis Enrique", country: "Spain", code: "ESP", color: "#C60B1E" },
  { initials: "DD", name: "Didier Deschamps", country: "France", code: "FRA", color: "#0055A4" },
  { initials: "JN", name: "Julian Nagelsmann", country: "Germany", code: "GER", color: "#1C1C1C" },
  { initials: "LS", name: "Lionel Scaloni", country: "Argentina", code: "ARG", color: "#74ACDF" },
  { initials: "DA", name: "Dorival Júnior", country: "Brazil", code: "BRA", color: "#009B3A" },
];


export const FifaScene2Pick: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eyebrow = spring({ frame: frame - 5, fps, config: { damping: 18 } });
  const titleA = spring({ frame: frame - 15, fps, config: { damping: 16 } });
  const strike = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: "clamp" });
  const titleB = spring({ frame: frame - 70, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #07172E 0%, #0B2444 60%, #0E7A3F 140%)",
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
          opacity: eyebrow,
        }}
      >
        FIFA Coaches Special
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: "Anton, sans-serif",
          fontSize: 120,
          lineHeight: 0.9,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: -3,
          opacity: titleA,
          transform: `translateY(${interpolate(titleA, [0, 1], [40, 0])}px)`,
        }}
      >
        Don't pick<br />
        <span style={{ position: "relative", display: "inline-block" }}>
          a country.
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "52%",
              height: 12,
              background: "#E9C758",
              transform: `scaleX(${strike})`,
              transformOrigin: "left",
            }}
          />
        </span>
        <br />
        <span
          style={{
            color: "#E9C758",
            display: "inline-block",
            opacity: titleB,
            transform: `translateY(${interpolate(titleB, [0, 1], [30, 0])}px)`,
          }}
        >
          Draft the manager.
        </span>
      </div>

      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 14 }}>
        {managers.map((m, i) => {
          const s = spring({ frame: frame - (105 + i * 10), fps, config: { damping: 18, stiffness: 180 } });
          return (
            <div
              key={m.initials}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "18px 26px",
                background: "rgba(255,255,255,0.06)",
                borderLeft: "5px solid #E9C758",
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-50, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 56,
                  background: m.color,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Anton, sans-serif",
                  fontSize: 26,
                  letterSpacing: 1,
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              >
                {m.code}
              </div>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "#E9C758",
                  color: "#07172E",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Anton, sans-serif",
                  fontSize: 30,
                }}
              >
                {m.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 32, color: "#fff" }}>
                  {m.name}
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 22, color: "#9bb3d0", marginTop: 2 }}>
                  {m.country}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "Anton, sans-serif",
                  fontSize: 26,
                  color: "#E9C758",
                  border: "2px solid #E9C758",
                  padding: "6px 16px",
                }}
              >
                PICK
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
