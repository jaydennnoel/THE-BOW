import type { ReactNode } from "react";
import { drinks } from "@/data/site";
import { Lead } from "./ui/Lead";
import { Reveal } from "./ui/Reveal";
import { SectionHead } from "./ui/SectionHead";
import { Tag } from "./ui/Tag";

const GLASSES: Record<string, ReactNode> = {
  cocktail: (
    <>
      <path d="M22 20h56L52 52v28" />
      <path d="M36 84h32" />
      <circle cx="66" cy="30" r="5" />
    </>
  ),
  beer: (
    <>
      <path d="M28 26h34v58H28z" />
      <path d="M62 38h12v22H62z" />
      <path d="M28 42h34" />
    </>
  ),
  wine: (
    <>
      <path d="M30 18h40c0 22-9 32-20 34-11-2-20-12-20-34Z" />
      <path d="M50 52v28M36 84h28" />
    </>
  ),
  spirit: (
    <>
      <path d="M30 34h40l-4 50H34z" />
      <path d="M42 34V16h16v18" />
    </>
  ),
  soda: (
    <>
      <path d="M30 30h40l-6 54H36z" />
      <path d="M52 30 68 12" />
      <path d="M30 44h40" />
    </>
  ),
};

export function Drinks() {
  return (
    <section
      id="drinks"
      className="py-section"
      style={{
        background:
          "radial-gradient(60% 50% at 85% 15%,rgba(224,165,74,.09),transparent 65%)," +
          "radial-gradient(55% 50% at 10% 80%,rgba(192,57,43,.12),transparent 65%)," +
          "linear-gradient(180deg,#0b0b0c,#121214)",
      }}
    >
      <div className="shell">
        <SectionHead
          eyebrow="The bar"
          title={
            <>
              Good drinks.
              <br />
              Better nights.
            </>
          }
          aside={<Lead>Cold beer, cocktails made the right way, and a bartender who'll remember what you had last time.</Lead>}
        />

        <Reveal delay={1}>
          <div className="grid gap-px border border-hair-soft bg-hair-soft sm:grid-cols-2 xl:grid-cols-5">
            {drinks.map((d) => (
              <article
                key={d.n}
                className="group relative grid min-h-[clamp(200px,26vw,300px)] content-start gap-3 overflow-hidden bg-ink-2 p-[clamp(1.5rem,2.4vw,2.1rem)] transition-colors duration-[450ms] ease-cue hover:bg-char"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[450ms] ease-cue group-hover:opacity-100"
                  style={{ background: `radial-gradient(80% 60% at 50% 100%, ${d.accent}2e, transparent 70%)` }}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 ease-cue group-hover:scale-x-100"
                  style={{ background: d.accent }}
                />
                <span className="font-mono text-[.66rem] leading-none tracking-[.16em] text-cream-faint">{d.n}</span>
                <h3
                  className="font-display text-[clamp(1.6rem,1.3rem+.9vw,2.2rem)] font-extrabold uppercase leading-[.92] tracking-[.01em] transition-colors duration-300"
                  style={{ color: d.accent }}
                >
                  {d.name}
                </h3>
                <p className="text-[.92rem] text-cream-dim">{d.body}</p>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke={d.accent}
                  strokeWidth="2.5"
                  className="absolute -bottom-[12%] -right-[10%] w-[58%] opacity-[.2] transition-[transform,opacity] duration-[600ms] ease-cue group-hover:-translate-y-1.5 group-hover:-rotate-[4deg] group-hover:opacity-[.4]"
                >
                  {GLASSES[d.glass]}
                </svg>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-11 flex flex-wrap items-center justify-between gap-5 border-t border-hair pt-7">
          <Tag>Placeholder categories — replace with your real drink list</Tag>
          {/* TODO: point at the real drink menu */}
          <a className="btn btn-ghost" href="#" data-placeholder-link="drink-menu">
            Explore the drink menu
          </a>
        </Reveal>
      </div>
    </section>
  );
}
