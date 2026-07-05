"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function AnimatedText({
  text,
  className = "",
  delay = 0,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Split text into spans for each character
    const chars = text.split("");
    container.innerHTML = chars
      .map((char) =>
        char === " "
          ? '<span class="inline-block">&nbsp;</span>'
          : `<span class="inline-block">${char}</span>`
      )
      .join("");

    const spans = container.querySelectorAll("span");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        spans,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.03,
          delay: delay,
          ease: "power2.out",
        }
      );
    }, container);

    return () => {
      ctx.revert();
    };
  }, [text, delay]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label={text}
      role="text"
    />
  );
}
