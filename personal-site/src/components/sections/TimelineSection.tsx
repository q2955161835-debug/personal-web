"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { timelineEntries } from "@/data/timeline";

gsap.registerPlugin(ScrollTrigger);

const typeLabel = {
  education: "教育",
  work: "工作",
  project: "项目",
} as const;

export default function TimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".timeline-card",
        { opacity: 0, x: 42, clipPath: "inset(0 100% 0 0)" },
        {
          opacity: 1,
          x: 0,
          clipPath: "inset(0 0% 0 0)",
          duration: 0.78,
          stagger: 0.13,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 35%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={sectionRef} className="relative z-10 px-6 py-28 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-white/35">
            Experience Timeline
          </p>
          <h2
            className="text-4xl font-bold sm:text-5xl"
            style={{
              background: "linear-gradient(90deg, #49c5b6, #ff9398, #8b5cf6, #49c5b6)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-flow 4s ease-in-out infinite",
            }}
          >
            Timeline
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-[#49c5b6] via-[#ff9398] to-[#8b5cf6] md:left-[176px]" />
          <div className="space-y-8">
            {timelineEntries.map((entry) => (
              <article key={entry.id} className="timeline-card grid gap-4 md:grid-cols-[150px_1fr] md:gap-12">
                <div className="sticky top-28 ml-10 self-start md:ml-0 md:text-right">
                  <p className="text-3xl font-bold text-white/75">{entry.year}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/35">{entry.period}</p>
                </div>

                <div className="relative rounded-lg border border-white/10 bg-white/[0.035] p-6 backdrop-blur-md transition-all duration-300 hover:scale-[1.01] hover:border-teal-300/45">
                  <span className="absolute -left-[42px] top-8 h-3 w-3 rounded-full border border-teal-200 bg-black shadow-[0_0_18px_rgba(73,197,182,0.55)] md:-left-[55px]" />
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/45">
                      {typeLabel[entry.type]}
                    </span>
                    <span className="text-sm text-teal-100/70">{entry.organization}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{entry.title}</h3>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">{entry.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
