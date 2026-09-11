import { site } from "@/data/site";
import { Lead } from "./ui/Lead";
import { Reveal } from "./ui/Reveal";
import { SectionHead } from "./ui/SectionHead";
import { Socials } from "./Socials";
import { Tag } from "./ui/Tag";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-1 border-b border-hair py-[1.15rem] sm:grid-cols-[8.5rem_1fr] sm:gap-4">
      <dt className="font-mono text-[.66rem] uppercase leading-relaxed tracking-[.16em] text-cream-faint">
        {label}
      </dt>
      <dd className="m-0 text-base">{children}</dd>
    </div>
  );
}

export function Contact() {
  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden py-section"
      style={{
        background:
          "radial-gradient(60% 50% at 85% 12%,rgba(200,150,47,.14),transparent 65%)," +
          "radial-gradient(55% 45% at 10% 90%,rgba(125,32,41,.24),transparent 65%),#0b0a08",
      }}
    >
      <div className="shell relative">
        <SectionHead
          eyebrow="Find us"
          title={
            <>
              Come by.
              <br />
              <span className="text-brass">We're open.</span>
            </>
          }
          aside={
            <Lead>
              Call for anything time-sensitive — a big group landing at once, a question about
              tonight, or whether the kitchen's still on.
            </Lead>
          }
        />

        <div className="grid gap-[clamp(2.25rem,4vw,3.5rem)] lg:grid-cols-2">
          <Reveal>
            <dl className="grid border-t border-hair">
              <Row label="Address">
                <a
                  href={site.contact.mapsUrl}
                  target="_blank"
                  rel="noopener"
                  className="transition-colors hover:text-brass-lit"
                >
                  {site.contact.address1}
                  <br />
                  {site.contact.address2}
                </a>
              </Row>
              <Row label="Phone">
                <a href={site.contact.phoneHref} className="transition-colors hover:text-brass-lit">
                  {site.contact.phoneLabel}
                </a>
              </Row>
              <Row label="Email">
                <a href={site.contact.emailHref} className="transition-colors hover:text-brass-lit">
                  {site.contact.emailLabel}
                </a>
              </Row>
              <Row label="Hours">
                <div className="grid gap-1.5 text-[.95rem]">
                  {site.hours.map((h) => (
                    <div key={h.days} className="flex max-w-96 justify-between gap-4 text-cream-dim">
                      <b className="font-medium text-cream">{h.days}</b>
                      <span>{h.time}</span>
                    </div>
                  ))}
                </div>
              </Row>
              <Row label="Follow">
                <Socials />
                <p className="mt-3 font-mono text-[.72rem] leading-relaxed text-cream-faint">
                  Placeholder links — connect real profiles.
                </p>
              </Row>
            </dl>
          </Reveal>

          <Reveal delay={1} className="grid content-start gap-[clamp(1rem,2vw,1.5rem)]">
            {/* No booking, nothing to submit — the door is the whole system. */}
            <div
              className="panel grid gap-4 p-[clamp(1.6rem,3vw,2.4rem)]"
              style={{ ["--edge" as string]: "#e0ad42" }}
            >
              <span className="font-mono text-[.66rem] uppercase leading-none tracking-[.22em] text-brass">
                How it works
              </span>
              <h3 className="display text-[clamp(2rem,1.4rem+2.4vw,3.2rem)]">
                Walk in.
                <br />
                That's it.
              </h3>
              <p className="max-w-[42ch] text-[.97rem] text-cream-dim">
                We don't take table bookings or dinner reservations. Turn up, grab a seat or chalk
                your name on the board, and we'll sort you out from there.
              </p>
              <div className="mt-2 flex flex-wrap gap-2.5">
                <a className="btn btn-brass max-sm:w-full" href={site.contact.phoneHref}>
                  Call The Bow
                </a>
                <a
                  className="btn btn-ghost max-sm:w-full"
                  href={site.contact.mapsUrl}
                  target="_blank"
                  rel="noopener"
                >
                  Get directions
                </a>
              </div>
            </div>

            {/* MAP INTEGRATION POINT — drop a Google Maps iframe here once the address is set */}
            <div className="relative grid min-h-[280px] place-items-center gap-4 overflow-hidden rounded-edge border border-hair bg-gradient-to-b from-char to-ink-2 p-8 text-center">
              <div aria-hidden="true" className="checker absolute inset-0 opacity-50" />
              <div className="relative grid justify-items-center gap-4">
                <Tag>Map embed goes here</Tag>
                <p className="max-w-[34ch] font-mono text-[.72rem] leading-relaxed text-cream-faint">
                  Drop in a Google Maps iframe or a static map image once the address is set.
                </p>
                <a
                  className="btn btn-ghost btn-sm"
                  href={site.contact.mapsUrl}
                  target="_blank"
                  rel="noopener"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
