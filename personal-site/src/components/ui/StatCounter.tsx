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
        duration: 1,
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
  }, [suffix, value]);

  return (
    <div
      ref={containerRef}
      className="cursor-target flex flex-col items-center gap-2 rounded-lg px-2 py-3 transition-transform duration-300 hover:-translate-y-1"
    >
      <span
        ref={counterRef}
        className="iridescent-text text-4xl font-bold"
      >
        0{suffix}
      </span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
}
