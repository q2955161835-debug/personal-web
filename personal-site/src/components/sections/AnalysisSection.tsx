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
import { FluidGlassButton } from "@/components/ui/FluidGlassPanel";

gsap.registerPlugin(ScrollTrigger);

const xAxisParticles = Array.from({ length: 260 }, (_, index) => ({
  id: index,
  left: `${(((index / 259) * 100)).toFixed(4)}%`,
  offset: `${(Math.sin(index * 1.83) * 5 + Math.cos(index * 0.47) * 2.2).toFixed(3)}px`,
  size: `${(2 + ((index * 17) % 9) * 0.32).toFixed(2)}px`,
  glow: `${((2 + ((index * 17) % 9) * 0.32) * 5).toFixed(2)}px`,
  hue: index % 11 === 0 ? "#00d4ff" : index % 7 === 0 ? "#ff9398" : "rgba(255,255,255,0.46)",
}));

const yAxisParticles = Array.from({ length: 96 }, (_, index) => ({
  id: index,
  bottom: `${(((index / 95) * 100)).toFixed(4)}%`,
  offset: `${(Math.sin(index * 1.27) * 6 + Math.cos(index * 0.71) * 2.6).toFixed(3)}px`,
  size: `${(2 + ((index * 13) % 7) * 0.34).toFixed(2)}px`,
  glow: `${((2 + ((index * 13) % 7) * 0.34) * 5).toFixed(2)}px`,
  hue: index % 8 === 0 ? "#ff9398" : index % 5 === 0 ? "#49c5b6" : "rgba(255,255,255,0.4)",
}));

const fieldParticles = Array.from({ length: 190 }, (_, index) => ({
  id: index,
  left: `${(((index * 37 + Math.sin(index) * 11) % 100 + 100) % 100).toFixed(3)}%`,
  top: `${(((index * 53 + Math.cos(index * 0.7) * 13) % 100 + 100) % 100).toFixed(3)}%`,
  size: `${(1 + (index % 5) * 0.45).toFixed(2)}px`,
  delay: `${((index % 17) * 0.08).toFixed(2)}s`,
  duration: `${(2.3 + (index % 9) * 0.24).toFixed(2)}s`,
}));

const methodPosition = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 35 + (index % 3) * 8;
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * (radius * 0.78)}%`,
  };
};

const METHOD_ALIASES: Record<string, string[]> = {
  "Logistic 回归": ["多因素 Logistic 回归", "有序 Logit"],
  面板固定效应: ["面板双向固定效应"],
  "K-means 聚类": ["K-means 聚类"],
  "GARCH-MIDAS": ["GARCH-MIDAS"],
  因子分析: ["因子分析", "探索性因子分析", "验证性因子分析"],
  "Cox 回归": ["Cox 回归"],
  PCA: ["PCA 降维"],
  TOPSIS: ["TOPSIS"],
  事件研究法: ["事件研究法"],
  "Meta 分析": ["医学文献 Meta 分析", "随机效应模型"],
};

function methodIsActive(project: DataAnalysisProject, methodName: string) {
  const aliases = METHOD_ALIASES[methodName] ?? [methodName];
  return project.method.some((method) =>
    aliases.some((alias) => method.includes(alias) || alias.includes(method) || methodName.includes(method))
  );
}

function MethodNebula({ project }: { project: DataAnalysisProject }) {
  return (
    <div className="pointer-events-none absolute right-[6vw] top-[18vh] hidden h-[34vh] min-h-72 w-[32vw] max-w-[420px] lg:block">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(73,197,182,0.1),transparent_64%)] blur-sm" />
      {analysisMethodNodes.map((node, index) => {
        const active = methodIsActive(project, node.name);
        const color = analysisCategorySummary.find((item) => item.category === node.category)?.color ?? "#49c5b6";
        const size = active ? 18 + node.count * 0.8 : 5 + node.count * 0.24;
        const position = methodPosition(index, analysisMethodNodes.length);

        return (
          <div
            key={node.name}
            className="analysis-method-orbit cursor-target pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              ...position,
              color,
              "--drift-duration": `${5.4 + (index % 4) * 0.6}s`,
              "--drift-delay": `${index * -0.23}s`,
            } as CSSProperties}
            title={node.name}
          >
            <span
              className="block rounded-full transition-all duration-500"
              style={{
                width: size,
                height: size,
                background: "currentColor",
                boxShadow: active ? "0 0 30px currentColor" : "0 0 14px currentColor",
                opacity: active ? 0.95 : 0.42,
              }}
            />
            <span
              className="mt-2 block whitespace-nowrap text-xs font-semibold text-white transition-all duration-500"
              style={{
                opacity: active ? 0.88 : 0,
                transform: active ? "translateY(0)" : "translateY(6px)",
              }}
            >
              {node.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CategoryParticles() {
  return (
    <div className="pointer-events-none absolute bottom-[12vh] right-[5vw] hidden h-40 w-64 lg:block">
      {analysisCategorySummary.map((item, index) => (
        <div
          key={item.category}
          className="analysis-category-float absolute text-xs font-semibold text-white/55"
          style={{
            left: `${8 + index * 20}%`,
            top: `${36 + Math.sin(index * 1.4) * 28}%`,
            color: item.color,
            "--drift-duration": `${6 + index * 0.35}s`,
            "--drift-delay": `${index * -0.31}s`,
          } as CSSProperties}
        >
          <span className="mr-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: item.color }} />
          {item.category}
        </div>
      ))}
    </div>
  );
}

function FloatingProjectDetail({ project }: { project: DataAnalysisProject }) {
  return (
    <div className="analysis-reveal pointer-events-none absolute left-6 top-20 z-20 max-w-[min(690px,82vw)] md:left-10 lg:left-14 lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/35">
        93 cases / ranked by practical value
      </p>
      <h2 className="iridescent-text mt-3 text-4xl font-bold sm:text-5xl">Data Analysis</h2>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
        每根玻璃柱代表一个精选分析项目，按含金量从左到右排序。进入本区后页面固定，当前项目详情与方法星云随滚动同步切换。
      </p>
      <div className="mt-9 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/34">
            Selected Case
          </p>
          <h3 className="mt-2 max-w-xl text-2xl font-bold leading-tight text-white md:text-3xl">
            {project.title}
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/58">{project.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-5 text-left lg:text-right">
          <div>
            <p className="text-2xl font-bold text-white">{project.deliverables}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">交付件</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{project.year}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">年份</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{project.valueLabel}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">价值点</p>
          </div>
        </div>
      </div>
      <ul className="mt-5 grid max-w-3xl gap-2 text-sm leading-6 text-white/58 md:grid-cols-3">
        {project.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: project.color }} />
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalysisSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [selectedProject, setSelectedProject] = useState<DataAnalysisProject>(analysisProjects[0]);

  const maxScore = useMemo(
    () => Math.max(...analysisProjects.map((project) => project.impactScore)),
    []
  );

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const setProjectByProgress = (progress: number) => {
      const nextIndex = Math.min(analysisProjects.length - 1, Math.max(0, Math.floor(progress * analysisProjects.length)));
      if (nextIndex === activeIndexRef.current) return;
      activeIndexRef.current = nextIndex;
      setSelectedProject(analysisProjects[nextIndex]);
    };

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
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + window.innerWidth * 0.22);
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 1.15}`,
            scrub: 0.92,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProjectByProgress(self.progress),
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
        <div className="absolute inset-0 opacity-28 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:68px_68px]" />
        {fieldParticles.map((particle) => (
          <span
            key={particle.id}
            className="twinkle-particle absolute rounded-full bg-white/45"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              "--particle-duration": particle.duration,
              "--particle-delay": particle.delay,
            } as CSSProperties}
          />
        ))}
      </div>

      <FloatingProjectDetail project={selectedProject} />
      <MethodNebula project={selectedProject} />
      <CategoryParticles />

      <div className="relative z-10 h-[calc(100vh-7rem)] min-h-[700px] overflow-hidden">
        <div
          ref={trackRef}
          className="analysis-chart-track absolute bottom-10 left-[7vw] flex h-[54vh] min-h-[420px] min-w-max items-end gap-11 pr-[32vw] pt-12 md:left-[38vw]"
        >
          <div className="pointer-events-none absolute bottom-[128px] left-0 h-px w-full">
            {xAxisParticles.map((particle) => (
              <span
                key={particle.id}
                className="analysis-axis-particle absolute rounded-full"
                style={{
                  left: particle.left,
                  top: particle.offset,
                  width: particle.size,
                  height: particle.size,
                  background: particle.hue,
                  boxShadow: `0 0 ${particle.glow} ${particle.hue}`,
                }}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-[128px] left-0 h-[calc(100%-136px)] w-px">
            {yAxisParticles.map((particle) => (
              <span
                key={particle.id}
                className="analysis-axis-particle absolute rounded-full"
                style={{
                  bottom: particle.bottom,
                  left: particle.offset,
                  width: particle.size,
                  height: particle.size,
                  background: particle.hue,
                  boxShadow: `0 0 ${particle.glow} ${particle.hue}`,
                }}
              />
            ))}
          </div>

          {analysisProjects.map((project, index) => {
            const height = 160 + (project.impactScore / maxScore) * 300;
            const active = selectedProject.id === project.id;

            return (
              <div
                key={project.id}
                className="analysis-drift analysis-reveal relative flex w-[122px] flex-col items-center"
                style={{
                  "--drift-x": `${(Math.sin(index * 1.17) * 8).toFixed(3)}px`,
                  "--drift-y": `${(Math.cos(index * 0.91) * 7).toFixed(3)}px`,
                  "--drift-duration": `${5.2 + (index % 5) * 0.48}s`,
                  "--drift-delay": `${index * -0.21}s`,
                } as CSSProperties}
              >
                <FluidGlassButton
                  aria-label={`查看 ${project.title}`}
                  color={project.color}
                  variant="bar"
                  intensity={20}
                  onClick={() => {
                    activeIndexRef.current = index;
                    setSelectedProject(project);
                  }}
                  className="analysis-fluid-bar w-[92px] px-0 py-0"
                  style={{
                    height,
                    opacity: active ? 1 : 0.78,
                    transform: active ? "scale(1.04)" : "scale(1)",
                    filter: active ? `drop-shadow(0 0 28px ${project.color}55)` : "none",
                  }}
                >
                  <span className="absolute bottom-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/70" />
                </FluidGlassButton>
                <div className="mt-4 min-h-28 w-[154px] text-center">
                  <p className="text-xs font-semibold leading-5 text-white/74">{project.title}</p>
                  <p className="mt-1 text-[11px] text-white/36">{project.category}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/28">{String(index + 1).padStart(2, "0")}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
