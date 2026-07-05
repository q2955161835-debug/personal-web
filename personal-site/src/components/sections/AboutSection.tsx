"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "@/data/profile";
import StatCounter from "@/components/ui/StatCounter";
import SkillGrid from "@/components/ui/SkillGrid";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 30%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen w-full"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-16">
        <div className="w-full grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Left Column - Bio & Stats */}
        <div className="flex flex-col justify-center lg:pl-8">
          <h2
            className="mb-8 text-3xl font-bold"
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
            About Me
          </h2>

          <div className="space-y-5 text-gray-300 leading-relaxed text-base">
            {profile.bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Stat Counters */}
          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <StatCounter value={93} label="数据分析项目" suffix="+" />
            <StatCounter value={619} label="过程与交付文件" suffix="" />
            <StatCounter value={300} label="万行代码" suffix="+" />
            <StatCounter value={60} label="历史 Token 消耗" suffix="亿+" />
          </div>
        </div>

        {/* Right Column - Skills */}
        <div className="flex flex-col justify-center lg:pr-8">
          <SkillGrid />
        </div>
      </div>
      </div>
    </section>
  );
}
