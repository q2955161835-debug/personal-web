"use client";

import type { CSSProperties } from "react";

function normalizedPseudo(index: number, salt: number) {
  return Math.abs(Math.sin(index * 91.73 + salt * 271.19) * 43758.5453) % 1;
}

const stars = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(normalizedPseudo(index, 1.2) * 100).toFixed(3)}%`,
  top: `${(normalizedPseudo(index, 2.4) * 100).toFixed(3)}%`,
  size: `${(0.7 + normalizedPseudo(index, 3.6) * 1.55).toFixed(2)}px`,
  opacity: `${(0.12 + normalizedPseudo(index, 4.8) * 0.28).toFixed(4)}`,
  driftX: `${((normalizedPseudo(index, 6.2) - 0.5) * 28).toFixed(2)}px`,
  driftY: `${(-14 - normalizedPseudo(index, 7.8) * 34).toFixed(2)}px`,
  duration: `${(18 + normalizedPseudo(index, 8.6) * 12).toFixed(2)}s`,
  delay: `${(-normalizedPseudo(index, 9.4) * 12).toFixed(2)}s`,
  color: index % 11 === 0 ? "#ff9398" : index % 7 === 0 ? "#49c5b6" : "rgba(255,255,255,0.88)",
}));

const glowSpots = [
  { id: "teal", left: "12%", top: "20%", width: "40vw", height: "34vh", color: "rgba(73,197,182,0.26)" },
  { id: "rose", left: "66%", top: "30%", width: "42vw", height: "36vh", color: "rgba(255,147,152,0.22)" },
  { id: "violet", left: "38%", top: "76%", width: "38vw", height: "30vh", color: "rgba(139,92,246,0.2)" },
];

export default function CosmicBackdrop() {
  return (
    <div className="cosmic-backdrop pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {glowSpots.map((spot, index) => (
        <span
          key={spot.id}
          className="cosmic-ambient-glow absolute"
          style={{
            left: spot.left,
            top: spot.top,
            width: spot.width,
            height: spot.height,
            background: `radial-gradient(ellipse at center, ${spot.color}, color-mix(in srgb, ${spot.color} 38%, transparent) 38%, transparent 72%)`,
            "--glow-x": `${((normalizedPseudo(index, 10.2) - 0.5) * 9).toFixed(2)}vw`,
            "--glow-y": `${((normalizedPseudo(index, 11.4) - 0.5) * 8).toFixed(2)}vh`,
            "--glow-duration": `${(18 + index * 4).toFixed(2)}s`,
            "--glow-delay": `${(-index * 3.5).toFixed(2)}s`,
          } as CSSProperties}
        />
      ))}
      {stars.map((star) => (
        <span
          key={star.id}
          className="cosmic-star absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            background: star.color,
            boxShadow: `0 0 ${Number.parseFloat(star.size) * 5}px ${star.color}`,
            "--drift-x": star.driftX,
            "--drift-y": star.driftY,
            "--particle-duration": star.duration,
            "--particle-delay": star.delay,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
