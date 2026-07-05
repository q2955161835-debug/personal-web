"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  skillsByCategory,
  type SkillCategory,
} from "@/data/skills";

gsap.registerPlugin(ScrollTrigger);

const categoryConfig: Record<
  SkillCategory,
  { label: string; borderColor: string; glowColor: string }
> = {
  dataAnalysis: {
    label: "Data Analysis",
    borderColor: "rgba(73, 197, 182, 0.5)",
    glowColor: "0 0 16px rgba(73, 197, 182, 0.5)",
  },
  aiProduct: {
    label: "AI Product",
    borderColor: "rgba(139, 92, 246, 0.5)",
    glowColor: "0 0 16px rgba(139, 92, 246, 0.5)",
  },
  statistics: {
    label: "Statistics",
    borderColor: "rgba(255, 147, 152, 0.5)",
    glowColor: "0 0 16px rgba(255, 147, 152, 0.5)",
  },
};

// Custom hover glow via data attribute, applied via inline style on hover
const categoryGlow: Record<SkillCategory, string> = {
  dataAnalysis: "rgba(73, 197, 182, 0.5)",
  aiProduct: "rgba(139, 92, 246, 0.5)",
  statistics: "rgba(255, 147, 152, 0.5)",
};

export default function SkillGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tags = gridRef.current?.querySelectorAll("[data-skill-tag]");
      if (!tags || tags.length === 0) return;

      gsap.fromTo(
        tags,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, []);

  const categoryOrder: SkillCategory[] = [
    "dataAnalysis",
    "aiProduct",
    "statistics",
  ];

  return (
    <div ref={gridRef} className="flex flex-col gap-10">
      {categoryOrder.map((category) => {
        const config = categoryConfig[category];
        const glow = categoryGlow[category];
        const skillList = skillsByCategory[category];

        return (
          <div key={category}>
            <h3
              className="mb-4 text-lg font-semibold"
              style={{
                background:
                  "linear-gradient(90deg, #49c5b6, #ff9398, #8b5cf6, #49c5b6)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-flow 4s ease-in-out infinite",
              }}
            >
              {config.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillList.map((skill) => (
                <span
                  key={skill.name}
                  data-skill-tag
                  className="rounded-full border px-3 py-1 text-sm text-white/80 transition-transform duration-200"
                  style={{ opacity: 0, borderColor: config.borderColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.08)";
                    e.currentTarget.style.boxShadow = `0 0 16px ${glow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
