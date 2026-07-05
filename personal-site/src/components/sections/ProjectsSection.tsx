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
    carouselSelectedIndex,
    setCarouselSelectedIndex,
    setActiveProjectScene,
  } = useProjectScene();

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
        const index = Math.min(
          STATION_COUNT - 1,
          Math.floor(progress * STATION_COUNT)
        );
        setCarouselActiveIndex(index);
      }
    };

    // Use GSAP ticker for scroll tracking (synced with Lenis)
    const tickerCallback = () => handleScroll();
    gsap.ticker.add(tickerCallback);

    return () => {
      gsap.ticker.remove(tickerCallback);
    };
  }, [activeSection, setActiveSection, setCarouselActiveIndex]);

  // ─── Handle project selection from 3D carousel ──────────────────
  useEffect(() => {
    if (carouselSelectedIndex !== null) {
      const project = projects[carouselSelectedIndex];
      if (project) {
        setSelectedProject(project);
        setActiveProjectScene(project.scene);
      }
    }
  }, [carouselSelectedIndex, setActiveProjectScene]);

  // ─── Close detail overlay ──────────────────────────────────────
  const handleCloseDetail = useCallback(() => {
    setSelectedProject(null);
    setCarouselSelectedIndex(null);
    setActiveProjectScene(null);
  }, [setCarouselSelectedIndex, setActiveProjectScene]);

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
      style={{ height: `${STATION_COUNT * 100}vh` }}
    >
      {/* ─── Section heading (fixed while in view) ──────────────── */}
      <div
        className="pointer-events-none fixed left-0 top-0 z-10 flex h-full w-full items-start justify-center"
        style={{ opacity: activeSection === "projects" ? 1 : 0, transition: "opacity 0.6s ease" }}
      >
        <div className="mt-8 text-center">
          <h2
            className="mb-2 text-2xl font-bold sm:text-3xl"
            style={gradientTextStyle}
          >
            Projects
          </h2>
          <p className="text-sm text-gray-500">
            Scroll to explore
          </p>
        </div>
      </div>

      {/* ─── DOM overlays for each project station ─────────────── */}
      {projects.slice(0, STATION_COUNT).map((project, index) => {
        const isActive = carouselActiveIndex === index;
        const themeColor = STATION_HEX_COLORS[index % STATION_HEX_COLORS.length];

        // Opacity based on distance from active index
        const distance = Math.abs(carouselActiveIndex - index);
        const opacity = activeSection === "projects"
          ? distance === 0 ? 1 : distance === 1 ? 0.3 : 0
          : 0;
        const translateY = distance === 0 ? 0 : 20;

        return (
          <div
            key={project.id}
            className="pointer-events-none fixed left-0 top-0 z-10 flex h-full w-full items-end justify-center"
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              transition: "opacity 0.5s ease, transform 0.5s ease",
              pointerEvents: isActive && selectedProject ? "none" : isActive ? "auto" : "none",
            }}
            onClick={() => {
              setCarouselSelectedIndex(index);
            }}
          >
            <div className="mb-[20vh] w-full max-w-lg px-6 text-center">
              {/* Project name */}
              <h3
                className="mb-3 text-4xl font-bold"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, #ffffff)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {project.name}
              </h3>

              {/* Subtitle */}
              <p className="mb-4 text-lg text-gray-300">
                {project.subtitle}
              </p>

              {/* Tech stack pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border px-3 py-1 text-sm transition-colors duration-300"
                    style={{
                      borderColor: `${themeColor}30`,
                      color: `${themeColor}cc`,
                      background: `${themeColor}10`,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Click hint */}
              {isActive && (
                <p className="mt-4 text-xs text-gray-600">
                  Click to view details
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* ─── Scroll indicator dots (right side) ────────────────── */}
      <div
        className="fixed right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3"
        style={{ opacity: activeSection === "projects" ? 1 : 0, transition: "opacity 0.5s ease" }}
      >
        {projects.slice(0, STATION_COUNT).map((project, index) => {
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
                const targetScroll =
                  section.offsetTop +
                  (scrollableHeight / STATION_COUNT) * index +
                  scrollableHeight / (STATION_COUNT * 2);

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
