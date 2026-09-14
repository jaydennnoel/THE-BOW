import { about } from "@/data/site";
import { Lead } from "./ui/Lead";
import { Reveal } from "./ui/Reveal";
import { SectionHead } from "./ui/SectionHead";

export function About() {
  return (
    <section id="about" className="room-front formica relative isolate overflow-hidden py-section">
      {/* the counter lights, pooling down the wall */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 45% at 50% -6%,rgba(255,250,232,.85),transparent 62%)," +
            "radial-gradient(50% 40% at 88% 82%,rgba(168,51,46,.07),transparent 68%)",
        }}
      />
      <div className="shell relative">
        <SectionHead
          eyebrow="The place"
          title={
            <>
              A diner up front.
              <br />A bar out back.
            </>
          }
          aside={
            <Lead>
              Two rooms and one door between them. Come in for a burger at the counter, or keep walking
              and spend the night on the felt — nobody minds which.
            </Lead>
          }
        />

        <div className="grid gap-[clamp(2rem,4vw,3.5rem)] lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <Reveal className="relative">
            <div className="group relative overflow-hidden rounded-edge bg-diner-ink/10 shadow-lift">
              <img
                src="/images/window.webp"
                alt="The Bow's window lettering reading burgers, brews, billiards, with the street outside."
                width={887}
                height={1108}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] h-auto w-full object-cover sepia-[.45] saturate-[.8] contrast-[1.05] transition-[transform,filter] duration-[1200ms] ease-cue group-hover:scale-[1.035] group-hover:sepia-0 group-hover:saturate-100"
              />
            </div>
            <div className="relative mt-2 w-full overflow-hidden rounded-edge border-0 sm:absolute sm:-bottom-[8%] sm:-right-[6%] sm:mt-0 sm:w-[min(46%,260px)] sm:border-[6px] sm:border-diner-bone sm:shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)]">
              <img
                src="/images/sign.webp"
                alt="The Bow's exterior sign mounted on white brick above the entrance."
                width={542}
                height={542}
                loading="lazy"
                decoding="async"
                className="aspect-video h-auto w-full object-cover sepia-[.45] saturate-[.8] contrast-[1.05] sm:aspect-square"
              />
            </div>
          </Reveal>

          <Reveal delay={2} className="grid gap-6">
            <p>
              Out front it's an old diner and it has never pretended otherwise: a counter, booths along the
              window, tile underfoot and a kitchen that sends out burgers all day.
            </p>
            <p>
              Head through the back and the light drops away. That half is a dive bar — tables
              everywhere, the jukebox going, and a board by the rack instead of a booking system.
            </p>

            <ul className="mt-1.5 grid border-t border-room-rule">
              {about.map((row) => (
                <li key={row.n} className="grid grid-cols-[auto_1fr] items-baseline gap-5 border-b border-room-rule py-[1.15rem]">
                  <b className="font-mono text-[.68rem] font-normal leading-none tracking-[.14em] text-room-accent">{row.n}</b>
                  <span className="text-[.98rem] text-room-dim">
                    <strong className="mb-1 block font-display text-[1.15rem] font-bold uppercase leading-tight tracking-[.02em] text-room-fg">
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
