import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

interface Props {
  children: ReactNode;
  /** Stagger index — 0–4, each step adds 90ms. */
  delay?: 0 | 1 | 2 | 3 | 4;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}

/** Scroll-triggered fade + rise. Reduced motion is handled globally in CSS. */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: Props) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={`transition-[opacity,transform] duration-[850ms] ease-cue ${
        shown ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay * 90}ms` }}
    >
      {children}
    </Tag>
  );
}
