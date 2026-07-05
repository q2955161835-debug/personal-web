"use client";

import type { CSSProperties } from "react";

function normalizedPseudo(index: number, salt: number) {
  return Math.abs(Math.sin(index * 91.73 + salt * 271.19) * 43758.5453) % 1;
}

const stars = Array.from({ length: 210 }, (_, index) => ({
  id: index,
  left: `${(normalizedPseudo(index, 1.2) * 100).toFixed(3)}%`,
  top: `${(normalizedPseudo(index, 2.4) * 100).toFixed(3)}%`,
  size: `${(1 + normalizedPseudo(index, 3.6) * 2.5).toFixed(2)}px`,
  opacity: `${(0.2 + normalizedPseudo(index, 4.8) * 0.5).toFixed(4)}`,
  driftX: `${((normalizedPseudo(index, 6.2) - 0.5) * 34).toFixed(2)}px`,
  driftY: `${(-22 - normalizedPseudo(index, 7.8) * 56).toFixed(2)}px`,
  duration: `${(14 + normalizedPseudo(index, 8.6) * 10).toFixed(2)}s`,
  delay: `${(-normalizedPseudo(index, 9.4) * 12).toFixed(2)}s`,
  color: index % 11 === 0 ? "#ff9398" : index % 7 === 0 ? "#49c5b6" : "#ffffff",
}));

const constellations = [
  "8,20 17,15 25,27 36,22 44,34",
  "58,14 67,19 74,12 84,24 90,18",
  "12,64 23,58 35,66 46,56",
  "61,72 69,63 79,69 88,59",
  "28,42 38,38 49,45 57,36",
];

export default function CosmicBackdrop() {
  return (
    <div className="cosmic-backdrop pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(73,197,182,0.12),transparent_28%),radial-gradient(circle_at_82%_42%,rgba(255,147,152,0.1),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.2))]" />
      <svg className="cosmic-constellation-field absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {constellations.map((points, index) => (
          <polyline
            key={points}
            points={points}
            fill="none"
            stroke={index % 2 === 0 ? "rgba(73,197,182,0.24)" : "rgba(255,147,152,0.2)"}
            strokeWidth="0.08"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cosmic-constellation"
            style={{
              "--particle-duration": `${18 + index * 3}s`,
              "--particle-delay": `${index * -2.3}s`,
            } as CSSProperties}
          />
        ))}
      </svg>
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
