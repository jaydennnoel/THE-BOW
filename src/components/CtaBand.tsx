import { site } from "@/data/site";
import { NeonSign } from "./NeonSign";
import { Reveal } from "./ui/Reveal";

/** The window from the street: brick, a blind, and the sign doing the talking. */
export function CtaBand() {
  return (
    <section className="relative isolate overflow-hidden border-y border-hair-soft bg-ink">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            // courses of brick, going dark toward the edges of the frame
            "radial-gradient(90% 110% at 50% 40%,rgba(200,150,47,.09),transparent 68%)," +
            "repeating-linear-gradient(0deg,rgba(0,0,0,.42) 0 2px,transparent 2px 26px)," +
            "repeating-linear-gradient(90deg,rgba(0,0,0,.34) 0 2px,transparent 2px 56px)," +
            "linear-gradient(180deg,#1a1512,#100d0b 60%,#0b0a08)",
        }}
      />
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0 -z-10 opacity-60" />

      <div className="shell grid justify-items-center gap-[clamp(2rem,4vw,3rem)] py-[clamp(4rem,8vw,7rem)] text-center">
        <Reveal>
          <NeonSign />
        </Reveal>

        <Reveal delay={1}>
          <p className="max-w-[42ch] text-[clamp(1.02rem,.98rem+.3vw,1.2rem)] text-cream-dim">
            Grab a stool. Grab a cue. Stay until they turn the lights up.
          </p>
        </Reveal>

        <Reveal delay={2}>
          <div className="flex flex-wrap justify-center gap-2.5">
            <a className="btn" href="#menu">
              See the menu
            </a>
            <a className="btn btn-ghost" href={site.contact.phoneHref}>
              Call The Bow
            </a>
            <a className="btn btn-ghost" href={site.contact.mapsUrl} target="_blank" rel="noopener">
              Get directions
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
