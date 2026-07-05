"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/types";

gsap.registerPlugin(ScrollTrigger);

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  index: number;
}

export default function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // ScrollTrigger entrance animation
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: index * 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, card);

    return () => ctx.revert();
  }, [index]);

  // 3D tilt on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = innerRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 800,
      duration: 0.4,
      ease: "power2.out",
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = innerRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      transformPerspective: 800,
      duration: 0.6,
      ease: "power3.out",
    });
  }, []);

  const gradientTextStyle = {
    background: "linear-gradient(90deg, #49c5b6, #ff9398, #8b5cf6, #49c5b6)",
    backgroundSize: "300% 100%",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent",
    backgroundClip: "text" as const,
    animation: "gradient-flow 4s ease-in-out infinite",
  };

  return (
    <div ref={cardRef} style={{ opacity: 0 }}>
      <div
        ref={innerRef}
        className="group relative cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-8 transition-shadow duration-500"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Hover glow border effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(73, 197, 182, 0.3), 0 0 30px rgba(73, 197, 182, 0.1), 0 0 60px rgba(139, 92, 246, 0.05)",
          }}
        />

        {/* Category badge */}
        <div className="mb-6 flex items-center justify-between">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
            {project.year}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
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
        <h3
          className="mb-3 text-2xl font-bold"
          style={gradientTextStyle}
        >
          {project.name}
        </h3>

        {/* Subtitle */}
        <p className="mb-6 text-sm text-gray-400 leading-relaxed">
          {project.subtitle}
        </p>

        {/* Tech stack pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-3 py-1 text-xs"
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

        {/* Arrow icon - right side */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <svg
            className="h-6 w-6 text-gray-500 transition-all duration-300 group-hover:text-white group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>

        {/* Bottom hover lift effect via box-shadow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-all duration-500 group-hover:opacity-100"
          style={{
            boxShadow:
              "0 -8px 40px rgba(73, 197, 182, 0.08), 0 8px 40px rgba(139, 92, 246, 0.06)",
          }}
        />
      </div>
    </div>
  );
}
