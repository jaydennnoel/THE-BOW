import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The sign in the window.
 *
 * Bent glass rather than glowing type: every tube is drawn as a stroke with
 * a dark, unlit twin behind it, so the letters keep their weight when a
 * tube drops out. The OPEN tube and the cue-ball tube run on their own
 * flicker cycles, the way two transformers of different ages do.
 *
 * With reduced motion the sign is simply lit — no flicker, no hum.
 */
export function NeonSign({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const live = reduced ? "" : "animate-flicker";

  return (
    <div
      className={`relative isolate ${className}`}
      role="img"
      aria-label="Neon sign reading The Bow — open, pool, cold beer"
    >
      {/* the glow the sign throws back onto the wall behind it */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 ${reduced ? "" : "animate-hum"}`}
        style={{
          background:
            "radial-gradient(60% 70% at 50% 45%,rgba(255,77,141,.3),transparent 70%)," +
            "radial-gradient(50% 60% at 50% 78%,rgba(143,230,255,.2),transparent 72%)",
          filter: "blur(16px)",
        }}
      />

      <div className="grid justify-items-center gap-[clamp(.65rem,1.4vw,1.1rem)] px-4 py-[clamp(1.5rem,3vw,2.5rem)] text-center">
        <span
          className="neon font-mono text-[clamp(.62rem,.5rem+.4vw,.82rem)] uppercase leading-none tracking-[.42em]"
          style={{ ["--tube" as string]: "#8fe6ff" }}
        >
          Est. on the corner
        </span>

        <span
          className="neon font-display text-[clamp(3.2rem,1.4rem+7.4vw,7.5rem)] font-black uppercase leading-[.78] tracking-[.01em]"
          style={{ ["--tube" as string]: "#ff4d8d" }}
        >
          The Bow
        </span>

        {/* the cue ball, bent out of one length of tube */}
        <svg
          aria-hidden="true"
          viewBox="-22 -20 264 74"
          className={`w-[min(430px,84%)] ${live}`}
          fill="none"
          strokeLinecap="round"
          style={{ ["--tube" as string]: "#ffd9a8", animationDelay: "3.1s" }}
        >
          {/*
            The bloom is stacked strokes rather than a drop-shadow filter:
            a CSS filter is clipped to the element's box and leaves a visible
            rectangle where the glow is cut off.
          */}
          <g strokeWidth="6" stroke="rgba(0,0,0,.6)">
            <Tube />
          </g>
          <g strokeWidth="13" stroke="var(--tube)" opacity=".16">
            <Tube />
          </g>
          <g strokeWidth="7" stroke="var(--tube)" opacity=".4">
            <Tube />
          </g>
          <g strokeWidth="3.4" stroke="var(--tube)" opacity=".85">
            <Tube />
          </g>
          <g strokeWidth="1.6" stroke="#fffaf2">
            <Tube />
          </g>
        </svg>

        <span
          className={`neon font-display text-[clamp(1.5rem,.9rem+2.4vw,2.6rem)] font-extrabold uppercase leading-none tracking-[.18em] ${live}`}
          style={{ ["--tube" as string]: "#ff4d8d", animationDelay: "1.7s" }}
        >
          Open
        </span>

        <span
          className="neon font-mono text-[clamp(.66rem,.55rem+.4vw,.88rem)] uppercase leading-none tracking-[.3em]"
          style={{ ["--tube" as string]: "#8fe6ff" }}
        >
          Pool · Cold beer · No bookings
        </span>
      </div>
    </div>
  );
}

/** One length of glass: two rails and the cue ball bent into the middle. */
function Tube() {
  return (
    <>
      <path d="M8 17h58M154 17h58" />
      <circle cx="110" cy="17" r="12" />
      <path d="M104 12.5h12M104 21.5h12" />
    </>
  );
}
