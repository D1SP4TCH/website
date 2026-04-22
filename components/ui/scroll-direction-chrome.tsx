"use client";

import { useEffect } from "react";

interface ScrollDirectionChromeProps {
  /** Pixels you must scroll past the top before fading kicks in. */
  threshold?: number;
  /** Pixels of delta required before flipping direction (debounces jitter). */
  delta?: number;
}

/**
 * Mounts a scroll-direction watcher that toggles
 *   body[data-hide-top-chrome="true"]   when scrolling DOWN past the threshold
 *   removes the attribute               when scrolling UP, or near the top
 *
 * Any global element tagged with `data-top-chrome` will fade out via the
 * matching CSS rule in globals.css. Cleans up the attribute on unmount so
 * other pages always start with the chrome visible.
 */
export function ScrollDirectionChrome({
  threshold = 80,
  delta = 6,
}: ScrollDirectionChromeProps = {}) {
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const diff = y - lastY;

      if (Math.abs(diff) < delta) {
        ticking = false;
        return;
      }

      if (y < threshold) {
        document.body.removeAttribute("data-hide-top-chrome");
      } else if (diff > 0) {
        document.body.setAttribute("data-hide-top-chrome", "true");
      } else {
        document.body.removeAttribute("data-hide-top-chrome");
      }

      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.removeAttribute("data-hide-top-chrome");
    };
  }, [threshold, delta]);

  return null;
}
