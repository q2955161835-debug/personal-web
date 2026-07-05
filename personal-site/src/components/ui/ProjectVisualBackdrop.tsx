"use client";

import type { Project } from "@/types";

interface ProjectVisualBackdropProps {
  project: Project;
}

const SCENE_COLORS: Record<string, { primary: string; secondary: string; dim: string }> = {
  particles: { primary: "#49c5b6", secondary: "#ff9398", dim: "#49c5b633" },
  grid: { primary: "#ff9398", secondary: "#49c5b6", dim: "#ff939833" },
  flow: { primary: "#8b5cf6", secondary: "#00d4ff", dim: "#8b5cf633" },
  pulse: { primary: "#00d4ff", secondary: "#49c5b6", dim: "#00d4ff33" },
  wave: { primary: "#a78bfa", secondary: "#49c5b6", dim: "#a78bfa33" },
  chart: { primary: "#49c5b6", secondary: "#ff6b6b", dim: "#49c5b633" },
};

const constellationNodes = [
  [32, 44],
  [92, 28],
  [156, 62],
  [226, 36],
  [284, 84],
  [64, 124],
  [142, 150],
  [224, 136],
  [306, 170],
] as const;

const candles = [
  [18, 112, 82, 130, 72],
  [42, 84, 104, 116, 76],
  [66, 104, 76, 112, 68],
  [90, 78, 62, 92, 54],
  [114, 64, 88, 98, 58],
  [138, 88, 72, 100, 66],
  [162, 72, 48, 82, 40],
  [186, 50, 68, 76, 44],
  [210, 68, 42, 72, 34],
  [234, 44, 56, 66, 38],
  [258, 56, 34, 60, 28],
  [282, 36, 48, 58, 30],
] as const;

function LineChartVisual({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <>
      <path d="M24 154H318" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
      <path d="M24 38V154" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
      <path
        d="M28 132C54 116 72 138 96 105C124 67 148 94 174 74C208 49 226 72 252 50C276 30 294 44 318 24"
        fill="none"
        stroke={primary}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M28 146C88 134 132 108 178 88C228 66 270 52 318 42"
        fill="none"
        stroke={secondary}
        strokeDasharray="7 8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {[28, 96, 174, 252, 318].map((x, index) => (
        <circle
          key={x}
          cx={x}
          cy={[132, 105, 74, 50, 24][index]}
          r="4"
          fill={index % 2 === 0 ? primary : secondary}
        />
      ))}
    </>
  );
}

function CandlestickVisual({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <>
      <path d="M14 158H322" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <path
        d="M18 116C58 98 78 90 114 88C158 84 174 52 210 58C246 64 266 34 306 42"
        fill="none"
        stroke="rgba(167,139,250,0.42)"
        strokeWidth="2"
      />
      {candles.map(([x, open, close, high, low]) => {
        const rising = close < open;
        const color = rising ? primary : secondary;
        const y = Math.min(open, close);
        const height = Math.max(Math.abs(close - open), 8);

        return (
          <g key={x}>
            <line x1={x} x2={x} y1={high} y2={low} stroke={color} strokeWidth="2" />
            <rect x={x - 6} y={y} width="12" height={height} rx="2" fill={color} opacity="0.82" />
          </g>
        );
      })}
    </>
  );
}

function GridVisual({ primary, secondary }: { primary: string; secondary: string }) {
  const lines = Array.from({ length: 9 }, (_, index) => 28 + index * 32);
  const stones: Array<[number, number, string]> = [
    [92, 92, secondary],
    [124, 124, primary],
    [156, 156, secondary],
    [188, 124, primary],
    [188, 188, secondary],
  ];

  return (
    <>
      {lines.map((value) => (
        <g key={value}>
          <line x1="28" x2="284" y1={value} y2={value} stroke={primary} strokeOpacity="0.28" />
          <line y1="28" y2="284" x1={value} x2={value} stroke={primary} strokeOpacity="0.28" />
        </g>
      ))}
      {stones.map(([x, y, color]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="10" fill={color} opacity="0.82" />
      ))}
    </>
  );
}

function FlowVisual({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <>
      <path
        d="M30 142C78 78 120 176 166 108C218 32 252 122 314 60"
        fill="none"
        stroke={primary}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {[
        [48, 82, 70, 44],
        [144, 100, 78, 50],
        [240, 54, 64, 88],
      ].map(([x, y, w, h]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={h}
          rx="8"
          fill="none"
          stroke={secondary}
          strokeWidth="2"
          strokeDasharray="8 7"
        />
      ))}
      <circle cx="166" cy="108" r="7" fill={secondary} />
    </>
  );
}

function WaveVisual({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <>
      {Array.from({ length: 6 }, (_, index) => (
        <path
          key={index}
          d={`M16 ${82 + index * 18}C60 ${34 + index * 18} 96 ${130 + index * 9} 142 ${82 + index * 18}C188 ${34 + index * 18} 226 ${130 + index * 9} 318 ${78 + index * 18}`}
          fill="none"
          stroke={index % 2 === 0 ? primary : secondary}
          strokeWidth={index === 2 ? 3 : 1.5}
          strokeOpacity={index === 2 ? 0.88 : 0.3}
        />
      ))}
    </>
  );
}

function ConstellationVisual({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <>
      <path
        d="M32 44L92 28L156 62L226 36L284 84M64 124L142 150L224 136L306 170M92 28L142 150M156 62L224 136"
        fill="none"
        stroke={primary}
        strokeWidth="1.6"
        strokeOpacity="0.46"
      />
      {constellationNodes.map(([x, y], index) => (
        <circle
          key={`${x}-${y}`}
          className="project-visual-particle"
          cx={x}
          cy={y}
          r={index % 3 === 0 ? 5 : 3}
          fill={index % 2 === 0 ? primary : secondary}
        />
      ))}
    </>
  );
}

export default function ProjectVisualBackdrop({ project }: ProjectVisualBackdropProps) {
  const colors = SCENE_COLORS[project.scene] ?? SCENE_COLORS.particles;
  const gradientId = `project-visual-${project.id}`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(115deg, ${colors.dim}, transparent 28%, ${colors.secondary}18 72%, transparent), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06), transparent 56%)`,
        }}
      />
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:76px_76px]" />
      <svg
        className="absolute right-[4%] top-[8%] h-[48%] w-[50%] min-w-[440px] opacity-80"
        viewBox="0 0 340 190"
        fill="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="336" height="186" rx="20" fill="rgba(2,8,18,0.28)" />
        <rect x="2" y="2" width="336" height="186" rx="20" stroke={`url(#${gradientId})`} strokeOpacity="0.34" />
        {project.scene === "pulse" && (
          <LineChartVisual primary={colors.primary} secondary={colors.secondary} />
        )}
        {project.scene === "chart" && (
          <CandlestickVisual primary={colors.primary} secondary={colors.secondary} />
        )}
        {project.scene === "grid" && (
          <GridVisual primary={colors.primary} secondary={colors.secondary} />
        )}
        {project.scene === "flow" && (
          <FlowVisual primary={colors.primary} secondary={colors.secondary} />
        )}
        {project.scene === "wave" && (
          <WaveVisual primary={colors.primary} secondary={colors.secondary} />
        )}
        {project.scene === "particles" && (
          <ConstellationVisual primary={colors.primary} secondary={colors.secondary} />
        )}
      </svg>
      <style jsx>{`
        .project-visual-particle {
          filter: drop-shadow(0 0 10px currentColor);
          opacity: 0.86;
        }
      `}</style>
    </div>
  );
}
