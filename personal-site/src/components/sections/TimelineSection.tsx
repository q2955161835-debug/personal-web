"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { timelineEntries } from "@/data/timeline";
import SolarTimelineScene from "@/components/three/timeline/SolarTimelineScene";
import AnimatedText from "@/components/ui/AnimatedText";

gsap.registerPlugin(ScrollTrigger);

const typeLabel = {
  education: "教育",
  work: "工作",
  project: "项目",
} as const;

export default function TimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const activeEntry = timelineEntries[activeIndex] ?? timelineEntries[0];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const syncProgress = (progress: number) => {
      const nextIndex = Math.min(timelineEntries.length - 1, Math.floor(progress * timelineEntries.length));

      setScrollProgress(progress);
      setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
    };

    let rafId: number | null = null;
    const update = () => {
      rafId = null;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      syncProgress(progress);
    };
    const schedule = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".section-transition-reveal",
        { opacity: 0, y: 34, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.86,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 96%",
            end: "top 54%",
            scrub: 0.45,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative z-10 bg-transparent"
      style={{ height: `${Math.max(360, timelineEntries.length * 115)}vh` }}
    >
      <div className="timeline-pin sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,202,122,0.045),transparent_34%,rgba(73,197,182,0.035)_68%,transparent)]" />
        <SolarTimelineScene
          entries={timelineEntries}
          activeIndex={activeIndex}
          scrollProgress={scrollProgress}
          onSelect={setActiveIndex}
        />

        <div className="section-transition-reveal pointer-events-none absolute left-6 top-24 z-10 max-w-[min(520px,84vw)] md:left-12">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/35">
            Experience Solar System
          </p>
          <h2 className="iridescent-text mt-3 text-4xl font-bold sm:text-5xl">Timeline</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
            一个阶段对应一颗星球，轨道深度表示经历递进。
          </p>
        </div>

        <div className="section-transition-reveal pointer-events-none absolute right-6 top-[24vh] z-10 max-w-[min(460px,82vw)] text-right md:right-12">
          <div key={activeEntry.id} className="timeline-detail-swap">
            <div className="mb-5 flex flex-wrap justify-end gap-3 text-xs text-white/48">
              <span>{activeEntry.period}</span>
              <span>{typeLabel[activeEntry.type]}</span>
              <span>{activeEntry.organization}</span>
            </div>
            <h3 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              <AnimatedText text={activeEntry.title} />
            </h3>
            <p className="mt-5 text-sm leading-7 text-white/62">{activeEntry.description}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {activeEntry.tags.map((tag) => (
                <span key={tag} className="cursor-target text-xs font-semibold text-white/46 transition-colors hover:text-teal-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="section-transition-reveal absolute bottom-10 left-6 right-6 z-20 flex flex-wrap items-end gap-5 md:left-12 md:right-12">
          {timelineEntries.map((entry, index) => {
            const active = activeIndex === index;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="cursor-target group relative grid gap-1 pb-3 text-left text-xs text-white/48 transition-colors hover:text-white"
                style={{ color: active ? "rgba(180,255,246,0.96)" : undefined }}
              >
                <span className="font-mono text-[11px]">{entry.year}</span>
                <span className="font-semibold">{entry.title}</span>
                <span
                  className="absolute bottom-0 left-0 h-px w-full origin-left transition-transform duration-300 group-hover:scale-x-100"
                  style={{
                    transform: active ? "scaleX(1)" : "scaleX(0)",
                    background: active
                      ? "linear-gradient(90deg, #49c5b6, #ffca7a)"
                      : "rgba(255,255,255,0.45)",
                    boxShadow: active ? "0 0 14px rgba(255,202,122,0.45)" : "none",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
