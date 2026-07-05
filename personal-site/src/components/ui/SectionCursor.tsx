"use client";

import { useEffect, useRef } from "react";

export default function SectionCursor() {
  const lensRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const hasPointerRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: -240, y: -240 });
  const velocityRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    if (media.matches) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!hasPointerRef.current) {
        hasPointerRef.current = true;
        positionRef.current.x = event.clientX;
        positionRef.current.y = event.clientY;
        lensRef.current?.setAttribute("data-ready", "true");
      }
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    };

    const animate = () => {
      const previousX = positionRef.current.x;
      const previousY = positionRef.current.y;

      positionRef.current.x += (targetRef.current.x - positionRef.current.x) * 0.28;
      positionRef.current.y += (targetRef.current.y - positionRef.current.y) * 0.28;
      velocityRef.current.x = positionRef.current.x - previousX;
      velocityRef.current.y = positionRef.current.y - previousY;

      const lens = lensRef.current;
      if (lens) {
        const speed = Math.min(1, Math.hypot(velocityRef.current.x, velocityRef.current.y) / 28);
        const angle = Math.atan2(velocityRef.current.y, velocityRef.current.x || 0.001);
        lens.style.setProperty("--cursor-speed", speed.toFixed(3));
        lens.style.setProperty("--cursor-angle", `${angle}rad`);
        lens.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <div ref={lensRef} className="rainbow-cursor-lens" aria-hidden="true" />;
}
