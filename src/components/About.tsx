import { about } from "@/data/site";
import { Lead } from "./ui/Lead";
import { Reveal } from "./ui/Reveal";
import { SectionHead } from "./ui/SectionHead";

export function About() {
  return (
    <section id="about" className="room-front formica relative isolate overflow-hidden pb-[clamp(5rem,9vw,9rem)] pt-section">
      {/* the counter lights, pooling down the wall */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 38% at 50% -4%,rgba(255,238,196,.5),transparent 64%)," +
            "radial-gradient(46% 38% at 88% 78%,rgba(163,40,28,.1),transparent 68%)," +
            "radial-gradient(40% 34% at 6% 88%,rgba(23,96,92,.1),transparent 70%)",
        }}
      />
      <div aria-hidden="true" className="trim absolute inset-x-0 top-0 h-[9px]" />
      {/* the floor, showing under the booths */}
      <div aria-hidden="true" className="tile absolute inset-x-0 bottom-0 h-[clamp(1.5rem,3vw,2.5rem)] opacity-90" />
      <div aria-hidden="true" className="wainscot absolute inset-x-0 bottom-[clamp(1.5rem,3vw,2.5rem)] h-[clamp(.6rem,1.2vw,1rem)]" />
      <div className="shell relative">
        <SectionHead
          eyebrow="The place"
          title={
            <>
              <span className="text-diner-red">A diner up front.</span>
              <br />
              <span className="text-diner-teal">A bar out back.</span>
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
            <div className="relative mt-2 w-full overflow-hidden rounded-edge border-0 sm:absolute sm:-bottom-[8%] sm:-right-[6%] sm:mt-0 sm:w-[min(46%,260px)] sm:border-[6px] sm:border-diner-teal-lit sm:shadow-[0_24px_60px_-20px_rgba(0,0,0,.9)]">
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
              Out front it's an old diner and it has never pretended otherwise: a counter, booths along
              the window, tile underfoot, and a flat top that has been turning out the burgers people
              come here for.
            </p>
            <p>
              Head through the back and the light drops away. That half is a dive bar — tables
              everywhere, the jukebox going, and a board by the rack instead of a booking system.
            </p>

            <ul className="mt-1.5 grid border-t border-room-rule">
              {about.map((row, i) => (
                <li key={row.n} className="grid grid-cols-[auto_1fr] items-baseline gap-5 border-b border-room-rule py-[1.15rem]">
                  <b
                    className={`font-mono text-[.68rem] font-normal leading-none tracking-[.14em] ${
                      ["text-diner-red", "text-diner-teal", "text-diner-red"][i % 3]
                    }`}
                  >
                    {row.n}
                  </b>
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
