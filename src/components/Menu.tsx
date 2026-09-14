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
      className="room-front steel-wall relative isolate overflow-hidden py-section"
    >
      {/* trim at the top of the wall, tile along the bottom of it */}
      <div aria-hidden="true" className="trim absolute inset-x-0 top-0 h-[7px]" />
      <div aria-hidden="true" className="tile absolute inset-x-0 bottom-0 h-[clamp(1.25rem,2.4vw,2rem)] opacity-90" />
      <div aria-hidden="true" className="butcher absolute inset-x-0 bottom-[clamp(1.25rem,2.4vw,2rem)] h-[clamp(.5rem,1vw,.85rem)]" />
      {/* the bulbs hanging over the counter */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 34% at 26% -4%,rgba(224,165,74,.3),transparent 66%)," +
            "radial-gradient(48% 30% at 78% -2%,rgba(224,165,74,.2),transparent 66%)," +
            "linear-gradient(180deg,rgba(11,11,12,.3),rgba(11,11,12,.72))",
        }}
      />
      <div className="shell relative">
        <SectionHead
          eyebrow="The kitchen"
          title={
            <>
              Known for
              <br />
              <span className="text-amber">the burgers.</span>
            </>
          }
          aside={
            <div className="grid justify-items-start gap-5">
              <Lead>
                People come in for the burgers and stay for everything else. It's all made to order,
                so it comes out hot and it takes a minute. Grab any free table — we don't seat by
                reservation.
              </Lead>
              <Tag>Prices read off the board — check before launch</Tag>
            </div>
          }
        />

        <Reveal>
          <div role="tablist" aria-label="Menu categories" onKeyDown={onKeyDown} className="mb-10 flex flex-wrap gap-1.5 border-b-[3px] border-amber/70 pb-3.5">
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
                    on
                      ? "bg-amber text-ink"
                      : "text-room-faint hover:text-room-fg"
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
                  <div
                    key={item.name}
                    className="grid gap-1.5 border-b border-room-soft py-4 transition-[padding] duration-[350ms] ease-cue hover:pl-2.5"
                  >
                    <div className="flex items-baseline gap-3.5">
                      <span className="flex-none font-display text-[1.3rem] font-bold uppercase leading-none tracking-[.015em]">
                        {item.name}
                        {item.badge && (
                          <span className="ml-2 rounded-edge border border-room-accent px-1.5 py-1 align-middle font-mono text-[.58rem] font-medium uppercase tracking-[.14em] text-room-accent">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <span aria-hidden="true" className="leader" />
                      <span className="flex-none font-mono text-[.78rem] tracking-[.06em] text-room-accent">
                        {item.price ? `$${item.price}` : "—"}
                      </span>
                    </div>
                    {item.desc && <p className="max-w-[46ch] text-[.95rem] text-room-dim">{item.desc}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-11 flex flex-wrap items-center justify-between gap-5 border-t border-room-rule pt-7">
          <p className="font-mono text-[.72rem] leading-relaxed text-room-faint">
            Grill closes at 9:00. Allergies? Tell your server.
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
