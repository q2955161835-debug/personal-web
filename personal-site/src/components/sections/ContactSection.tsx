"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { profile } from "@/data/profile";
import AnimatedText from "@/components/ui/AnimatedText";

gsap.registerPlugin(ScrollTrigger);

const contactItems: ReadonlyArray<{ label: string; value: string; href?: string }> = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "GitHub", value: "q2955161835-debug", href: profile.github },
  { label: "微信", value: profile.wechat },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".section-transition-reveal",
        { autoAlpha: 0, filter: "blur(13px)" },
        {
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: "top 98%",
            end: "top 50%",
            scrub: 0.72,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 2600);
  };

  return (
    <section id="contact" ref={sectionRef} className="relative z-10 min-h-screen overflow-hidden bg-transparent px-6 py-24 md:px-12">
      <div className="contact-meteor-scene relative mx-auto flex min-h-[78vh] max-w-7xl items-center">
        <div className="section-transition-reveal contact-meteor-trail" aria-hidden="true" />
        <div className="section-transition-reveal contact-meteor cursor-target">
          <div className="meteor-surface-text">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/58">
              <AnimatedText text="Contact" staggerMs={10} />
            </p>
            <h2 className="iridescent-text mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              <AnimatedText text="让数据、AI 产品和工程交付进入同一个闭环。" staggerMs={12} />
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/68">
              <AnimatedText
                text="适合交流 AI 产品开发、统计建模、自动化工具、量化研究和个人项目合作。正式沟通请使用 Email 或 GitHub。"
                delay={0.08}
                duration={820}
                staggerMs={7}
              />
            </p>

            <div className="mt-9 grid max-w-2xl gap-4">
              {contactItems.map((item) => {
                const content = (
                  <>
                    <span className="text-[11px] uppercase tracking-[0.26em] text-white/38">
                      <AnimatedText text={item.label} staggerMs={10} />
                    </span>
                    <span className="break-words text-sm font-semibold text-white/82">
                      <AnimatedText text={item.value} delay={0.04} duration={720} staggerMs={6} />
                    </span>
                  </>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="cursor-target contact-meteor-link"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label} className="contact-meteor-link">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="section-transition-reveal contact-orbit-form pointer-events-auto">
          <p className="mb-7 text-xs font-semibold uppercase tracking-[0.3em] text-white/38">
            <AnimatedText text="Message" staggerMs={10} />
          </p>
          <label className="contact-line-field">
            <span>
              <AnimatedText text="姓名" staggerMs={10} />
            </span>
            <input name="name" required placeholder="你的名字" />
          </label>
          <label className="contact-line-field">
            <span>
              <AnimatedText text="邮箱" staggerMs={10} />
            </span>
            <input name="email" type="email" required placeholder="name@example.com" />
          </label>
          <label className="contact-line-field">
            <span>
              <AnimatedText text="消息" staggerMs={10} />
            </span>
            <textarea name="message" required rows={4} placeholder="想聊的项目、问题或合作方向" />
          </label>
          <button type="submit" className="cursor-target contact-submit">
            <AnimatedText text="发送消息" staggerMs={10} />
          </button>
          {sent && <p className="mt-5 text-sm font-semibold text-teal-100">消息已发送</p>}
        </form>
      </div>

      <footer className="section-transition-reveal relative z-10 mx-auto flex max-w-7xl flex-col gap-3 pt-6 text-sm text-white/34 sm:flex-row sm:items-center sm:justify-between">
        <span>
          <AnimatedText text="© 2026 FAN JUN JIE" staggerMs={8} />
        </span>
        <span>
          <AnimatedText text="AI Product / Data Analysis / Creative Engineering" delay={0.06} duration={720} staggerMs={6} />
        </span>
      </footer>
    </section>
  );
}
