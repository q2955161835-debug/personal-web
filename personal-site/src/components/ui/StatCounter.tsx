"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface StatCounterProps {
  value: number;
  label: string;
  suffix?: string;
}

export default function StatCounter({
  value,
  label,
  suffix = "",
}: StatCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = counterRef.current;
      if (!counter) return;

      const obj = { val: 0 };

      gsap.to(obj, {
        val: value,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        onUpdate: () => {
          counter.textContent = Math.round(obj.val).toString() + suffix;
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [value]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2">
      <span
        ref={counterRef}
        className="text-4xl font-bold"
        style={{
          background:
            "linear-gradient(90deg, #49c5b6, #ff9398, #8b5cf6, #49c5b6)",
          backgroundSize: "300% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "gradient-flow 4s ease-in-out infinite",
        }}
      >
        0{suffix}
      </span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
}
