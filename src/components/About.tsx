import { about } from "@/data/site";
import { Lead } from "./ui/Lead";
import { Reveal } from "./ui/Reveal";
import { SectionHead } from "./ui/SectionHead";

export function About() {
  return (
    <section
      id="about"
      className="relative isolate overflow-hidden py-section"
      style={{
        background:
          "radial-gradient(60% 50% at 88% 18%,rgba(200,150,47,.16),transparent 62%)," +
          "linear-gradient(180deg,#0b0a08,#121110)",
      }}
    >
      <div className="shell relative">
        <SectionHead
          eyebrow="The place"
          title={
            <>
              More than
              <br />a bar.
            </>
          }
          aside={
            <Lead>
              Dinner with friends, a beer while the game's on, and a table in the back that stays busy until close. The
              Bow is one room that does all three without asking you to choose.
            </Lead>
          }
        />

        <div className="grid gap-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <Reveal className="relative">
            <div className="group relative overflow-hidden rounded-edge bg-char">
              <img
                src="/images/tables.webp"
                alt="Pool tables lit by low hanging lamps above a black and white checkerboard floor inside The Bow."
                width={887}
                height={1108}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] h-auto w-full object-cover brightness-95 saturate-[1.3] transition-[transform,filter] duration-[1200ms] ease-cue group-hover:scale-[1.035] group-hover:brightness-110 group-hover:saturate-150"
              />
            </div>
            <div className="relative mt-2 w-full overflow-hidden rounded-edge border-0 sm:absolute sm:-bottom-[8%] sm:-right-[6%] sm:mt-0 sm:w-[min(46%,260px)] sm:border-[6px] sm:border-ink-2 sm:shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)]">
              <img
                src="/images/sign.webp"
                alt="The Bow storefront sign reading burgers, brews, billiards above the entrance."
                width={542}
                height={542}
                loading="lazy"
                decoding="async"
                className="aspect-video h-auto w-full object-cover brightness-100 saturate-[1.35] sm:aspect-square"
              />
            </div>
          </Reveal>

          <Reveal delay={2} className="grid gap-6">
            <p>
              The room is simple on purpose: checkerboard floors, wood paneling, low light over the felt. Grab a booth
              and order food, pull up to the bar, or put your name on a table and play until someone finally beats you.
            </p>
            <p>No dress code, no velvet rope, no reservation to lose. Just a good room to spend a few hours in.</p>

            <ul className="mt-1.5 grid border-t border-hair">
              {about.map((row) => (
                <li key={row.n} className="grid grid-cols-[auto_1fr] items-baseline gap-5 border-b border-hair py-[1.15rem]">
                  <b className="font-mono text-[.68rem] font-normal leading-none tracking-[.14em] text-brass">{row.n}</b>
                  <span className="text-[.98rem] text-cream-dim">
                    <strong className="mb-1 block font-display text-[1.15rem] font-bold uppercase leading-tight tracking-[.02em] text-cream">
                      {row.title}
                    </strong>
                    {row.body}
                  </span>
                </li>
              ))}
            </ul>

            <div>
              <a className="linkline" href="#pool">
                See the tables <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
