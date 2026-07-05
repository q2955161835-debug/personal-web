"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { projects } from "@/data/projects";
import ProjectDetail from "@/components/ui/ProjectDetail";
import { InteractiveGlassButton } from "@/components/ui/InteractiveGlassPanel";
import { useProjectScene } from "@/components/three/SceneContext";
import type { Project } from "@/types";

const STATION_COUNT = 6;

// Theme colors for each project station
const STATION_HEX_COLORS = [
  "#49c5b6",
  "#ff9398",
  "#8b5cf6",
  "#00d4ff",
  "#ff6b6b",
  "#a78bfa",
];

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const {
    activeSection,
    setActiveSection,
    carouselActiveIndex,
    setCarouselActiveIndex,
    setProjectProgress,
    helixZoomedStation,
    setHelixZoomedStation,
    setActiveProjectScene,
  } = useProjectScene();
  const lastProgressRef = useRef(-1);
  const lastIndexRef = useRef(-1);
  const visibleProjects = projects.slice(0, STATION_COUNT);
  const activeProject = visibleProjects[carouselActiveIndex] ?? visibleProjects[0];
  const activeThemeColor = STATION_HEX_COLORS[carouselActiveIndex % STATION_HEX_COLORS.length];

  // ─── Scroll-driven active section detection ──────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Check if section is in view
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;

      if (sectionTop < viewportHeight * 0.5 && sectionBottom > viewportHeight * 0.5) {
        setActiveSection("projects");
      } else if (sectionTop >= viewportHeight * 0.5) {
        // Before the section - could be hero or about
        // Let other sections handle their own activation
        if (activeSection === "projects") {
          setActiveSection(null);
        }
      } else {
        // Past the section
        if (activeSection === "projects") {
          setActiveSection(null);
        }
      }

      // Compute active index within the section
      if (sectionTop < viewportHeight && sectionBottom > 0) {
        const totalHeight = section.offsetHeight;
        const scrolledInto = -sectionTop; // how far we've scrolled past the top
        const progress = Math.max(0, Math.min(1, scrolledInto / (totalHeight - viewportHeight)));
        const index = Math.min(STATION_COUNT - 1, Math.round(progress * (STATION_COUNT - 1)));

        if (Math.abs(progress - lastProgressRef.current) > 0.002) {
          lastProgressRef.current = progress;
          setProjectProgress(progress);
        }
        if (index !== lastIndexRef.current) {
          lastIndexRef.current = index;
          setCarouselActiveIndex(index);
        }
      }
    };

    // Use GSAP ticker for scroll tracking (synced with Lenis)
    const tickerCallback = () => handleScroll();
    gsap.ticker.add(tickerCallback);

    return () => {
      gsap.ticker.remove(tickerCallback);
    };
  }, [activeSection, setActiveSection, setCarouselActiveIndex, setProjectProgress]);

  // ─── Handle project selection from DNA helix zoom ──────────────
  useEffect(() => {
    if (helixZoomedStation !== null) {
      const project = projects[helixZoomedStation];
      if (project) {
        setActiveProjectScene(project.scene);
        const timer = window.setTimeout(() => {
          setSelectedProject(project);
        }, 420);

        return () => window.clearTimeout(timer);
      }
    }
  }, [helixZoomedStation, setActiveProjectScene]);

  // ─── Close detail overlay ──────────────────────────────────────
  const handleCloseDetail = useCallback(() => {
    setSelectedProject(null);
    setHelixZoomedStation(null);
    setActiveProjectScene(null);
  }, [setHelixZoomedStation, setActiveProjectScene]);

  const gradientTextStyle = {
    background: "linear-gradient(90deg, #49c5b6, #ff9398, #8b5cf6, #49c5b6)",
    backgroundSize: "300% 100%",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent",
    backgroundClip: "text" as const,
    animation: "gradient-flow 4s ease-in-out infinite",
  };

  useEffect(() => {
    const handleOpenProject = (event: Event) => {
      const projectIndex = (event as CustomEvent<number>).detail;
      if (typeof projectIndex !== "number") return;

      const boundedIndex = Math.max(0, Math.min(STATION_COUNT - 1, projectIndex));
      setCarouselActiveIndex(boundedIndex);
      setHelixZoomedStation(boundedIndex);
    };

    window.addEventListener("portfolio:open-project", handleOpenProject);
    return () => window.removeEventListener("portfolio:open-project", handleOpenProject);
  }, [setCarouselActiveIndex, setHelixZoomedStation]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative"
      style={{ height: `${STATION_COUNT * 150}vh` }}
    >
      <div className="pointer-events-none sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(73,197,182,0.08),transparent_28%,rgba(255,147,152,0.06)_72%,transparent)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:84px_84px]" />
      </div>

      {/* ─── Compact project status (fixed while in view) ───────── */}
      <div
        className="pointer-events-none fixed left-0 top-0 z-10 flex h-full w-full items-center"
        style={{ opacity: activeSection === "projects" ? 1 : 0, transition: "opacity 0.6s ease" }}
      >
        <div className="ml-6 hidden w-[min(320px,42vw)] sm:block md:ml-12">
          <h2
            className="mb-3 text-2xl font-bold sm:text-3xl"
            style={gradientTextStyle}
          >
            Projects
          </h2>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
            {String(carouselActiveIndex + 1).padStart(2, "0")} / {String(STATION_COUNT).padStart(2, "0")}
          </p>
          <p className="mt-4 hidden text-lg font-semibold text-white/85 sm:block">
            {activeProject.name}
          </p>
          <p className="mt-2 hidden text-sm leading-relaxed text-white/45 sm:block">
            {activeProject.subtitle}
          </p>
        </div>
        <div
          className="pointer-events-auto fixed w-[min(20rem,66vw)]"
          style={{
            left: "50%",
            top: "39%",
            opacity: activeSection === "projects" && !selectedProject ? 1 : 0,
            transform: "translate(-50%, -50%)",
            transition: "opacity 320ms cubic-bezier(0.22, 1, 0.36, 1)",
            pointerEvents: activeSection === "projects" && !selectedProject ? "auto" : "none",
          }}
        >
          <InteractiveGlassButton
            aria-label={`Open project ${activeProject.name}`}
            glowColor={activeThemeColor}
            intensity={8}
            className="w-full rounded-lg px-4 py-3 text-left"
            onClick={() => setHelixZoomedStation(carouselActiveIndex)}
          >
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-white/48">
              {String(carouselActiveIndex + 1).padStart(2, "0")} / {String(STATION_COUNT).padStart(2, "0")}
            </span>
            <span className="block text-base font-bold leading-tight text-white">
              {activeProject.name}
            </span>
          </InteractiveGlassButton>
        </div>
      </div>

      {/* ─── Scroll indicator dots (right side) ────────────────── */}
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
                // Scroll to the corresponding section
                const section = sectionRef.current;
                if (!section) return;
                const totalHeight = section.offsetHeight;
                const viewportHeight = window.innerHeight;
                const scrollableHeight = totalHeight - viewportHeight;
                const targetProgress = index / (STATION_COUNT - 1);
                const targetScroll = section.offsetTop + scrollableHeight * targetProgress;

                window.scrollTo({
                  top: targetScroll,
                  behavior: "smooth",
                });
              }}
              className="cursor-target group flex items-center gap-2"
              aria-label={`Go to project: ${project.name}`}
            >
              {/* Dot */}
              <div
                className="h-2.5 w-2.5 rounded-full transition-all duration-500"
                style={{
                  background: isActive ? themeColor : "rgba(255, 255, 255, 0.15)",
                  boxShadow: isActive ? `0 0 8px ${themeColor}80` : "none",
                  transform: isActive ? "scale(1.4)" : "scale(1)",
                }}
              />
              {/* Label (visible on hover) */}
              <span
                className="max-w-0 overflow-hidden whitespace-nowrap text-xs text-gray-500 transition-all duration-300 group-hover:max-w-[120px]"
              >
                {project.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Project detail overlay ──────────────────────────── */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={handleCloseDetail}
        />
      )}
    </section>
  );
}
