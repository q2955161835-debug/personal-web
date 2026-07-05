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
      const viewportAnchor = window.innerHeight * 0.42;
      let nextActive = activeHref;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const link of NAV_LINKS) {
        const section = document.querySelector(link.href);
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) continue;
        const distance = Math.abs(rect.top - viewportAnchor);
        if (distance < closestDistance) {
          closestDistance = distance;
          nextActive = link.href;
        }
      }

      if (nextActive !== activeHref) {
        setActiveHref(nextActive);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeHref]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed left-4 right-4 top-5 z-50 px-2 py-3 transition-all duration-500 sm:left-auto sm:right-8 sm:px-0 ${
        visible
          ? "opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <ul className="flex items-center justify-center gap-4 sm:gap-8">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className="cursor-target group relative pb-2 text-xs font-medium transition-colors duration-200 sm:text-sm"
              style={{
                color: activeHref === link.href ? "rgba(180,255,246,0.98)" : "rgba(255,255,255,0.62)",
                textShadow: activeHref === link.href ? "0 0 14px rgba(73,197,182,0.38)" : "none",
              }}
            >
              {link.label}
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-300 group-hover:scale-x-100"
                style={{
                  transform: activeHref === link.href ? "scaleX(1)" : "scaleX(0)",
                  background: activeHref === link.href
                    ? "linear-gradient(90deg, #49c5b6, #ff9398)"
                    : "rgba(255,255,255,0.55)",
                  boxShadow: activeHref === link.href ? "0 0 12px rgba(73,197,182,0.55)" : "none",
                }}
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
