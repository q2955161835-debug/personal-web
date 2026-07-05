"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Data Analysis", href: "#data-analysis" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Navigation() {
  const [visible, setVisible] = useState(false);
  const [activeHref, setActiveHref] = useState("#about");

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.querySelector(link.href)).filter(
      (section): section is Element => section !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveHref(`#${visibleEntry.target.id}`);
        }
      },
      {
        rootMargin: "-36% 0px -46% 0px",
        threshold: [0.08, 0.2, 0.42],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed left-4 right-4 top-5 z-50 rounded-full border px-4 py-3 backdrop-blur-xl transition-all duration-500 sm:left-auto sm:right-6 sm:px-6 ${
        visible
          ? "border-white/10 bg-black/55 opacity-100 shadow-[0_0_40px_rgba(73,197,182,0.08)]"
          : "pointer-events-none border-white/5 bg-black/20 opacity-0"
      }`}
    >
      <ul className="flex items-center justify-center gap-3 sm:gap-7">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className="text-xs font-medium transition-colors duration-200 sm:text-sm"
              style={{
                color: activeHref === link.href ? "rgba(180,255,246,0.98)" : "rgba(255,255,255,0.62)",
                textShadow: activeHref === link.href ? "0 0 14px rgba(73,197,182,0.38)" : "none",
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
