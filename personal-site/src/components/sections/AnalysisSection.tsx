"use client";

import { useEffect, useRef, useState } from "react";
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
import { useProjectScene } from "@/components/three/SceneContext";
import AnimatedText from "@/components/ui/AnimatedText";

gsap.registerPlugin(ScrollTrigger);

function normalizedPseudo(index: number, salt: number) {
  return Math.abs(Math.sin(index * 127.1 + salt * 311.7) * 43758.5453) % 1;
}

const X_AXIS_TICK_COUNT = 124;

const xAxisTicks = Array.from({ length: X_AXIS_TICK_COUNT }, (_, index) => {
  const ratio = index / (X_AXIS_TICK_COUNT - 1);
  return {
    id: index,
    ratio,
    baseHeight: 4 + normalizedPseudo(index, 3.4) * 2,
    color:
      index % 13 === 0
        ? "#00d4ff"
        : index % 9 === 0
          ? "#ff9398"
          : index % 7 === 0
            ? "#ffca7a"
            : "rgba(255,255,255,0.52)",
  };
});

const yAxisTicks = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  ratio: index / 21,
  height: 10 + normalizedPseudo(index, 13.4) * 18,
  offset: 0,
  color: index % 10 === 0 ? "#49c5b6" : index % 7 === 0 ? "#8b5cf6" : "rgba(255,255,255,0.42)",
}));

const fieldParticles = Array.from({ length: 82 }, (_, index) => ({
  id: index,
  left: `${(normalizedPseudo(index, 44.1) * 100).toFixed(3)}%`,
  top: `${(normalizedPseudo(index, 46.9) * 100).toFixed(3)}%`,
  size: `${(1 + normalizedPseudo(index, 47.7) * 1.8).toFixed(2)}px`,
  driftX: `${((normalizedPseudo(index, 48.2) - 0.5) * 24).toFixed(3)}px`,
  driftY: `${((normalizedPseudo(index, 49.3) - 0.5) * 26).toFixed(3)}px`,
  delay: `${(-normalizedPseudo(index, 50.4) * 3.2).toFixed(2)}s`,
  duration: `${(7.2 + normalizedPseudo(index, 51.8) * 4.4).toFixed(2)}s`,
}));

const methodPosition = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const radius = 22 + (index % 5) * 6;
  return {
    left: `${(50 + Math.cos(angle) * radius).toFixed(4)}%`,
    top: `${(50 + Math.sin(angle) * radius * 0.78).toFixed(4)}%`,
  };
};

const METHOD_ALIASES: Record<string, string[]> = {
  "GARCH-MIDAS": ["GARCH-MIDAS", "GARCH(1,1)", "GARCH/TGARCH/EGARCH"],
  "DCC-GARCH": ["DCC-GARCH", "动态条件相关"],
  VAR: ["VAR 模型", "VECM", "向量自回归"],
  "VAR/VECM": ["VAR 模型", "VECM", "向量自回归"],
  "Logistic 回归": ["Logistic 回归", "二元 Logistic 回归", "多因素 Logistic 回归"],
  "双向固定效应": ["双向固定效应", "Two-way FE", "固定效应"],
  结构方程: ["ACSI 结构方程", "验证性因子分析", "AMOS", "模型拟合"],
  因子分析: ["EFA 探索性因子分析", "探索性因子分析", "因子分析", "PCA 降维", "主成分分析"],
  信效度检验: ["信度检验", "KMO 检验", "Cronbach alpha", "Bartlett", "信效度"],
  "K-means 聚类": ["K-means 聚类", "聚类分层"],
  "PCA 降维": ["PCA 降维", "主成分分析"],
  灰色关联: ["灰色关联分析"],
  "Meta 分析": ["Meta 分析", "随机效应模型"],
  "Cox 回归": ["Cox 回归"],
  TOPSIS: ["TOPSIS", "熵权法"],
  社会网络分析: ["社会网络分析", "Louvain", "中心性指标"],
  爬虫采集: ["公开 API 爬虫", "爬虫采集", "requests"],
  "Excel 自动化": ["Excel 公式保留", "openpyxl", "Excel 自动化"],
  数据质量审计: ["数据质量审计", "异常逻辑校验", "字段映射", "单位标准化"],
  "WPS/Word": ["WPS", "Word", "Word COM", "IMRAD"],
  Bootstrap: ["Bootstrap"],
  DID: ["DID", "PSM-DID", "双重差分"],
  Heckman: ["Heckman 两阶段"],
  "Fama-French": ["Fama-French 五因子", "Carhart 四因子", "Jensen Alpha"],
  "空间计量": ["空间杜宾模型", "SAR/SEM 对照", "空间权重矩阵"],
  PROCESS: ["PROCESS", "调节效应", "有调节的中介"],
  LPA: ["潜在剖面分析", "BCH 后效分析", "Entropy"],
  Hadoop: ["Hadoop", "MapReduce", "HDFS", "User-CF", "Item-CF"],
};

const COMPACT_TITLE: Record<string, string> = {
  "GARCH-MIDAS 混频波动率预测模型": "GARCH-MIDAS 混频波动",
  "沪深300 GARCH族节假日效应": "GARCH节假日效应",
  "数字经济驱动乡村产业融合面板实证": "数字经济乡村融合",
  "黄金石油美元指数联动性研究": "黄金石油美元联动",
  "A股财务与城市宏观数据批量采集": "A股与城市数据采集",
  "出口信用保险贸易引力模型": "出口信用保险引力",
  "绿色基金多因子绩效归因": "绿色基金绩效归因",
  "社区老年人睡眠障碍现状及影响因素": "老年睡眠障碍",
  "均衡饮食与睡眠自我效能相关性分析": "饮食与睡眠效能",
  "2型糖尿病体力活动现状及影响因素": "糖尿病体力活动",
  "青刺尖抗氧化活性谱效关系分析": "青刺尖谱效关系",
  "无人机物流侵权问卷编码清洗": "无人机物流编码",
  "社交电商种草消费 SEM 模型": "社交电商SEM",
  "平台经济就业结构空间计量": "平台经济就业空间",
  "旅游景点 Hadoop 推荐系统": "Hadoop景点推荐",
  "AI 技术压力潜在剖面分析": "AI压力LPA",
  "脑出血 IRE1α 通路论文结构规范化": "IRE1α 论文结构",
};

function methodIsActive(project: DataAnalysisProject, methodName: string) {
  const aliases = METHOD_ALIASES[methodName] ?? [methodName];
  const tokens = [...project.method, ...project.tools];
  return tokens.some((token) => {
    const normalizedToken = token.trim().toLowerCase();
    if (!normalizedToken) return false;

    return aliases.some((alias) => {
      const normalizedAlias = alias.toLowerCase();
      const normalizedMethod = methodName.toLowerCase();
      if (normalizedToken.length <= 2) {
        return normalizedAlias === normalizedToken || normalizedMethod === normalizedToken;
      }

      return (
        normalizedToken.includes(normalizedAlias) ||
        normalizedAlias.includes(normalizedToken) ||
        normalizedMethod.includes(normalizedToken)
      );
    });
  });
}

function normalBarHeight(index: number, total: number) {
  const center = (total - 1) / 2;
  const sigma = Math.max(1, total / 4.75);
  const z = (index - center) / sigma;
  const gaussian = Math.exp(-0.5 * z * z);
  const shoulder = 0.24 * Math.exp(-0.5 * Math.pow((Math.abs(index - center) - total * 0.24) / (total / 8.5), 2));
  const localVariance = (normalizedPseudo(index, 88.2) - 0.5) * 58;

  return Math.max(88, Math.min(382, 92 + gaussian * 252 + shoulder * 92 + localVariance));
}

function MethodNebula({ project }: { project: DataAnalysisProject }) {
  return (
    <div className="pointer-events-none absolute right-[4vw] top-[8vh] hidden h-[38vh] min-h-80 w-[34vw] max-w-[500px] lg:block">
      {analysisMethodNodes.map((node, index) => {
        const active = methodIsActive(project, node.name);
        const color = analysisCategorySummary.find((item) => item.category === node.category)?.color ?? "#49c5b6";
        const weightedCount = Math.min(node.count, 34);
        const size = active ? 16 + weightedCount * 0.62 : 3.5 + weightedCount * 0.13;
        const position = methodPosition(index, analysisMethodNodes.length);

        return (
          <div
            key={node.name}
            className="analysis-method-orbit cursor-target pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              ...position,
              color,
              "--method-color": color,
              "--drift-x": `${((normalizedPseudo(index, 72.4) - 0.5) * 18).toFixed(4)}px`,
              "--drift-y": `${((normalizedPseudo(index, 74.8) - 0.5) * 16).toFixed(4)}px`,
              "--drift-duration": `${(5.6 + (index % 5) * 0.55).toFixed(2)}s`,
              "--drift-delay": `${(index * -0.2).toFixed(2)}s`,
            } as CSSProperties}
            title={node.name}
          >
            <span
              className="block rounded-full transition-all duration-500"
              style={{
                width: `${size.toFixed(3)}px`,
                height: `${size.toFixed(3)}px`,
                background: "currentColor",
                boxShadow: active ? "0 0 34px currentColor" : "0 0 12px currentColor",
                opacity: active ? "0.94" : "0.34",
              }}
            />
            <span
              className="mt-2 block whitespace-nowrap text-xs font-semibold text-white transition-all duration-500"
              style={{
                opacity: active ? "0.9" : "0",
                transform: active ? "translateY(0)" : "translateY(7px)",
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
    <div className="analysis-reveal pointer-events-none absolute left-6 top-14 z-20 max-w-[min(560px,45vw)] md:left-12">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/34">
        93 Cases / Ranked By Practical Value
      </p>
      <h2 className="iridescent-text mt-3 text-5xl font-bold leading-none md:text-6xl">
        Data Analysis
      </h2>
      <p className="mt-5 max-w-xl text-sm leading-7 text-white/58">
        每根玻璃柱代表一个精选项目。进入本区后页面固定，滚轮推动柱状图横向移动，当前详情与方法星云同步切换。
      </p>

      <div className="mt-9">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/34">
          Selected Case
        </p>
        <h3 className="mt-3 max-w-xl text-3xl font-bold leading-tight text-white">
          <AnimatedText text={project.title} />
        </h3>
        <p className="mt-5 max-w-xl text-sm leading-7 text-white/62">{project.description}</p>
      </div>

      <div className="mt-6 grid max-w-xl grid-cols-3 gap-6">
        <div>
          <p className="text-2xl font-bold text-white">{project.valueLabel}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">核心</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{project.method.length}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">方法</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{project.tools.length}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">工具</p>
        </div>
      </div>

      <p className="mt-5 max-w-xl text-sm font-medium leading-7" style={{ color: project.color }}>
        {project.sampleSize}
      </p>
      <ul className="mt-4 grid max-w-3xl gap-2 text-sm leading-6 text-white/58 md:grid-cols-3">
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
  const [activeIndex, setActiveIndex] = useState(0);
  const { setActiveSection, setDnaDissolveProgress } = useProjectScene();

  const activeRatio = analysisProjects.length <= 1 ? 0.5 : activeIndex / (analysisProjects.length - 1);
  const selectedProject = analysisProjects[activeIndex] ?? analysisProjects[0];

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const setProjectByProgress = (progress: number) => {
      const nextIndex = Math.min(
        analysisProjects.length - 1,
        Math.max(0, Math.floor(progress * analysisProjects.length))
      );
      if (nextIndex === activeIndexRef.current) return;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".analysis-reveal",
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 74%",
            end: "top 30%",
            toggleActions: "play none none reverse",
          },
        }
      );

      const horizontalTravel = () => Math.max(0, track.scrollWidth - window.innerWidth * 0.74);
      const tween = gsap.to(track, {
        x: () => -horizontalTravel(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${horizontalTravel() + window.innerHeight * 1.5}`,
          scrub: 0.82,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => {
            setActiveSection("data-analysis");
            setDnaDissolveProgress(1);
          },
          onEnterBack: () => {
            setActiveSection("data-analysis");
            setDnaDissolveProgress(1);
          },
          onLeave: () => setDnaDissolveProgress(1),
          onLeaveBack: () => setDnaDissolveProgress(0),
          onUpdate: (self) => {
            setActiveSection("data-analysis");
            setDnaDissolveProgress(1);
            setProjectByProgress(self.progress);
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, section);

    return () => ctx.revert();
  }, [setActiveSection, setDnaDissolveProgress]);

  return (
    <section id="data-analysis" ref={sectionRef} className="relative z-10 min-h-screen overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,212,255,0.07),transparent_30%,rgba(255,147,152,0.06)_72%,transparent)]" />
        {fieldParticles.map((particle) => (
          <span
            key={particle.id}
            className="analysis-field-particle absolute rounded-full bg-white/38"
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

      <div className="analysis-stage relative z-10 h-screen min-h-[760px] overflow-hidden">
        <FloatingProjectDetail project={selectedProject} />
        <MethodNebula project={selectedProject} />

        <div className="pointer-events-none absolute inset-x-[2.4vw] bottom-[1.5vh] z-20 h-[38vh] min-h-[300px]">
          <div className="absolute bottom-[46px] left-0 right-0 h-[116px]">
            <span className="analysis-axis-baseline absolute bottom-0 left-0 w-full" />
            {xAxisTicks.map((tick) => {
              const distance = tick.ratio - activeRatio;
              const primaryWave = Math.exp(-Math.pow(distance * 34, 2));
              const trailingWave = Math.exp(-Math.pow((distance + 0.038) * 44, 2)) * 0.34;
              const leadingWave = Math.exp(-Math.pow((distance - 0.026) * 48, 2)) * 0.22;
              const rhythm = 0.5 + Math.sin(tick.id * 0.35 + activeIndex * 1.18) * 0.5;
              const wave = Math.min(1, primaryWave + trailingWave + leadingWave);
              const height =
                tick.baseHeight +
                primaryWave * (46 + rhythm * 48) +
                trailingWave * 28 +
                leadingWave * 18;

              return (
                <span
                  key={tick.id}
                  className="analysis-axis-tick absolute bottom-0 w-px rounded-full"
                  style={{
                    left: `${(tick.ratio * 100).toFixed(4)}%`,
                    height: `${Math.max(2, height).toFixed(2)}px`,
                    "--tick-color": tick.color,
                    background: "var(--tick-color)",
                    boxShadow: wave > 0.28 ? `0 0 ${(7 + wave * 22).toFixed(3)}px var(--tick-color)` : "none",
                    opacity: (0.34 + wave * 0.58).toFixed(4),
                  } as CSSProperties}
                />
              );
            })}
          </div>

          <div className="absolute bottom-[46px] left-0 h-[200px] md:h-[224px]">
            <span className="analysis-axis-vertical absolute bottom-0 left-0 h-full" />
            {yAxisTicks.map((tick) => (
              <span
                key={tick.id}
                className="analysis-y-tick absolute h-px rounded-full"
                style={{
                  bottom: `${(tick.ratio * 100).toFixed(4)}%`,
                  left: `${tick.offset.toFixed(2)}px`,
                  width: `${tick.height.toFixed(4)}px`,
                  "--tick-color": tick.color,
                  background: "var(--tick-color)",
                  opacity: 0.42,
                } as CSSProperties}
              />
            ))}
          </div>
        </div>

        <div
          ref={trackRef}
          className="analysis-chart-track absolute bottom-[calc(1.5vh+46px)] left-[calc(2.4vw+92px)] z-10 flex h-[calc(43vh-70px)] min-h-[252px] min-w-max items-end gap-12 pr-[42vw] md:left-[36vw]"
        >
          {analysisProjects.map((project, index) => {
            const isActive = activeIndex === index;
            const height = normalBarHeight(index, analysisProjects.length);
            const compactTitle = COMPACT_TITLE[project.title] ?? project.title;

            return (
              <div
                key={project.id}
                className="analysis-drift relative h-full w-[154px] shrink-0"
                style={{
                  "--drift-x": `${((normalizedPseudo(index, 60.1) - 0.5) * 16).toFixed(4)}px`,
                  "--drift-y": `${((normalizedPseudo(index, 61.2) - 0.5) * 18).toFixed(4)}px`,
                  "--drift-duration": `${(5.4 + (index % 5) * 0.48).toFixed(2)}s`,
                  "--drift-delay": `${(index * -0.21).toFixed(2)}s`,
                } as CSSProperties}
              >
                <FluidGlassButton
                  aria-label={`查看 ${project.title}`}
                  color={project.color}
                  variant="bar"
                  intensity={24}
                  onClick={() => {
                    activeIndexRef.current = index;
                    setActiveIndex(index);
                  }}
                  className={`analysis-fluid-bar w-[92px] px-0 py-0 ${isActive ? "analysis-fluid-bar-active" : ""}`}
                  style={{
                    height,
                    opacity: isActive ? 1 : 0.74,
                    transform: isActive ? "scale(1.17) translateY(-16px)" : "scale(1)",
                    filter: isActive ? `drop-shadow(0 0 42px ${project.color}a8)` : "none",
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    marginLeft: "-46px",
                  }}
                >
                  <span className="sr-only">{project.title}</span>
                </FluidGlassButton>
                {isActive && <span className="analysis-active-underbar" style={{ "--active-color": project.color } as CSSProperties} />}
                <div className="absolute left-1/2 top-[calc(100%+14px)] min-h-24 w-[164px] -translate-x-1/2 text-center">
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold leading-5 text-white/78">
                    {compactTitle}
                  </p>
                  <p className="mt-1 text-[11px] text-white/36">{project.category}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/28">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
