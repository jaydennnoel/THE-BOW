import { pool, site } from "@/data/site";
import { Lead } from "./ui/Lead";
import { Eyebrow } from "./ui/Eyebrow";
import { Reveal } from "./ui/Reveal";

/** The whole booking flow, replaced: three steps and none of them is a form. */
const STEPS = [
  { n: "1", label: "Walk in", body: "No booking, no deposit, no confirmation email.", accent: "#b0913f" },
  { n: "2", label: "Name on the board", body: "Chalk it up by the rack. We call it when a table clears.", accent: "#a85f43" },
  { n: "3", label: "Rack 'em", body: "Play as long as you're winning. Put a song on while you wait.", accent: "#5c7a52" },
];

export function Pool() {
  return (
    <section
      id="pool"
      className="relative isolate overflow-hidden border-y border-hair-soft py-section"
      style={{
        background:
          "radial-gradient(75% 60% at 12% 15%,rgba(122,48,56,.1),transparent 62%)," +
          "radial-gradient(60% 55% at 88% 80%,rgba(140,122,92,.07),transparent 65%),#0a0a09",
      }}
    >
      <div aria-hidden="true" className="checker pointer-events-none absolute inset-0 opacity-40" />

      <div className="shell relative grid gap-[clamp(2.25rem,4.5vw,3.5rem)] lg:grid-cols-[.95fr_1.05fr] lg:items-start">
        <Reveal>
          <Eyebrow className="mb-6">The pool hall</Eyebrow>
          <h2 className="display mb-5 text-h2">
            No bookings.
            <br />
            <span className="text-cream">Just turn up.</span>
          </h2>
          <Lead>
            Tables everywhere, fresh felt and good light overhead. The TouchTunes runs the room and
            the board by the rack runs the tables — we don't hold them and we don't take reservations,
            same as it always has been.
          </Lead>

          <ul className="my-8 grid border-t border-hair">
            {pool.map((row) => (
              <li
                key={row.n}
                className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-4 border-b border-hair py-4 transition-[padding] duration-300 ease-cue hover:pl-2"
              >
                <span className="font-mono text-[.66rem] leading-none tracking-[.1em] text-brass">
                  {row.n}
                </span>
                <span>
                  <strong className="block font-display text-xl font-bold uppercase leading-tight tracking-[.02em]">
                    {row.title}
                  </strong>
                  <span className="text-[.93rem] text-cream-dim">{row.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2.5">
            <a className="btn btn" href="#events">
              League &amp; tournament nights
            </a>
            <a className="btn btn-ghost" href={site.contact.phoneHref}>
              Call the bar
            </a>
          </div>
        </Reveal>

        <Reveal delay={1} className="grid gap-[clamp(1rem,2vw,1.5rem)]">
          <div className="grid gap-px border border-hair-soft bg-hair-soft sm:grid-cols-3">
            {STEPS.map((s) => (
              <article
                key={s.n}
                className="panel group grid content-start gap-3 border-0 p-[clamp(1.35rem,2.2vw,1.9rem)] transition-colors duration-[450ms] ease-cue hover:bg-char"
                style={{ ["--edge" as string]: s.accent }}
              >
                <span
                  className="font-display text-[clamp(2.6rem,4vw,3.4rem)] font-black leading-[.8]"
                  style={{ color: s.accent, textShadow: `0 0 26px ${s.accent}66` }}
                >
                  {s.n}
                </span>
                <strong className="font-display text-[1.2rem] font-bold uppercase leading-tight tracking-[.02em]">
                  {s.label}
                </strong>
                <span className="text-[.9rem] text-cream-dim">{s.body}</span>
              </article>
            ))}
          </div>

          <figure className="group relative m-0 overflow-hidden rounded-edge bg-char shadow-lift">
            <img
              src="/images/hall.webp"
              alt="Rows of pool tables under low lamps in the back room at The Bow."
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] h-auto w-full object-cover grayscale sepia-[.35] brightness-[.82] contrast-[1.1] transition-[transform,filter] duration-[1200ms] ease-cue group-hover:scale-[1.04] group-hover:grayscale-0 group-hover:sepia-0 group-hover:brightness-95"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg,rgba(10,10,9,0) 40%,rgba(10,10,9,.88) 100%)," +
                  "radial-gradient(70% 60% at 50% 0%,rgba(176,145,63,.18),transparent 70%)",
              }}
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 px-[clamp(1rem,2vw,1.5rem)] pb-[clamp(1rem,2vw,1.4rem)] font-mono text-[.66rem] uppercase leading-none tracking-[.18em]">
              <span className="text-cream">The back room</span>
              <span className="text-cream">Table count to be confirmed</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
