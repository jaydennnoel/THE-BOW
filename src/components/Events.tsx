import { events } from "@/data/site";
import { Lead } from "./ui/Lead";
import { Reveal } from "./ui/Reveal";
import { SectionHead } from "./ui/SectionHead";
import { Tag } from "./ui/Tag";

export function Events() {
  return (
    <section
      id="events"
      className="relative isolate overflow-hidden py-section"
      style={{
        background:
          "radial-gradient(65% 55% at 85% 8%,rgba(27,168,198,.08),transparent 62%)," +
          "radial-gradient(55% 50% at 8% 92%,rgba(192,57,43,.12),transparent 62%),#121214",
      }}
    >
      <div className="shell relative">
        <SectionHead
          eyebrow="What's on"
          title={
            <>
              Something
              <br />
              most nights.
            </>
          }
          aside={
            <div className="grid justify-items-start gap-5">
              <Lead>Tournaments, live music, trivia and every game worth watching. No tickets, no list — turn up and get stuck in.</Lead>
              <Tag>Sample schedule — replace with real dates</Tag>
            </div>
          }
        />

        <Reveal delay={1}>
          <div className="border-t border-hair">
            {events.map((ev) => (
              <article
                key={ev.name}
                className="group relative grid gap-y-2.5 border-b border-hair py-[clamp(1.4rem,2.4vw,2rem)] transition-[background,padding] duration-[400ms] ease-cue lg:grid-cols-[minmax(215px,.55fr)_minmax(0,1.35fr)_minmax(0,1.25fr)_auto] lg:items-center lg:gap-x-7 lg:hover:bg-char lg:hover:px-5"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 transition-transform duration-500 ease-cue group-hover:scale-y-100"
                  style={{ background: ev.accent }}
                />
                <div className="font-display text-[clamp(1.4rem,1.2rem+.6vw,1.75rem)] font-extrabold uppercase leading-[.95] tracking-[.01em]">
                  {ev.when}
                  <small className="mt-2 block font-mono text-[.64rem] font-normal leading-none tracking-[.16em] text-cyan">
                    {ev.cadence}
                  </small>
                </div>
                <h3 className="font-display text-[clamp(1.5rem,1.2rem+1vw,2.1rem)] font-bold uppercase leading-none tracking-[.015em]">
                  {ev.name}
                </h3>
                <p className="max-w-[44ch] text-[.94rem] text-cream-dim">{ev.desc}</p>
                <div className="justify-self-start max-sm:w-full">
                  <a className="btn btn-ghost btn-sm max-sm:w-full" href={ev.href}>
                    {ev.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
