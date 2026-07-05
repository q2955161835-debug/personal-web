"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { projects } from "@/data/projects";
import ProjectDetail from "@/components/ui/ProjectDetail";
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

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative"
      style={{ height: `${STATION_COUNT * 110}vh` }}
    >
      {/* ─── Compact project status (fixed while in view) ───────── */}
      <div
        className="pointer-events-none fixed left-0 top-0 z-10 flex h-full w-full items-center"
        style={{ opacity: activeSection === "projects" ? 1 : 0, transition: "opacity 0.6s ease" }}
      >
        <div className="ml-6 w-[min(320px,42vw)] md:ml-12">
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
        <button
          type="button"
          aria-label={`Open project ${activeProject.name}`}
          className="pointer-events-auto fixed w-56 rounded-lg px-3 py-2 text-left shadow-2xl"
          style={{
            left: "50%",
            top: "57%",
            opacity: activeSection === "projects" && !selectedProject ? 1 : 0,
            transform: "translate(-50%, -50%)",
            transition:
              "opacity 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 320ms cubic-bezier(0.25, 1, 0.5, 1)",
            background:
              "linear-gradient(135deg, rgba(5, 12, 22, 0.86), rgba(5, 12, 22, 0.48))",
            border: `1px solid ${activeThemeColor}cc`,
            color: activeThemeColor,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: `0 18px 60px ${activeThemeColor}24, 0 0 24px ${activeThemeColor}35`,
            pointerEvents: activeSection === "projects" && !selectedProject ? "auto" : "none",
          }}
          onClick={() => setHelixZoomedStation(carouselActiveIndex)}
        >
          <span className="mb-2 block text-xs font-semibold text-white/50">
            {String(carouselActiveIndex + 1).padStart(2, "0")} / {String(STATION_COUNT).padStart(2, "0")}
          </span>
          <span className="block text-sm font-bold leading-tight text-white">
            {activeProject.name}
          </span>
        </button>
      </div>

      {/* ─── Scroll indicator dots (right side) ────────────────── */}
      <div
        className="fixed right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3"
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
              className="group flex items-center gap-2"
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
