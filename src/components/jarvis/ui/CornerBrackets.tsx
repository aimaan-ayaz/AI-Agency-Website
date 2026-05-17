"use client";

// Faint corner ticks — a quiet HUD cue, not a decoration. 1px,
// low-opacity, no glow.
export default function CornerBrackets({
  size = 12,
  color = "rgba(255,255,255,0.18)",
  inset = 10,
}: {
  size?: number;
  color?: string;
  inset?: number;
}) {
  const base = { position: "absolute" as const, width: size, height: size };
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <span
        style={{
          ...base,
          top: inset,
          left: inset,
          borderTop: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
      />
      <span
        style={{
          ...base,
          top: inset,
          right: inset,
          borderTop: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
        }}
      />
      <span
        style={{
          ...base,
          bottom: inset,
          left: inset,
          borderBottom: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
      />
      <span
        style={{
          ...base,
          bottom: inset,
          right: inset,
          borderBottom: `1px solid ${color}`,
          borderRight: `1px solid ${color}`,
        }}
      />
    </div>
  );
}
