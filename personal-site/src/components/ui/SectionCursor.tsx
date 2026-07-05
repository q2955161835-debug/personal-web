"use client";

import { useEffect, useRef, useState } from "react";

type CursorMode = "hero" | "about" | "projects" | "analysis" | "timeline" | "contact";

const SECTION_BY_ID: Array<{ id: string; mode: CursorMode }> = [
  { id: "hero", mode: "hero" },
  { id: "about", mode: "about" },
  { id: "projects", mode: "projects" },
  { id: "data-analysis", mode: "analysis" },
  { id: "experience", mode: "timeline" },
  { id: "contact", mode: "contact" },
];

function getCurrentMode(): CursorMode {
  const viewportCenter = window.innerHeight / 2;
  let bestMode: CursorMode = "hero";
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const item of SECTION_BY_ID) {
    const element = document.getElementById(item.id);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

    const sectionCenter = rect.top + rect.height / 2;
    const distance = Math.abs(sectionCenter - viewportCenter);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMode = item.mode;
    }
  }

  return bestMode;
}

export default function SectionCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const trailRefPosition = useRef({ x: 0, y: 0 });
  const [mode, setMode] = useState<CursorMode>("hero");

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    if (media.matches) return;

    const updateMode = () => setMode(getCurrentMode());
    const handlePointerMove = (event: PointerEvent) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    };

    const animate = () => {
      const cursor = cursorRef.current;
      const trail = trailRef.current;
      const target = targetRef.current;
      const trailPosition = trailRefPosition.current;

      if (cursor) {
        cursor.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }

      if (trail) {
        trailPosition.x += (target.x - trailPosition.x) * 0.16;
        trailPosition.y += (target.y - trailPosition.y) * 0.16;
        trail.style.transform = `translate3d(${trailPosition.x}px, ${trailPosition.y}px, 0) translate(-50%, -50%)`;
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    updateMode();
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", updateMode, { passive: true });
    window.addEventListener("resize", updateMode);
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", updateMode);
      window.removeEventListener("resize", updateMode);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={trailRef} className={`section-cursor-trail section-cursor-${mode}`} aria-hidden="true" />
      <div ref={cursorRef} className={`section-cursor section-cursor-${mode}`} aria-hidden="true">
        <span />
      </div>
    </>
  );
}
