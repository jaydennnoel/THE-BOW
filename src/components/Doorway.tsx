import { Reveal } from "./ui/Reveal";

/**
 * The walk from the front room to the back.
 *
 * This is the hinge of the page. The copy sits up in the light, on the
 * diner's side of the threshold; below it the tile floor runs away under a
 * doorway with the back room's light spilling out. Everything above this
 * section is front of house, everything below it is the pool room.
 */
export function Doorway() {
  return (
    <section
      aria-labelledby="doorway-heading"
      className="relative isolate overflow-hidden"
      style={{ background: "linear-gradient(180deg,#e3d2ae 0%,#c9b48c 22%,#5a3a24 52%,#1b1410 78%,#0a0a09 100%)" }}
    >
      {/* still in the diner here, so the type is dark on the light end */}
      <div className="room-front shell relative z-[2] grid justify-items-center gap-5 pb-[clamp(2rem,5vw,3.5rem)] pt-[clamp(4rem,9vw,7rem)] text-center">
        <Reveal>
          <p className="flex items-center gap-3.5 font-mono text-[.7rem] uppercase leading-none tracking-[.24em] text-room-accent">
            <span aria-hidden="true" className="h-px w-9 bg-room-accent opacity-80" />
            Keep going
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 id="doorway-heading" className="display max-w-[15ch] text-h2 text-room-fg">
            Out back it&rsquo;s a <span className="text-diner-red">different bar.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="max-w-[46ch] text-[clamp(1rem,.96rem+.3vw,1.18rem)] text-room-dim">
            Through the doorway the lights drop, the felt starts, and the jukebox is whatever the
            room just paid for.
          </p>
        </Reveal>
      </div>

      {/* the threshold */}
      <div className="relative h-[clamp(15rem,30vw,24rem)]">
        {/* the floor, running away from you */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 top-[22%] overflow-hidden"
          style={{ perspective: "300px", perspectiveOrigin: "50% 0%" }}
        >
          {/*
            The floor is masked rather than painted over. Laying an opaque
            band across the top of it hid the plane's edge but put a hard
            black line against the lit wall above; fading the tiles out at
            the horizon lets the floor come up out of the gloom instead.
          */}
          <div
            className="tile absolute inset-x-[-70%] bottom-[-55%] top-0 opacity-[.19]"
            style={{
              transform: "rotateX(76deg)",
              transformOrigin: "50% 0%",
              maskImage: "linear-gradient(180deg,transparent 0%,#000 26%,#000 74%,transparent 96%)",
              WebkitMaskImage:
                "linear-gradient(180deg,transparent 0%,#000 26%,#000 74%,transparent 96%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg,transparent 0%,rgba(10,10,9,.18) 46%," +
                "rgba(10,10,9,.7) 86%,#0a0a09 100%)",
            }}
          />
        </div>

        {/* the door, with the back room lit behind it */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 h-[86%] w-[min(20rem,46vw)] -translate-x-1/2"
        >
          <div
            className="absolute inset-0 rounded-t-[48%]"
            style={{
              background: "linear-gradient(180deg,#0c0b0a 0%,#070706 58%,#040403 100%)",
              boxShadow: "0 0 0 5px rgba(28,25,20,.75), 0 30px 80px -18px rgba(0,0,0,.95)",
            }}
          />
          <div
            className="absolute inset-x-[10%] bottom-0 top-[26%] rounded-t-[46%]"
            style={{
              background:
                "radial-gradient(64% 54% at 50% 82%,rgba(47,158,85,.42),transparent 72%)," +
                "radial-gradient(46% 34% at 50% 99%,rgba(239,59,34,.2),transparent 70%)",
              filter: "blur(16px)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
