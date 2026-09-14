import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { useScrolled } from "@/hooks/useScrolled";
import { useActiveSection } from "@/hooks/useActiveSection";

const NAV_HREFS = site.nav.map((n) => n.href);

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a href="#home" aria-label="The Bow — home" className={`flex flex-none items-baseline gap-2 ${className}`}>
      <span className="font-display text-[.78rem] font-extrabold uppercase leading-none tracking-[.2em] text-cream-faint">
        The
      </span>
      <span className="font-display text-[1.85rem] font-black uppercase leading-[.8] tracking-[-.01em] text-cream">
        Bow
      </span>
    </a>
  );
}

export function Header() {
  const scrolled = useScrolled();
  const active = useActiveSection(NAV_HREFS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.locked = String(open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.dataset.locked = "false";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[90] flex h-header items-center border-b transition-[background,border-color,backdrop-filter] duration-[400ms] ease-cue ${
          scrolled ? "border-hair-soft bg-ink/[.86] backdrop-blur-md backdrop-saturate-150" : "border-transparent"
        }`}
      >
        <div className="shell flex items-center justify-between gap-6">
          <Wordmark />

          <nav aria-label="Primary" className="hidden items-center gap-8 xl:flex">
            {site.nav.map((item) => {
              const isActive = active === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`group relative py-1.5 font-mono text-[.72rem] uppercase leading-none tracking-[.15em] transition-colors ${
                    isActive ? "text-cream" : "text-cream-dim hover:text-cream"
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-0 left-0 h-[2px] bg-cream transition-[width] duration-[350ms] ease-cue group-hover:w-full ${
                      isActive ? "w-full" : "w-0"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a className="btn btn btn-sm hidden xl:inline-flex" href="#menu">
              See the menu
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="drawer"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="relative h-[46px] w-[46px] flex-none rounded-edge border border-hair xl:hidden"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="absolute left-[13px] h-[1.5px] w-5 bg-cream transition-[transform,opacity] duration-[400ms] ease-cue"
                  style={{
                    top: `${18 + i * 5}px`,
                    transform: open
                      ? i === 0
                        ? "translateY(5px) rotate(45deg)"
                        : i === 2
                          ? "translateY(-5px) rotate(-45deg)"
                          : "scaleX(.4)"
                      : undefined,
                    opacity: open && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </header>

      <div
        id="drawer"
        data-open={open}
        aria-hidden={!open}
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        className="drawer fixed inset-0 z-[80] flex flex-col justify-between bg-ink-2 px-gutter pb-8 pt-[calc(theme(spacing.header)+2rem)]"
      >
        <nav aria-label="Mobile" className="flex flex-col gap-0.5">
          {site.nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-baseline gap-4 border-b border-hair-soft py-1.5 font-display text-[clamp(2.4rem,13vw,3.5rem)] font-extrabold uppercase leading-tight transition-[opacity,transform,color] duration-[400ms] ease-cue active:text-cream"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "none" : "translateY(18px)",
                transitionDelay: open ? `${60 + i * 45}ms` : "0ms",
              }}
            >
              <i className="font-mono text-[.68rem] not-italic tracking-[.1em] text-cream">
                {String(i + 1).padStart(2, "0")}
              </i>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="grid gap-4 pt-8">
          <a className="btn btn w-full" href="#menu">
            See the menu
          </a>
          <div className="flex gap-3">
            <a className="btn btn-ghost w-full" href={site.contact.phoneHref}>
              Call
            </a>
            <a className="btn btn-ghost w-full" href={site.contact.mapsUrl} target="_blank" rel="noopener">
              Directions
            </a>
          </div>
          <p className="font-mono text-[.72rem] leading-relaxed text-cream-faint">
            {site.tagline} — walk in, Monday to Saturday
          </p>
        </div>
      </div>
    </>
  );
}

export { Wordmark };
