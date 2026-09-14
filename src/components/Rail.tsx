/** The storefront sign, scrolling. Three words, in neon, on repeat. */
const WORDS = [
  { text: "Burgers", dim: false },
  { text: "Brews", dim: true },
  { text: "Billiards", dim: false },
  { text: "Walk-ins only", dim: true },
];

export function Rail() {
  // two identical runs, so the loop has no seam
  const run = [...WORDS, ...WORDS, ...WORDS, ...WORDS];

  return (
    <div
      className="relative overflow-hidden border-y border-hair-soft py-[1.1rem]"
      style={{
        background: "linear-gradient(90deg,#111110,#181817 50%,#111110)",
      }}
    >
      <div aria-hidden="true" className="marquee">
        {run.map((w, i) => (
          <span
            key={`${w.text}-${i}`}
            className={`flex flex-none items-center gap-[clamp(1.5rem,4vw,3.5rem)] font-display text-[clamp(1.1rem,.9rem+.8vw,1.6rem)] font-extrabold uppercase leading-none tracking-[.14em] ${
              w.dim ? "text-cream-faint" : "text-cream"
            }`}
          >
            {w.text}
            <i
              className="h-1.5 w-1.5 flex-none rotate-45 bg-current opacity-70"
              style={{ borderRadius: "1px" }}
            />
          </span>
        ))}
      </div>
      {/* the sign fades out at both ends rather than being cut off */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg,#111110 0%,transparent 12%,transparent 88%,#111110 100%)",
        }}
      />
      <span className="sr-only">Burgers, brews, billiards — walk-ins only.</span>
    </div>
  );
}
