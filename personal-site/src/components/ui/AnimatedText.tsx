"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
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
}: AnimatedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
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
  }, [delay, duration, text]);

  return (
    <span className={className} aria-label={text} role="text">
      {displayText}
    </span>
  );
}
