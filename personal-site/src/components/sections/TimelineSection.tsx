"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { timelineEntries } from "@/data/timeline";
import { InteractiveGlassPanel } from "@/components/ui/InteractiveGlassPanel";

gsap.registerPlugin(ScrollTrigger);

const typeLabel = {
  education: "教育",
  work: "工作",
  project: "项目",
} as const;

const planetPalette = [
  ["#49c5b6", "#e6fffb"],
  ["#ff9398", "#ffe0e2"],
  ["#8b5cf6", "#d8c8ff"],
  ["#ffca7a", "#fff0c2"],
] as const;

const starField = Array.from({ length: 118 }, (_, index) => index);

export default function TimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const systemRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeEntry = timelineEntries[activeIndex] ?? timelineEntries[0];

  const planetPositions = useMemo(
    () =>
      timelineEntries.map((_, index) => {
        const angle = (-72 + index * 54) * (Math.PI / 180);
        const radius = 104 + index * 64;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius * 0.72,
          radius,
          size: 42 + (index % 3) * 10,
          angle,
        };
      }),
    []
  );

  useEffect(() => {
    const section = sectionRef.current;
    const system = systemRef.current;
    if (!section || !system) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".solar-reveal",
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.to(system, {
        rotateZ: 10,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative z-10 min-h-screen overflow-hidden bg-black px-5 py-24 md:px-10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,202,122,0.1),transparent_30%,rgba(139,92,246,0.08)_72%,transparent)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:90px_90px]" />
        {starField.map((index) => (
          <span
            key={index}
            className="twinkle-particle absolute h-1 w-1 rounded-full bg-white/55"
            style={{
              left: `${(index * 41) % 100}%`,
              top: `${(index * 67) % 100}%`,
              "--particle-duration": `${(2.4 + (index % 7) * 0.22).toFixed(2)}s`,
              "--particle-delay": `${(index % 13) * 0.09}s`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="solar-reveal mb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-white/35">
            Experience Solar System
          </p>
          <h2 className="iridescent-text text-4xl font-bold sm:text-5xl">Timeline</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
            每个时间段是一颗行星，轨道半径表示阶段递进。悬浮会点亮星球，点击后查看对应阶段、组织和标签。
          </p>
        </div>

        <div className="grid min-h-[680px] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="solar-reveal relative h-[640px] min-h-[560px] overflow-visible">
            <div ref={systemRef} className="absolute left-1/2 top-1/2 h-[1px] w-[1px] -translate-x-1/2 -translate-y-1/2">
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_32%,#fff8d7,#ffca7a_34%,#ff6b6b_68%,rgba(255,107,107,0.15)_72%)] shadow-[0_0_70px_rgba(255,202,122,0.42)]" />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/8" />

              {planetPositions.map((position, index) => {
                const active = activeIndex === index;
                const [primary, secondary] = planetPalette[index % planetPalette.length];
                const entry = timelineEntries[index];

                return (
                  <div key={entry.id}>
                    <div
                      className="absolute left-1/2 top-1/2 rounded-full border border-white/10"
                      style={{
                        width: position.radius * 2,
                        height: position.radius * 1.44,
                        transform: "translate(-50%, -50%)",
                        boxShadow: active ? `0 0 26px ${primary}22` : "none",
                      }}
                    />
                    <button
                      type="button"
                      aria-label={`查看 ${entry.title}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => setActiveIndex(index)}
                      className="solar-planet cursor-target absolute rounded-full text-center transition-transform duration-300 hover:scale-110"
                      style={{
                        left: `calc(50% + ${position.x}px)`,
                        top: `calc(50% + ${position.y}px)`,
                        width: position.size,
                        height: position.size,
                        transform: "translate(-50%, -50%)",
                        background: `radial-gradient(circle at 34% 28%, ${secondary}, ${primary} 38%, rgba(2,6,18,0.9) 78%)`,
                        boxShadow: active
                          ? `0 0 44px ${primary}88, inset -10px -14px 22px rgba(0,0,0,0.42)`
                          : `0 0 22px ${primary}44, inset -10px -14px 22px rgba(0,0,0,0.45)`,
                        border: `1px solid ${primary}99`,
                      }}
                    >
                      <span className="sr-only">{entry.year}</span>
                    </button>
                    <span
                      className="pointer-events-none absolute whitespace-nowrap text-xs font-semibold text-white/58"
                      style={{
                        left: `calc(50% + ${position.x + 24}px)`,
                        top: `calc(50% + ${position.y - 34}px)`,
                      }}
                    >
                      {entry.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="solar-reveal">
            <InteractiveGlassPanel
              glowColor={planetPalette[activeIndex % planetPalette.length][0]}
              intensity={6}
              className="rounded-lg p-6 md:p-8"
            >
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/45">
                  {activeEntry.period}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
                  {typeLabel[activeEntry.type]}
                </span>
                <span className="text-sm text-teal-100/70">{activeEntry.organization}</span>
              </div>
              <h3 className="text-3xl font-bold text-white">{activeEntry.title}</h3>
              <p className="mt-5 text-sm leading-7 text-white/60">{activeEntry.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {activeEntry.tags.map((tag) => (
                  <span key={tag} className="cursor-target rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                    {tag}
                  </span>
                ))}
              </div>
            </InteractiveGlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
}
