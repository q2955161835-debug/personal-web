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

function pseudo(index: number, salt: number) {
  return Math.sin(index * 127.1 + salt * 311.7) * 43758.5453 % 1;
}

function normalizedPseudo(index: number, salt: number) {
  return Math.abs(pseudo(index, salt));
}

const xAxisParticles = Array.from({ length: 260 }, (_, index) => ({
  id: index,
  left: `${Math.min(100, Math.max(0, (index / 259) * 100 + (normalizedPseudo(index, 2.3) - 0.5) * 0.68)).toFixed(4)}%`,
  offset: `${((normalizedPseudo(index, 6.7) - 0.5) * 18 + Math.sin(index * 0.53) * 2.6).toFixed(3)}px`,
  size: `${(2.1 + normalizedPseudo(index, 8.4) * 2.2).toFixed(2)}px`,
  glow: `${(9 + normalizedPseudo(index, 3.4) * 12).toFixed(2)}px`,
  hue: index % 11 === 0 ? "#00d4ff" : index % 7 === 0 ? "#ff9398" : "rgba(255,255,255,0.46)",
  driftX: `${((normalizedPseudo(index, 12.7) - 0.5) * 16).toFixed(3)}px`,
  driftY: `${((normalizedPseudo(index, 14.2) - 0.5) * 12).toFixed(3)}px`,
  duration: `${(4.2 + normalizedPseudo(index, 15.6) * 3.2).toFixed(2)}s`,
  delay: `${(-normalizedPseudo(index, 17.1) * 2.8).toFixed(2)}s`,
}));

const yAxisParticles = Array.from({ length: 96 }, (_, index) => ({
  id: index,
  bottom: `${Math.min(100, Math.max(0, (index / 95) * 100 + (normalizedPseudo(index, 22.8) - 0.5) * 0.9)).toFixed(4)}%`,
  offset: `${((normalizedPseudo(index, 24.3) - 0.5) * 18 + Math.cos(index * 0.62) * 2.8).toFixed(3)}px`,
  size: `${(2.1 + normalizedPseudo(index, 27.4) * 2.1).toFixed(2)}px`,
  glow: `${(9 + normalizedPseudo(index, 29.1) * 12).toFixed(2)}px`,
  hue: index % 8 === 0 ? "#ff9398" : index % 5 === 0 ? "#49c5b6" : "rgba(255,255,255,0.4)",
  driftX: `${((normalizedPseudo(index, 31.7) - 0.5) * 13).toFixed(3)}px`,
  driftY: `${((normalizedPseudo(index, 33.2) - 0.5) * 14).toFixed(3)}px`,
  duration: `${(4.8 + normalizedPseudo(index, 35.6) * 3.4).toFixed(2)}s`,
  delay: `${(-normalizedPseudo(index, 37.1) * 2.4).toFixed(2)}s`,
}));

const fieldParticles = Array.from({ length: 190 }, (_, index) => ({
  id: index,
  left: `${(normalizedPseudo(index, 44.1) * 100).toFixed(3)}%`,
  top: `${(normalizedPseudo(index, 46.9) * 100).toFixed(3)}%`,
  size: `${(1 + normalizedPseudo(index, 47.7) * 2.2).toFixed(2)}px`,
  driftX: `${((normalizedPseudo(index, 48.2) - 0.5) * 28).toFixed(3)}px`,
  driftY: `${((normalizedPseudo(index, 49.3) - 0.5) * 24).toFixed(3)}px`,
  delay: `${(-normalizedPseudo(index, 50.4) * 3.2).toFixed(2)}s`,
  duration: `${(6.2 + normalizedPseudo(index, 51.8) * 4.4).toFixed(2)}s`,
}));

const methodPosition = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 20 + (index % 4) * 7;
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * (radius * 0.84)}%`,
  };
};

const METHOD_ALIASES: Record<string, string[]> = {
  "Logistic 回归": ["多因素 Logistic 回归", "有序 Logit"],
  面板固定效应: ["面板双向固定效应", "双向固定效应"],
  "K-means 聚类": ["K-means 聚类"],
  "GARCH-MIDAS": ["GARCH-MIDAS"],
  因子分析: ["因子分析", "探索性因子分析", "验证性因子分析"],
  "Cox 回归": ["Cox 回归"],
  PCA: ["PCA 降维", "主成分分析"],
  TOPSIS: ["TOPSIS"],
  事件研究法: ["事件研究法"],
  "Meta 分析": ["医学文献 Meta 分析", "随机效应模型"],
  信度效度: ["信度效度检验", "信度检验", "Cronbach alpha", "KMO 检验"],
  灰色关联: ["灰色关联分析"],
  异常值检测: ["异常值检测", "Isolation Forest"],
  Bootstrap: ["Bootstrap"],
};

function methodIsActive(project: DataAnalysisProject, methodName: string) {
  const aliases = METHOD_ALIASES[methodName] ?? [methodName];
  const tokens = [...project.method, ...project.tools];
  return tokens.some((method) =>
    aliases.some((alias) => method.includes(alias) || alias.includes(method) || methodName.includes(method))
  );
}

const METHOD_SPECKS = Array.from({ length: 7 }, (_, index) => ({
  id: index,
  x: `${((normalizedPseudo(index, 61.2) - 0.5) * 42).toFixed(3)}px`,
  y: `${((normalizedPseudo(index, 62.5) - 0.5) * 36).toFixed(3)}px`,
  size: `${(1.4 + normalizedPseudo(index, 63.8) * 2.2).toFixed(2)}px`,
}));

const COMPACT_TITLE: Record<string, string> = {
  "ESG 表现对企业融资约束影响": "ESG 融资约束",
  "宏观变量与波动率混频建模": "混频波动建模",
  "治疗方案生存结局比较": "生存结局比较",
  "区域发展指标综合评价": "区域指标评价",
  "慢病风险因素筛查模型": "慢病风险筛查",
  "化学仪器数据聚类与异常识别": "仪器异常识别",
  "品牌认知人群细分研究": "品牌人群细分",
  "大学生消费行为与支付偏好研究": "消费支付偏好",
  "公共服务满意度驱动因素分析": "满意度驱动因素",
  "政策公告的市场反应事件研究": "政策事件研究",
  "医学文献 Meta 分析": "医学 Meta 分析",
  "化学实验响应面优化": "响应面优化",
  "心理量表结构效度验证": "量表效度验证",
  "组织协作网络结构分析": "协作网络分析",
  "多因子选股有效性检验": "多因子检验",
};

function MethodNebula({ project }: { project: DataAnalysisProject }) {
  return (
    <div className="pointer-events-none absolute right-[6vw] top-[18vh] hidden h-[34vh] min-h-72 w-[32vw] max-w-[420px] lg:block">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(73,197,182,0.1),transparent_64%)] blur-sm" />
      {analysisMethodNodes.map((node, index) => {
        const active = methodIsActive(project, node.name);
        const color = analysisCategorySummary.find((item) => item.category === node.category)?.color ?? "#49c5b6";
        const weightedCount = Math.min(node.count, 24);
        const size = active ? 14 + weightedCount * 0.72 : 4 + weightedCount * 0.18;
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
            {METHOD_SPECKS.map((speck) => (
              <span
                key={speck.id}
                className="analysis-method-speck absolute rounded-full"
                style={{
                  left: speck.x,
                  top: speck.y,
                  width: speck.size,
                  height: speck.size,
                  background: color,
                  opacity: active ? 0.52 : 0.18,
                  boxShadow: active ? `0 0 12px ${color}` : "none",
                } as CSSProperties}
              />
            ))}
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

      gsap.fromTo(
        ".analysis-stage",
        { opacity: 0.2, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          ease: "none",
          transformOrigin: "50% 70%",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
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
            className="analysis-field-particle absolute rounded-full bg-white/45"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              "--drift-x": particle.driftX,
              "--drift-y": particle.driftY,
              "--particle-duration": particle.duration,
              "--particle-delay": particle.delay,
            } as CSSProperties}
          />
        ))}
      </div>

      <FloatingProjectDetail project={selectedProject} />
      <MethodNebula project={selectedProject} />

      <div className="analysis-stage relative z-10 h-[calc(100vh-7rem)] min-h-[700px] overflow-hidden">
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
                  "--drift-x": particle.driftX,
                  "--drift-y": particle.driftY,
                  "--particle-duration": particle.duration,
                  "--particle-delay": particle.delay,
                } as CSSProperties}
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
                  "--drift-x": particle.driftX,
                  "--drift-y": particle.driftY,
                  "--particle-duration": particle.duration,
                  "--particle-delay": particle.delay,
                } as CSSProperties}
              />
            ))}
          </div>

          {analysisProjects.map((project, index) => {
            const heightVariation = Math.sin(index * 1.37) * 34 + Math.cos(index * 0.71) * 22;
            const height = 148 + (project.impactScore / maxScore) * 292 + heightVariation;
            const active = selectedProject.id === project.id;
            const compactTitle = COMPACT_TITLE[project.title] ?? project.title;

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
                  className={`analysis-fluid-bar w-[92px] px-0 py-0 ${active ? "analysis-fluid-bar-active" : ""}`}
                  style={{
                    height,
                    opacity: active ? 1 : 0.78,
                    transform: active ? "scale(1.16) translateY(-18px)" : "scale(1)",
                    filter: active ? `drop-shadow(0 0 42px ${project.color}a8)` : "none",
                  }}
                >
                  <span className="absolute bottom-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/70" />
                </FluidGlassButton>
                <div className="mt-4 min-h-24 w-[154px] text-center">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold leading-5 text-white/78">{compactTitle}</p>
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
