"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { profile } from "@/data/profile";

const contactItems: ReadonlyArray<{ label: string; value: string; href?: string }> = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "GitHub", value: "q2955161835-debug", href: profile.github },
  { label: "微信", value: profile.wechat },
];

export default function ContactSection() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 2600);
  };

  return (
    <section id="contact" className="relative z-10 min-h-screen overflow-hidden bg-transparent px-6 py-24 md:px-12">
      <div className="contact-meteor-scene relative mx-auto flex min-h-[78vh] max-w-7xl items-center">
        <div className="contact-meteor-trail" aria-hidden="true" />
        <div className="contact-meteor cursor-target">
          <div className="meteor-surface-text">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/58">
              Contact
            </p>
            <h2 className="iridescent-text mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              让数据、AI 产品和工程交付进入同一个闭环。
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/68">
              适合交流 AI 产品开发、统计建模、自动化工具、量化研究和个人项目合作。正式沟通请使用 Email 或 GitHub。
            </p>

            <div className="mt-9 grid max-w-2xl gap-4">
              {contactItems.map((item) => {
                const content = (
                  <>
                    <span className="text-[11px] uppercase tracking-[0.26em] text-white/38">{item.label}</span>
                    <span className="break-words text-sm font-semibold text-white/82">{item.value}</span>
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

        <form onSubmit={handleSubmit} className="contact-orbit-form pointer-events-auto">
          <p className="mb-7 text-xs font-semibold uppercase tracking-[0.3em] text-white/38">
            Message
          </p>
          <label className="contact-line-field">
            <span>姓名</span>
            <input name="name" required placeholder="你的名字" />
          </label>
          <label className="contact-line-field">
            <span>邮箱</span>
            <input name="email" type="email" required placeholder="name@example.com" />
          </label>
          <label className="contact-line-field">
            <span>消息</span>
            <textarea name="message" required rows={4} placeholder="想聊的项目、问题或合作方向" />
          </label>
          <button type="submit" className="cursor-target contact-submit">
            发送消息
          </button>
          {sent && <p className="mt-5 text-sm font-semibold text-teal-100">消息已发送</p>}
        </form>
      </div>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-3 pt-6 text-sm text-white/34 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 FAN JUN JIE</span>
        <span>AI Product / Data Analysis / Creative Engineering</span>
      </footer>
    </section>
  );
}
