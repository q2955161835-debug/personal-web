"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  staggerMs?: number;
}

const SCRAMBLE_CHARS = "FANJUNJIE0123456789#$%*+-?/";

function scrambleText(source: string, revealCount: number, frame: number) {
  return Array.from(source, (char, index) => {
    if (char === " " || index < revealCount) return char;
    return SCRAMBLE_CHARS[(index * 7 + frame) % SCRAMBLE_CHARS.length];
  }).join("");
}

export default function AnimatedText({
  text,
  className = "",
  delay = 0,
  duration = 680,
  staggerMs = 18,
}: AnimatedTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [displayText, setDisplayText] = useState(() => scrambleText(text, 0, 0));
  const frameRef = useRef<number | null>(null);
  const glyphs = useMemo(() => Array.from(displayText), [displayText]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || isInView) return;
    if (typeof IntersectionObserver === "undefined") {
      const fallbackId = window.requestAnimationFrame(() => setIsInView(true));
      return () => window.cancelAnimationFrame(fallbackId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsInView(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedMotionId = window.requestAnimationFrame(() => setDisplayText(text));
      return () => window.cancelAnimationFrame(reducedMotionId);
    }

    const glyphCount = Array.from(text).length;
    const delayMs = Math.max(0, delay * 1000);
    const durationMs = Math.max(180, duration);
    const startAt = performance.now() + delayMs;

    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - startAt) / durationMs));
      const eased = 1 - Math.pow(1 - progress, 3);
      const revealCount = Math.floor(eased * glyphCount);
      const frame = Math.floor(now / 36);

      setDisplayText(progress >= 1 ? text : scrambleText(text, revealCount, frame));

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [delay, duration, isInView, text]);

  return (
    <span ref={rootRef} className={`animated-text ${className}`} data-ready={isInView} aria-label={text} role="text">
      {glyphs.map((char, index) => (
        <span
          key={`${text}-${index}`}
          aria-hidden="true"
          className="animated-text-glyph"
          style={
            {
              animationDelay: `${Math.max(0, delay * 1000 + Math.min(index * staggerMs, 560)).toFixed(0)}ms`,
            } as CSSProperties
          }
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
