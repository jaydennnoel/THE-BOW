import { site } from "@/data/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The OPEN sign hanging in the window, with the hours beside it.
 *
 * It's built as the object it is, not as styled type: a black backing
 * board on two chains, a loop of tube around the edge, OPEN bent out of
 * red glass, and the hours below it in plain white vinyl. Nothing else on
 * the site glows — The Bow is black and white, and this is the one piece
 * of coloured glass in the room.
 *
 * The letters are stroked paths rather than a font, so each one reads as a
 * continuous run of tube with rounded ends. The bloom is stacked strokes:
 * a CSS filter is clipped to the element's box and leaves a visible
 * rectangle where the glow is cut off.
 */

/** OPEN, bent out of four lengths of glass. */
function OpenTubes() {
  return (
    <>
      {/* O */}
      <rect x="10" y="10" width="46" height="64" rx="23" />
      {/* P — stem, then the bowl doubling back on itself */}
      <path d="M76 74V10h16a17 17 0 0 1 0 34H76" />
      {/* E */}
      <path d="M164 10h-32v64h32M132 42h26" />
      {/* N */}
      <path d="M184 74V10l40 64V10" />
    </>
  );
}

export function OpenSign({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const red = "#ff2f1c";

  /** One pass of the tube, drawn at a given width and opacity. */
  const pass = (w: number, stroke: string, opacity?: number) => (
    <g
      stroke={stroke}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
    >
      <OpenTubes />
    </g>
  );

  return (
    <div className={`relative isolate inline-block ${className}`}>
      {/* the light the sign throws back onto the wall */}
      <div
        aria-hidden="true"
        className="tube-cast pointer-events-none absolute -inset-10 -z-10"
        style={{
          background:
            "radial-gradient(52% 46% at 50% 34%,rgba(255,47,28,.55),transparent 72%)," +
            "radial-gradient(70% 64% at 50% 52%,rgba(207,234,255,.2),transparent 74%)",
        }}
      />

      {/* two lengths of chain up into the ceiling, flush to the board */}
      <div aria-hidden="true" className="mx-auto -mb-px flex w-[58%] justify-between">
        {[0, 1].map((i) => (
          <svg
            key={i}
            viewBox="0 0 8 56"
            preserveAspectRatio="none"
            className="h-[clamp(1.75rem,4vw,3rem)] w-[7px]"
            fill="none"
            stroke="rgba(244,241,234,.42)"
            strokeWidth="1.5"
          >
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <ellipse key={n} cx="4" cy={4 + n * 8} rx="2.6" ry="4.4" />
            ))}
          </svg>
        ))}
      </div>

      <div
        className="relative rounded-[6px] border border-hair-soft px-[clamp(1.1rem,3vw,2rem)] py-[clamp(1.1rem,2.6vw,1.8rem)] shadow-lift"
        style={{
          background: "linear-gradient(180deg,#121214,#070706 55%,#0b0b0c)",
          ["--tube" as string]: red,
        }}
      >
        {/* the border loop, inset from the board edge like a real sign */}
        <span
          aria-hidden="true"
          className={`tube-loop pointer-events-none absolute inset-[7px] rounded-[3px] ${
            reduced ? "" : "animate-hum"
          }`}
          style={{ ["--tube" as string]: "#cfeaff" }}
        />

        <div className="relative grid justify-items-center gap-[clamp(.85rem,2vw,1.35rem)] px-[clamp(.5rem,2vw,1.5rem)]">
          <svg
            viewBox="-14 -14 262 112"
            className={`w-[clamp(11rem,26vw,17rem)] ${reduced ? "" : "animate-flicker"}`}
            fill="none"
            role="img"
            aria-label="Neon sign reading Open"
          >
            {/* the unlit glass, so the letters keep their weight */}
            {pass(13, "rgba(0,0,0,.85)")}
            {pass(20, red, 0.14)}
            {pass(12, red, 0.4)}
            {pass(7, red, 0.9)}
            {pass(2.6, "#fff6f2")}
          </svg>

          <span
            aria-hidden="true"
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(244,241,234,.28),transparent)",
            }}
          />

          {/* hours, in plain white vinyl — no glow, just legible */}
          <div className="grid w-full gap-1.5">
            <p className="text-center font-mono text-[.6rem] uppercase leading-none tracking-[.32em] text-cream-faint">
              Hours
            </p>
            <dl className="m-0 grid gap-1 font-mono text-[clamp(.66rem,.6rem+.24vw,.8rem)] uppercase leading-relaxed tracking-[.1em]">
              {site.hours.map((h) => (
                <div key={h.days} className="flex items-baseline justify-between gap-4">
                  <dt className="text-cream-dim">{h.days}</dt>
                  <dd className="m-0 whitespace-nowrap text-cream">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
