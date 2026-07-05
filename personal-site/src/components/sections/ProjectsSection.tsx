"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects, categories, categoryLabels } from "@/data/projects";
import ProjectCard from "@/components/ui/ProjectCard";
import ProjectDetail from "@/components/ui/ProjectDetail";
import { useProjectScene } from "@/components/three/SceneContext";
import type { Project } from "@/types";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { setActiveProjectScene } = useProjectScene();

  // Section entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "top 40%",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        filterRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 35%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Filtered projects sorted by priority
  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") {
      return [...projects].sort((a, b) => b.priority - a.priority);
    }
    return projects
      .filter((p) => p.category === activeCategory)
      .sort((a, b) => b.priority - a.priority);
  }, [activeCategory]);

  const gradientTextStyle = {
    background: "linear-gradient(90deg, #49c5b6, #ff9398, #8b5cf6, #49c5b6)",
    backgroundSize: "300% 100%",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent",
    backgroundClip: "text" as const,
    animation: "gradient-flow 4s ease-in-out infinite",
  };

  const activeButtonStyle = {
    background:
      "linear-gradient(135deg, rgba(73, 197, 182, 0.25), rgba(139, 92, 246, 0.25))",
    borderColor: "rgba(73, 197, 182, 0.4)",
    color: "#49c5b6",
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative min-h-screen w-full py-32"
    >
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-16">
        {/* Section heading */}
        <div ref={headingRef} className="mb-16">
          <h2
            className="mb-4 text-3xl font-bold sm:text-4xl"
            style={gradientTextStyle}
          >
            Projects
          </h2>
          <p className="text-base text-gray-400">
            精选项目展示 -- 从 AI 产品到自动化工具，每个项目都承载着对技术的探索与实践。
          </p>
        </div>

        {/* Category filter bar */}
        <div ref={filterRef} className="mb-12">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full border border-white/10 px-5 py-2 text-sm font-medium transition-all duration-300"
                style={
                  activeCategory === cat
                    ? activeButtonStyle
                    : {
                        background: "rgba(255, 255, 255, 0.03)",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        color: "rgba(156, 163, 175, 1)",
                      }
                }
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Project cards grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => {
                setSelectedProject(project);
                setActiveProjectScene(project.scene);
              }}
            />
          ))}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">暂无该分类的项目</p>
          </div>
        )}
      </div>

      {/* Project detail overlay */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null);
            setActiveProjectScene(null);
          }}
        />
      )}
    </section>
  );
}
