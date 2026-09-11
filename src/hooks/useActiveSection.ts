import { useEffect, useState } from "react";

/** Highlights the nav link for whichever section owns the middle of the screen. */
export function useActiveSection(hrefs: readonly string[]): string {
  const [active, setActive] = useState(hrefs[0] ?? "");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(`#${en.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    hrefs.forEach((h) => {
      const el = document.querySelector(h);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [hrefs]);

  return active;
}
