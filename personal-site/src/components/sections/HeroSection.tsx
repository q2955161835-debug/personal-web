"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";

// Dynamic import for R3F Scene to avoid SSR issues
const Scene = dynamic(() => import("../three/Scene"), { ssr: false });

export default function HeroSection() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const newOpacity = Math.max(0, 1 - scrollY / (vh * 0.6));
      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Entrance animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2, delay: 0.3, ease: "power2.out" }
      );
    }, overlayRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* R3F Canvas - full background */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* DOM Overlay */}
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center"
        style={{ opacity }}
      >
        {/* Animated gradient text with glow */}
        <h1
          className="iridescent-text text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl"
          style={{
            filter: "drop-shadow(0 0 20px rgba(73, 197, 182, 0.4)) drop-shadow(0 0 40px rgba(255, 147, 152, 0.2))",
          }}
        >
          FAN JUN JIE
        </h1>
        <p
          className="iridescent-text mt-4 text-lg"
          style={{
            filter: "drop-shadow(0 0 8px rgba(73, 197, 182, 0.3))",
          }}
        >
          AI Product &amp; Data Analysis
        </p>
        <p
          className="iridescent-text mt-2 text-sm"
          style={{
            filter: "drop-shadow(0 0 6px rgba(255, 147, 152, 0.25))",
          }}
        >
          统计学 × AI × 数据分析
        </p>
      </div>

      {/* Scroll down indicator */}
      <div
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2"
        style={{ opacity }}
      >
        <div className="animate-bounce">
          <svg
            className="h-6 w-6 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
