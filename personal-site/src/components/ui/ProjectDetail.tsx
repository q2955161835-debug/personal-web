"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import type { Project } from "@/types";
import ProjectVisualBackdrop from "./ProjectVisualBackdrop";
import { FluidGlassPanel } from "./FluidGlassPanel";

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline();

    tl.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    ).fromTo(
      content,
      { opacity: 0, y: 60, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
      },
      "-=0.1"
    );

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close with exit animation
  const handleClose = useCallback(() => {
    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(content, {
      opacity: 0,
      y: 40,
      scale: 0.96,
      duration: 0.3,
      ease: "power2.in",
    }).to(
      overlay,
      {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      },
      "-=0.15"
    );
  }, [onClose]);

  // Click backdrop to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const gradientTextStyle = {
    background: "linear-gradient(90deg, #49c5b6, #ff9398, #8b5cf6, #49c5b6)",
    backgroundSize: "300% 100%",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent",
    backgroundClip: "text" as const,
    animation: "gradient-flow 4s ease-in-out infinite",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background:
          "linear-gradient(120deg, rgba(2, 6, 18, 0.72), rgba(5, 18, 26, 0.58) 42%, rgba(18, 7, 20, 0.68))",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        opacity: 0,
      }}
      onClick={handleBackdropClick}
    >
      <ProjectVisualBackdrop project={project} />
      <div
        ref={contentRef}
        className="relative z-10 w-full max-w-4xl px-4"
        style={{
          opacity: 0,
        }}
      >
        <FluidGlassPanel
          color={project.scene === "chart" ? "#ff6b6b" : "#49c5b6"}
          intensity={18}
          variant="detail"
          className="max-h-[85vh] w-full p-7 shadow-2xl md:p-10"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(73, 197, 182, 0.3) transparent",
          }}
        >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="cursor-target absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-400 transition-colors duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Category & Year badges */}
        <div className="mb-6 flex items-center gap-3">
          <span className="cursor-target rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
            {project.year}
          </span>
          <span
            className="cursor-target rounded-full px-3 py-1 text-xs"
            style={{
              background:
                "linear-gradient(135deg, rgba(73, 197, 182, 0.2), rgba(139, 92, 246, 0.2))",
              color: "rgba(73, 197, 182, 0.9)",
            }}
          >
            {project.category === "ai-product"
              ? "AI 产品"
              : project.category === "automation"
                ? "自动化工具"
                : project.category === "finance"
                  ? "金融量化"
                  : "创意工具"}
          </span>
        </div>

        {/* Project name */}
        <h2 className="iridescent-text mb-4 text-4xl font-bold" style={gradientTextStyle}>
          {project.name}
        </h2>

        {/* Subtitle */}
        <p className="mb-8 text-lg text-gray-400">{project.subtitle}</p>

        {/* Description */}
        <div className="mb-8 space-y-4">
          <p className="leading-relaxed text-gray-300">{project.description}</p>
        </div>

        {/* Tech stack */}
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="cursor-target rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors duration-200 hover:border-white/20 hover:bg-white/10"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-10">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="cursor-target rounded-full px-3 py-1 text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(73, 197, 182, 0.15), rgba(139, 92, 246, 0.15))",
                  color: "rgba(73, 197, 182, 0.9)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        {(project.githubUrl || project.demoUrl) && (
          <div className="flex flex-wrap gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-target group/btn relative inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(73, 197, 182, 0.3)",
                }}
              >
                <svg
                  className="h-5 w-5 text-gray-400 transition-colors group-hover/btn:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
                <span
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
                  style={{
                    boxShadow:
                      "0 0 20px rgba(73, 197, 182, 0.15), inset 0 0 20px rgba(73, 197, 182, 0.05)",
                  }}
                />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-target group/btn relative inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(73, 197, 182, 0.15), rgba(139, 92, 246, 0.15))",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                <svg
                  className="h-5 w-5 text-gray-400 transition-colors group-hover/btn:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Demo
                <span
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
                  style={{
                    boxShadow:
                      "0 0 20px rgba(139, 92, 246, 0.15), inset 0 0 20px rgba(139, 92, 246, 0.05)",
                  }}
                />
              </a>
            )}
          </div>
        )}
        </FluidGlassPanel>
      </div>
    </div>
  );
}
