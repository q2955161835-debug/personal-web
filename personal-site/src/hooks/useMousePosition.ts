"use client";

import { useState, useEffect } from "react";

interface MousePosition {
  /** Normalized X position from -1 (left) to 1 (right) */
  x: number;
  /** Normalized Y position from -1 (top) to 1 (bottom) */
  y: number;
}

/**
 * Track the mouse position normalized to a -1..1 range.
 * Useful for parallax effects, cursor-following elements, etc.
 */
export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
}
