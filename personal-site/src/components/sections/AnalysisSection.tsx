"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  analysisCategorySummary,
  analysisMethodNodes,
  analysisProjects,
} from "@/data/analysis-projects";
import type { DataAnalysisProject } from "@/types";
import { InteractiveGlassButton, InteractiveGlassPanel } from "@/components/ui/InteractiveGlassPanel";

gsap.registerPlugin(ScrollTrigger);

const xAxisParticles = Array.from({ length: 92 }, (_, index) => index);
const yAxisParticles = Array.from({ length: 34 }, (_, index) => index);
const fieldParticles = Array.from({ length: 130 }, (_, index) => index);

function pct(value: number) {
  return `${value.toFixed(4)}%`;
}

function categoryPosition(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    left: pct(50 + Math.cos(angle) * 38),
    top: pct(50 + Math.sin(angle) * 34),
  };
}

function MethodParticleCloud() {
  return (
    <div className="pointer-events-none absolute right-4 top-12 hidden h-72 w-80 lg:block">
      {analysisMethodNodes.map((node, index) => {
        const position = categoryPosition(index, analysisMethodNodes.length);
        const size = 9 + node.count * 0.75;
        return (
          <div
            key={node.name}
            className="analysis-method-node cursor-target pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              ...position,
              color: analysisCategorySummary.find((item) => item.category === node.category)?.color ?? "#49c5b6",
            }}
            title={`${node.name} / ${node.count} 次`}
          >
            <span
              className="block rounded-full"
              style={{
                width: size,
                height: size,
                background: "currentColor",
                boxShadow: "0 0 22px currentColor",
              }}
            />
            <span className="mt-2 block whitespace-nowrap text-[11px] font-semibold text-white/62">
              {node.name}
            </span>
          </div>
        );
      })}
      <div className="absolute left-1/2 top-1/2 h-px w-52 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-52 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/18 to-transparent" />
    </div>
  );
}

function CategoryParticleRing() {
  return (
    <div className="pointer-events-none absolute bottom-10 right-8 hidden h-64 w-64 lg:block">
      {analysisCategorySummary.map((item, index) => {
        const position = categoryPosition(index, analysisCategorySummary.length);
        return (
          <div
            key={item.category}
            className="cursor-target pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 text-center transition-transform duration-300 hover:scale-110"
            style={{ ...position, color: item.color }}
          >
            <span
              className="mx-auto block h-3 w-3 rounded-full"
              style={{ background: item.color, boxShadow: `0 0 20px ${item.color}` }}
            />
            <span className="mt-2 block whitespace-nowrap text-xs font-semibold text-white/65">
              {item.category}
            </span>
            <span className="block text-[11px] text-white/38">{item.count} 个</span>
          </div>
        );
      })}
      {Array.from({ length: 48 }, (_, index) => {
        const angle = (index / 48) * Math.PI * 2;
        return (
          <span
            key={index}
            className="twinkle-particle absolute h-1 w-1 rounded-full bg-white/45"
            style={{
              left: pct(50 + Math.cos(angle) * 36),
              top: pct(50 + Math.sin(angle) * 36),
              "--particle-duration": `${(2 + (index % 5) * 0.35).toFixed(2)}s`,
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
}

function ProjectDetailPanel({ project }: { project: DataAnalysisProject }) {
  return (
    <InteractiveGlassPanel
      glowColor={project.color}
      intensity={5}
      className="w-full rounded-lg p-5 md:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/38">
            Selected Case
          </p>
          <h3 className="mt-2 text-xl font-bold leading-snug text-white">{project.title}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
          {project.year}
        </span>
      </div>
      <p className="text-sm leading-6 text-white/58">{project.description}</p>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <p className="text-xl font-bold text-white">{project.impactScore}</p>
          <p className="mt-1 text-[11px] text-white/38">含金量</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <p className="text-xl font-bold text-white">{project.deliverables}</p>
          <p className="mt-1 text-[11px] text-white/38">交付件</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <p className="text-xl font-bold text-white">{project.valueLabel}</p>
          <p className="mt-1 text-[11px] text-white/38">价值点</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.method.map((method) => (
          <span key={method} className="cursor-target rounded-full bg-white/[0.055] px-3 py-1 text-xs text-white/62">
            {method}
          </span>
        ))}
      </div>
      <ul className="mt-5 space-y-2 text-sm leading-6 text-white/58">
        {project.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: project.color }} />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </InteractiveGlassPanel>
  );
}

export default function AnalysisSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<DataAnalysisProject>(analysisProjects[0]);

  const maxScore = useMemo(
    () => Math.max(...analysisProjects.map((project) => project.impactScore)),
    []
  );

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

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

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.14);
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.95}`,
            scrub: 0.9,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="data-analysis"
      ref={sectionRef}
      className="relative z-10 min-h-screen overflow-hidden bg-black px-5 py-24 md:px-10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,212,255,0.1),transparent_28%,rgba(255,147,152,0.08)_64%,transparent)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:68px_68px]" />
        {fieldParticles.map((index) => (
          <span
            key={index}
            className="twinkle-particle absolute h-1 w-1 rounded-full bg-white/45"
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 53) % 100}%`,
              "--particle-duration": `${(2.2 + (index % 6) * 0.28).toFixed(2)}s`,
              "--particle-delay": `${(index % 11) * 0.12}s`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="analysis-reveal relative z-10 mx-auto mb-10 max-w-7xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-white/35">
          93+ cases / ranked by practical value
        </p>
        <h2 className="iridescent-text text-4xl font-bold sm:text-5xl">Data Analysis</h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
          每根玻璃柱代表一个精选分析项目，按含金量从左到右排序。滚动到本区后页面固定，鼠标滚轮会推动图表横向移动，点击柱体查看方法、样本和关键结论。
        </p>
      </div>

      <div className="relative z-10 h-[calc(100vh-7rem)] min-h-[620px] overflow-hidden">
        <MethodParticleCloud />
        <CategoryParticleRing />

        <div className="absolute left-0 top-0 z-20 w-[min(420px,92vw)]">
          <ProjectDetailPanel project={selectedProject} />
        </div>

        <div
          ref={trackRef}
          className="analysis-chart-track absolute bottom-8 left-[min(460px,96vw)] flex h-[520px] min-w-max items-end gap-9 pr-[28vw]"
        >
          <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full">
            {xAxisParticles.map((index) => (
              <span
                key={index}
                className="analysis-axis-particle absolute top-0 h-1.5 w-1.5 rounded-full"
                style={{
                  left: `${(index / (xAxisParticles.length - 1)) * 100}%`,
                  background: index % 7 === 0 ? "#00d4ff" : "rgba(255,255,255,0.42)",
                  boxShadow: index % 7 === 0 ? "0 0 16px #00d4ff" : "0 0 9px rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 h-full w-px">
            {yAxisParticles.map((index) => (
              <span
                key={index}
                className="analysis-axis-particle absolute left-0 h-1.5 w-1.5 rounded-full"
                style={{
                  bottom: `${(index / (yAxisParticles.length - 1)) * 100}%`,
                  background: index % 5 === 0 ? "#ff9398" : "rgba(255,255,255,0.38)",
                  boxShadow: index % 5 === 0 ? "0 0 16px #ff9398" : "0 0 9px rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          {analysisProjects.map((project, index) => {
            const height = 150 + (project.impactScore / maxScore) * 310;
            const active = selectedProject.id === project.id;

            return (
              <div key={project.id} className="analysis-reveal relative flex w-[112px] flex-col items-center">
                <InteractiveGlassButton
                  aria-label={`查看 ${project.title}`}
                  glowColor={project.color}
                  intensity={9}
                  onClick={() => setSelectedProject(project)}
                  className="analysis-bar-glass flex w-[92px] flex-col justify-between rounded-lg px-3 py-4 text-left"
                  style={{
                    height,
                    color: project.color,
                    boxShadow: active
                      ? `0 28px 90px ${project.color}38, inset 0 0 32px rgba(255,255,255,0.08)`
                      : undefined,
                  }}
                >
                  <span className="text-xs font-semibold text-white/58">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-2xl font-bold text-white">{project.impactScore}</span>
                </InteractiveGlassButton>
                <div className="mt-4 min-h-24 w-[132px] text-center">
                  <p className="text-xs font-semibold leading-5 text-white/72">{project.title}</p>
                  <p className="mt-1 text-[11px] text-white/36">{project.category}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
