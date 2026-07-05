"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  analysisCategories,
  analysisCategorySummary,
  analysisMethodNodes,
  analysisProjects,
} from "@/data/analysis-projects";

gsap.registerPlugin(ScrollTrigger);

const ALL_CATEGORY = "全部";
const tabs = [ALL_CATEGORY, ...analysisCategories] as const;

function buildPieGradient() {
  const total = analysisCategorySummary.reduce((sum, item) => sum + item.count, 0);
  let cursor = 0;

  return analysisCategorySummary
    .map((item) => {
      const start = (cursor / total) * 360;
      cursor += item.count;
      const end = (cursor / total) * 360;
      return `${item.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
    })
    .join(", ");
}

export default function AnalysisSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<(typeof tabs)[number]>(ALL_CATEGORY);

  const filteredProjects = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return analysisProjects;
    return analysisProjects.filter((project) => project.category === activeCategory);
  }, [activeCategory]);

  const pieGradient = useMemo(() => buildPieGradient(), []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".analysis-reveal",
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "top 28%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="data-analysis"
      ref={sectionRef}
      className="relative z-10 min-h-screen overflow-hidden px-6 py-28 md:px-12"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/40 to-transparent" />
      <div className="mx-auto max-w-7xl">
        <div className="analysis-reveal mb-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-white/35">
              93+ cases / 619 deliverables
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
              Data Analysis
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
              精选跨问卷、金融、医学、化学与社会科学的代表性项目，把统计方法、复现实验和业务解释压缩成可交付的分析作品集。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["93+", "总项目数"],
              ["90%", "单项目交付成功率"],
              ["7", "覆盖领域"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/35">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="analysis-reveal mb-10 flex flex-wrap gap-3">
          {tabs.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className="rounded-full border px-4 py-2 text-sm transition-all duration-300"
                style={{
                  borderColor: active ? "rgba(73,197,182,0.65)" : "rgba(255,255,255,0.12)",
                  background: active ? "rgba(73,197,182,0.14)" : "rgba(255,255,255,0.035)",
                  color: active ? "rgba(180,255,246,0.95)" : "rgba(255,255,255,0.58)",
                  boxShadow: active ? "0 0 24px rgba(73,197,182,0.14)" : "none",
                }}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="analysis-reveal group rounded-lg border border-white/10 bg-black/35 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-teal-300/45 hover:bg-white/[0.055]"
                style={{ contentVisibility: "auto", containIntrinsicSize: "360px" }}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold leading-snug text-white">{project.title}</h3>
                  <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/45">
                    {project.year}
                  </span>
                </div>

                <p className="mb-4 text-sm leading-6 text-white/55">{project.description}</p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {project.method.map((method) => (
                    <span key={method} className="rounded-full bg-teal-300/10 px-3 py-1 text-xs text-teal-100/80">
                      {method}
                    </span>
                  ))}
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <span key={tool} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/45">
                      {tool}
                    </span>
                  ))}
                </div>

                <ul className="space-y-2 text-sm leading-6 text-white/58">
                  {project.highlights.slice(0, 3).map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#49c5b6]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <aside className="analysis-reveal space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-6 backdrop-blur-md">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
                方法论图谱
              </h3>
              <div className="relative mx-auto h-72 w-full max-w-[320px]">
                {analysisMethodNodes.map((node, index) => {
                  const angle = (index / analysisMethodNodes.length) * Math.PI * 2 - Math.PI / 2;
                  const radius = 104;
                  const size = 34 + node.count * 1.6;
                  const left = 50 + (Math.cos(angle) * radius) / 3.2;
                  const top = 50 + (Math.sin(angle) * radius) / 2.72;
                  return (
                    <div
                      key={node.name}
                      className="group absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/65 text-center text-[11px] leading-tight text-white/70 shadow-2xl transition-all duration-300 hover:z-10 hover:scale-110 hover:border-teal-300/60"
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: size,
                        height: size,
                        boxShadow: "0 0 26px rgba(73,197,182,0.11)",
                      }}
                      title={`${node.category} / ${node.count} 次`}
                    >
                      {node.name}
                    </div>
                  );
                })}
                <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-teal-300/35 bg-teal-300/10 text-center text-xs font-semibold leading-5 text-teal-100">
                  方法
                  <br />
                  复用频率
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-6 backdrop-blur-md">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
                领域分布
              </h3>
              <div className="grid items-center gap-6 sm:grid-cols-[130px_1fr] lg:grid-cols-1">
                <div
                  className="mx-auto h-32 w-32 rounded-full"
                  style={{
                    background: `conic-gradient(${pieGradient})`,
                    boxShadow: "0 0 38px rgba(73,197,182,0.12)",
                  }}
                  aria-hidden="true"
                />
                <div className="space-y-3">
                  {analysisCategorySummary.map((item) => (
                    <div key={item.category} className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2 text-white/58">
                        <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                        {item.category}
                      </span>
                      <span className="font-semibold text-white/75">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
