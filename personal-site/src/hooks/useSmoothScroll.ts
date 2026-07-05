"use client";

import { useContext } from "react";
import { LenisContext } from "@/components/layout/SmoothScroll";

/**
 * Hook to access the Lenis smooth-scroll instance.
 * Must be used inside the <SmoothScroll> provider.
 *
 * Returns a `scrollTo` helper that proxies to lenis.scrollTo.
 */
export function useSmoothScroll() {
  const lenis = useContext(LenisContext);

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
      lerp?: number;
    },
  ) => {
    if (!lenis) {
      // Fallback when Lenis is not available (SSR or missing provider)
      const top =
        typeof target === "number"
          ? target
          : typeof target === "string"
            ? (document.querySelector(target) as HTMLElement)?.offsetTop ?? 0
            : target.offsetTop ?? 0;
      window.scrollTo({ top, behavior: options?.immediate ? "auto" : "smooth" });
      return;
    }

    lenis.scrollTo(target, options);
  };

  return { lenis, scrollTo };
}
