"use client";

import type { CSSProperties, MouseEventHandler, PointerEvent, ReactNode, RefObject } from "react";
import { useCallback, useRef } from "react";

interface TiltOptions {
  intensity?: number;
  glowColor?: string;
}

interface InteractiveGlassPanelProps extends TiltOptions {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface InteractiveGlassButtonProps extends InteractiveGlassPanelProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
  disabled?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function useGlassTilt({ intensity = 10, glowColor = "#49c5b6" }: TiltOptions) {
  const ref = useRef<HTMLElement>(null);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const nx = px * 2 - 1;
      const ny = py * 2 - 1;
      const edgeDistance = Math.min(px, py, 1 - px, 1 - py);
      const falloff = clamp(edgeDistance * 3.2, 0.18, 1);
      const rotateX = clamp(-ny * intensity * falloff, -intensity, intensity);
      const rotateY = clamp(nx * intensity * falloff, -intensity, intensity);

      element.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      element.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      element.style.setProperty("--glare-x", `${(px * 100).toFixed(2)}%`);
      element.style.setProperty("--glare-y", `${(py * 100).toFixed(2)}%`);
      element.style.setProperty("--glass-falloff", falloff.toFixed(2));
    },
    [intensity]
  );

  const handlePointerLeave = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    element.style.setProperty("--tilt-x", "0deg");
    element.style.setProperty("--tilt-y", "0deg");
    element.style.setProperty("--glare-x", "50%");
    element.style.setProperty("--glare-y", "50%");
    element.style.setProperty("--glass-falloff", "0");
  }, []);

  const tiltStyle = {
    "--glass-color": glowColor,
  } as CSSProperties;

  return {
    ref,
    tiltStyle,
    handlePointerMove,
    handlePointerLeave,
  };
}

export function InteractiveGlassPanel({
  children,
  className = "",
  style,
  intensity,
  glowColor,
}: InteractiveGlassPanelProps) {
  const { ref, tiltStyle, handlePointerMove, handlePointerLeave } = useGlassTilt({
    intensity,
    glowColor,
  });

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className={`interactive-glass cursor-target ${className}`}
      style={{ ...tiltStyle, ...style }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="interactive-glass__shine" aria-hidden="true" />
      <span className="interactive-glass__edge" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function InteractiveGlassButton({
  children,
  className = "",
  style,
  intensity,
  glowColor,
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
}: InteractiveGlassButtonProps) {
  const { ref, tiltStyle, handlePointerMove, handlePointerLeave } = useGlassTilt({
    intensity,
    glowColor,
  });

  return (
    <button
      ref={ref as RefObject<HTMLButtonElement>}
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={`interactive-glass cursor-target disabled:pointer-events-none disabled:opacity-40 ${className}`}
      style={{ ...tiltStyle, ...style }}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="interactive-glass__shine" aria-hidden="true" />
      <span className="interactive-glass__edge" aria-hidden="true" />
      <span className="relative z-10 block">{children}</span>
    </button>
  );
}
