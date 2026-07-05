"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { projects } from "@/data/projects";
import { useProjectScene } from "@/components/three/SceneContext";
import AnimatedText from "@/components/ui/AnimatedText";
import type { Project } from "@/types";

const STATION_COUNT = projects.length;
const VIRTUAL_SCROLL_SLOTS = STATION_COUNT + 1;
const PROJECT_INTRO_PROGRESS = 0.025;

const STATION_HEX_COLORS = [
  "#49c5b6",
  "#ff9398",
  "#8b5cf6",
  "#00d4ff",
  "#ff6b6b",
  "#a78bfa",
  "#ffca7a",
  "#7dd3fc",
  "#f0abfc",
  "#86efac",
];

function normalizeProjectProgress(progress: number) {
  return Math.max(0, Math.min(1, (progress - PROJECT_INTRO_PROGRESS) / (1 - PROJECT_INTRO_PROGRESS)));
}

function rawProgressForStation(index: number) {
  const stationProgress = STATION_COUNT <= 0 ? 0 : (index + 1) / VIRTUAL_SCROLL_SLOTS;
  return PROJECT_INTRO_PROGRESS + stationProgress * (1 - PROJECT_INTRO_PROGRESS);
}

function getActiveProjectIndex(rawProgress: number) {
  const stationProgress = normalizeProjectProgress(rawProgress);
  const virtualSlot = stationProgress * VIRTUAL_SCROLL_SLOTS;
  return Math.max(0, Math.min(STATION_COUNT - 1, Math.round(virtualSlot - 1)));
}

function getDnaDissolveForProgress(rawProgress: number) {
  const exitStart = PROJECT_INTRO_PROGRESS + ((STATION_COUNT + 0.5) / VIRTUAL_SCROLL_SLOTS) * (1 - PROJECT_INTRO_PROGRESS);
  return Math.max(0, Math.min(1, (rawProgress - exitStart) / Math.max(0.0001, 1 - exitStart)));
}

function getSectionDocumentTop(section: HTMLElement) {
  return section.getBoundingClientRect().top + window.scrollY;
}

function ProjectNarrative({
  project,
  index,
  count,
}: {
  project: Project;
  index: number;
  count: number;
}) {
  const color = STATION_HEX_COLORS[index % STATION_HEX_COLORS.length];

  return (
    <div key={project.id} className="project-narrative pointer-events-none max-w-[min(520px,36vw)] text-right">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.34em] text-white/36">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </p>
      <h3 className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl">
        <AnimatedText text={project.name} />
      </h3>
      <p className="mt-4 text-base font-medium leading-7" style={{ color }}>
        {project.subtitle}
      </p>
      <p className="mt-7 text-sm leading-7 text-white/62">
        {project.description}
      </p>
      <div className="mt-7 flex flex-wrap justify-end gap-x-4 gap-y-2">
        {project.techStack.map((tech) => (
          <span key={tech} className="text-xs font-semibold uppercase tracking-[0.18em] text-white/42">
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {project.tags.map((tag) => (
          <span key={tag} className="text-xs text-white/36">
            {tag}
          </span>
        ))}
      </div>
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-target pointer-events-auto mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white/78 transition-colors hover:text-white"
        >
          GitHub
          <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const {
    activeSection,
    setActiveSection,
    carouselActiveIndex,
    setCarouselActiveIndex,
    projectProgress,
    dnaDissolveProgress,
    setProjectProgress,
    setDnaDissolveProgress,
  } = useProjectScene();
  const lastProgressRef = useRef(-1);
  const lastIndexRef = useRef(-1);
  const visibleProjects = useMemo(() => projects.slice(0, STATION_COUNT), []);
  const activeProject = visibleProjects[carouselActiveIndex] ?? visibleProjects[0];
  const showProjectContent = normalizeProjectProgress(projectProgress) > 0.045;
  const projectContentOpacity = showProjectContent ? Math.max(0, 1 - dnaDissolveProgress * 1.45) : 0;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const upperTransitionDistance = viewportHeight * 1.08;
      const mainProjectsView = sectionTop <= viewportHeight * 0.05 && sectionBottom > viewportHeight * 0.18;
      const upperTransitionView = sectionTop > 0 && sectionTop < upperTransitionDistance && sectionBottom > 0;

      if (mainProjectsView) {
        setActiveSection("projects");
      } else if (upperTransitionView) {
        const gatherProgress = Math.max(0, Math.min(1, (upperTransitionDistance - sectionTop) / upperTransitionDistance));
        setDnaDissolveProgress(1 - gatherProgress);
        if (activeSection === "projects") setActiveSection(null);
      } else {
        if (sectionTop >= upperTransitionDistance || sectionBottom <= 0) setDnaDissolveProgress(1);
        if (activeSection === "projects") setActiveSection(null);
      }

      if (!mainProjectsView && activeSection === "projects") {
        setActiveSection(null);
      }

      if (sectionTop < viewportHeight && sectionBottom > 0) {
        const scrollable = Math.max(1, section.offsetHeight - viewportHeight);
        const rawProgress = Math.max(0, Math.min(1, -sectionTop / scrollable));
        const index = getActiveProjectIndex(rawProgress);

        if (Math.abs(rawProgress - lastProgressRef.current) > 0.002) {
          lastProgressRef.current = rawProgress;
          setProjectProgress(rawProgress);
          if (mainProjectsView) {
            setDnaDissolveProgress(getDnaDissolveForProgress(rawProgress));
          }
        }
        if (index !== lastIndexRef.current) {
          lastIndexRef.current = index;
          setCarouselActiveIndex(index);
        }
      }
    };

    gsap.ticker.add(handleScroll);
    return () => {
      gsap.ticker.remove(handleScroll);
    };
  }, [activeSection, setActiveSection, setCarouselActiveIndex, setDnaDissolveProgress, setProjectProgress]);

  useEffect(() => {
    const handleFocusProject = (event: Event) => {
      const projectIndex = (event as CustomEvent<number>).detail;
      if (typeof projectIndex !== "number") return;

      const boundedIndex = Math.max(0, Math.min(STATION_COUNT - 1, projectIndex));
      const section = sectionRef.current;
      if (!section) return;

      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const targetScroll = getSectionDocumentTop(section) + scrollable * rawProgressForStation(boundedIndex);
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
      setCarouselActiveIndex(boundedIndex);
    };

    window.addEventListener("portfolio:focus-project", handleFocusProject);
    return () => window.removeEventListener("portfolio:focus-project", handleFocusProject);
  }, [setCarouselActiveIndex]);

  const gradientTextStyle = {
    background: "linear-gradient(90deg, #49c5b6, #ff9398, #8b5cf6, #49c5b6)",
    backgroundSize: "300% 100%",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent",
    backgroundClip: "text" as const,
    animation: "gradient-flow 4s ease-in-out infinite",
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative"
      style={{ height: `${160 + STATION_COUNT * 108}vh` }}
    >
      <div className="pointer-events-none sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-transparent" />
      </div>

      <div
        className="pointer-events-none fixed left-0 top-0 z-10 flex h-full w-full items-center justify-between px-6 md:px-12"
        style={{ opacity: activeSection === "projects" ? 1 : 0, transition: "opacity 0.6s ease" }}
      >
        <div className="hidden w-[min(320px,26vw)] sm:block">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl" style={gradientTextStyle}>
            Projects
          </h2>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
            {showProjectContent ? String(carouselActiveIndex + 1).padStart(2, "0") : "--"} / {String(STATION_COUNT).padStart(2, "0")}
          </p>
        </div>

        <div
          style={{
            opacity: projectContentOpacity,
            transform: projectContentOpacity > 0.02 ? "translateY(0)" : "translateY(22px)",
            transition: "opacity 420ms ease, transform 420ms ease",
          }}
        >
          <ProjectNarrative
            key={activeProject.id}
            project={activeProject}
            index={carouselActiveIndex}
            count={STATION_COUNT}
          />
        </div>
      </div>

      <div
        className="fixed right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3 md:right-6"
        style={{ opacity: activeSection === "projects" ? 1 : 0, transition: "opacity 0.5s ease" }}
      >
        {visibleProjects.map((project, index) => {
          const isActive = carouselActiveIndex === index;
          const themeColor = STATION_HEX_COLORS[index % STATION_HEX_COLORS.length];

          return (
            <button
              key={project.id}
              onClick={() => {
                const section = sectionRef.current;
                if (!section) return;
                const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
                const targetScroll = getSectionDocumentTop(section) + scrollable * rawProgressForStation(index);
                window.scrollTo({ top: targetScroll, behavior: "smooth" });
              }}
              className="cursor-target group flex items-center gap-2"
              aria-label={`Go to project: ${project.name}`}
            >
              <div
                className="h-2.5 w-2.5 rounded-full transition-all duration-500"
                style={{
                  background: isActive ? themeColor : "rgba(255, 255, 255, 0.15)",
                  boxShadow: isActive ? `0 0 8px ${themeColor}80` : "none",
                  transform: isActive ? "scale(1.4)" : "scale(1)",
                }}
              />
              <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs text-gray-500 transition-all duration-300 group-hover:max-w-[150px]">
                {project.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
