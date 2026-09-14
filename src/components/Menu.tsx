import { useRef, useState } from "react";
import { menu } from "@/data/site";
import { Lead } from "./ui/Lead";
import { Reveal } from "./ui/Reveal";
import { SectionHead } from "./ui/SectionHead";
import { Tag } from "./ui/Tag";

export function Menu() {
  const [active, setActive] = useState(menu[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = menu.findIndex((c) => c.id === active);
    let next: string | null = null;
    if (e.key === "ArrowRight") next = menu[(i + 1) % menu.length].id;
    if (e.key === "ArrowLeft") next = menu[(i - 1 + menu.length) % menu.length].id;
    if (e.key === "Home") next = menu[0].id;
    if (e.key === "End") next = menu[menu.length - 1].id;
    if (!next) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const current = menu.find((c) => c.id === active) ?? menu[0];
  const half = Math.ceil(current.items.length / 2);
  const columns = [current.items.slice(0, half), current.items.slice(half)];

  return (
    <section
      id="menu"
      className="relative isolate overflow-hidden py-section"
      style={{
        background:
          "radial-gradient(55% 45% at 12% 10%,rgba(176,145,63,.08),transparent 62%)," +
          "radial-gradient(50% 45% at 90% 85%,rgba(140,122,92,.07),transparent 62%),#111110",
      }}
    >
      <div className="shell relative">
        <SectionHead
          eyebrow="Kitchen"
          title={
            <>
              Food worth
              <br />
              sitting down for.
            </>
          }
          aside={
            <div className="grid justify-items-start gap-5">
              <Lead>Bar food done properly. Everything's made to order, so it comes out hot and it takes a minute.</Lead>
              <Tag>Placeholder menu — swap in real items &amp; pricing</Tag>
            </div>
          }
        />

        <Reveal>
          <div role="tablist" aria-label="Menu categories" onKeyDown={onKeyDown} className="mb-10 flex flex-wrap gap-1.5 border-b border-hair pb-3.5">
            {menu.map((cat) => {
              const on = cat.id === active;
              return (
                <button
                  key={cat.id}
                  ref={(el) => { tabRefs.current[cat.id] = el; }}
                  role="tab"
                  id={`tab-${cat.id}`}
                  aria-controls={`panel-${cat.id}`}
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(cat.id)}
                  className={`rounded-edge border border-transparent px-4 py-2.5 font-mono text-[.72rem] font-medium uppercase leading-none tracking-[.16em] transition-colors ${
                    on ? "bg-cream text-ink shadow-inset" : "text-cream-faint hover:text-cream"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div
            key={current.id}
            role="tabpanel"
            id={`panel-${current.id}`}
            aria-labelledby={`tab-${current.id}`}
            className="grid animate-fadeUp gap-x-[clamp(2rem,5vw,5rem)] md:grid-cols-2"
          >
            {columns.map((col, ci) => (
              <div key={ci}>
                {col.map((item) => (
                  <div key={item.name} className="grid gap-1.5 border-b border-hair-soft py-5 transition-[padding] duration-[350ms] ease-cue hover:pl-2.5">
                    <div className="flex items-baseline gap-3.5">
                      <span className="flex-none font-display text-[1.3rem] font-bold uppercase leading-none tracking-[.015em]">
                        {item.name}
                        {item.badge && (
                          <span className="ml-2 rounded-edge border border-bottle-lit/60 px-1.5 py-1 align-middle font-mono text-[.58rem] font-medium uppercase tracking-[.14em] text-bottle-lit">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <span aria-hidden="true" className="leader" />
                      <span className="flex-none font-mono text-[.72rem] tracking-[.1em] text-brass">$—</span>
                    </div>
                    <p className="max-w-[46ch] text-[.95rem] text-cream-dim">{item.desc}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-11 flex flex-wrap items-center justify-between gap-5 border-t border-hair pt-7">
          <p className="font-mono text-[.72rem] leading-relaxed text-cream-faint">
            Menu items shown are placeholders. Allergies? Tell your server.
          </p>
          {/* TODO: point at the real menu page or PDF */}
          <a className="btn" href="#" data-placeholder-link="full-menu">
            View full menu
          </a>
        </Reveal>
      </div>
    </section>
  );
}
