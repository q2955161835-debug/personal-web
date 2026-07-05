"use client";

import { useState } from "react";

import { profile } from "@/data/profile";

const contactItems: ReadonlyArray<{ label: string; value: string; href?: string }> = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "GitHub", value: "q2955161835-debug", href: profile.github },
  { label: "微信", value: profile.wechat },
  { label: "所在地", value: profile.location },
];

export default function ContactSection() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 2600);
  };

  return (
    <section id="contact" className="relative z-10 min-h-screen overflow-hidden bg-black px-6 py-28 md:px-12">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(130deg,rgba(73,197,182,0.08),transparent_34%,rgba(139,92,246,0.08)_76%,transparent)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:86px_86px]" />

      <div className="relative z-10 mx-auto grid min-h-[70vh] max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-white/35">
            Contact
          </p>
          <h2 className="iridescent-text text-4xl font-bold leading-tight sm:text-5xl">
            让数据、AI 产品和工程交付进入同一个闭环。
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/58">
            适合交流 AI 产品开发、统计建模、自动化工具、量化研究和个人项目合作。页面表单为前端演示，正式沟通请使用 Email 或 GitHub。
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {contactItems.map((item) => {
              const itemClassName = item.label === "Email" ? "sm:col-span-2" : "";
              const content = (
                <div className="cursor-target rounded-lg border border-white/10 bg-white/[0.035] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-teal-300/45 hover:bg-white/[0.06]">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                  <p className="mt-2 break-words text-[13px] text-white/75 sm:text-sm">{item.value}</p>
                </div>
              );

              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={itemClassName}
                >
                  {content}
                </a>
              ) : (
                <div key={item.label} className={itemClassName}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="cursor-target rounded-lg border border-white/10 bg-black/45 p-6 shadow-2xl backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 md:p-8"
        >
          <div className="grid gap-5">
            <label className="grid gap-2 text-sm text-white/58">
              姓名
              <input
                name="name"
                required
                className="cursor-target rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-white outline-none transition-colors focus:border-teal-300/55"
                placeholder="你的名字"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/58">
              邮箱
              <input
                name="email"
                type="email"
                required
                className="cursor-target rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-white outline-none transition-colors focus:border-teal-300/55"
                placeholder="name@example.com"
              />
            </label>
            <label className="grid gap-2 text-sm text-white/58">
              消息
              <textarea
                name="message"
                required
                rows={6}
                className="cursor-target resize-none rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-white outline-none transition-colors focus:border-teal-300/55"
                placeholder="想聊的项目、问题或合作方向"
              />
            </label>
            <button
              type="submit"
              className="cursor-target rounded-lg border border-teal-300/40 bg-teal-300/10 px-5 py-3 text-sm font-semibold text-teal-50 transition-all duration-300 hover:border-teal-200/70 hover:bg-teal-300/20"
            >
              发送消息
            </button>
            {sent && (
              <p className="rounded-lg border border-teal-300/30 bg-teal-300/10 px-4 py-3 text-sm text-teal-100">
                消息已发送
              </p>
            )}
          </div>
        </form>
      </div>

      <footer className="relative z-10 mx-auto mt-16 flex max-w-6xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/35 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 范俊杰</span>
        <span>AI Product / Data Analysis / Creative Engineering</span>
      </footer>
    </section>
  );
}
