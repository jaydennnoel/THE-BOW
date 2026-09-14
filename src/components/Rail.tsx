/** The lettering painted on the front window, scrolling past as you arrive. */
const WORDS = [
  { text: "Burgers", tone: "text-diner-ink" },
  { text: "Brews", tone: "text-diner-red" },
  { text: "Billiards", tone: "text-diner-ink" },
  { text: "Open late", tone: "text-diner-teal" },
];

export function Rail() {
  // four identical runs, so the loop has no seam
  const run = [...WORDS, ...WORDS, ...WORDS, ...WORDS];

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="chrome h-[3px] w-full opacity-80" />

      <div className="formica relative py-[1.15rem]">
        <div aria-hidden="true" className="marquee">
          {run.map((w, i) => (
            <span
              key={`${w.text}-${i}`}
              className={`flex flex-none items-center gap-[clamp(1.5rem,4vw,3.5rem)] font-display text-[clamp(1.1rem,.9rem+.8vw,1.6rem)] font-extrabold uppercase leading-none tracking-[.14em] ${w.tone}`}
            >
              {w.text}
              <i
                className="h-1.5 w-1.5 flex-none rotate-45 bg-current opacity-55"
                style={{ borderRadius: "1px" }}
              />
            </span>
          ))}
        </div>
        {/* the lettering runs off the edge of the glass rather than stopping */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg,#f1ebdd 0%,transparent 12%,transparent 88%,#f1ebdd 100%)",
          }}
        />
      </div>

      <div aria-hidden="true" className="chrome h-[3px] w-full opacity-80" />
      <span className="sr-only">Burgers, brews, billiards — open late.</span>
    </div>
  );
}
