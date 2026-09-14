import { site } from "@/data/site";
import { Wordmark } from "./Header";
import { Socials } from "./Socials";

const EXPLORE = ["#menu", "#pool", "#drinks", "#events", "#about", "#contact"] as const;
const LABELS: Record<string, string> = {
  "#menu": "Menu",
  "#pool": "Pool hall",
  "#drinks": "Drinks",
  "#events": "Events",
  "#about": "About",
  "#contact": "Find us",
};

export function Footer() {
  return (
    <footer className="relative border-t border-hair-soft bg-ink-2 pt-[clamp(3rem,6vw,5rem)]">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-12">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-[34ch] text-[.95rem] text-cream-dim">
              Burgers, brews and billiards. Walk in Monday to Saturday — no bookings, ever.
            </p>
            <Socials className="mt-5" />
          </div>

          <div>
            <h4 className="mb-5 font-mono text-[.66rem] font-medium uppercase leading-none tracking-[.2em] text-cream-faint">
              Explore
            </h4>
            <nav aria-label="Footer" className="grid gap-3 text-[.95rem]">
              {EXPLORE.map((href) => (
                <a key={href} href={href} className="text-cream-dim transition-colors hover:text-cream">
                  {LABELS[href]}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="mb-5 font-mono text-[.66rem] font-medium uppercase leading-none tracking-[.2em] text-cream-faint">
              Visit
            </h4>
            <div className="grid gap-3 text-[.95rem]">
              <a href={site.contact.mapsUrl} target="_blank" rel="noopener" className="text-cream-dim transition-colors hover:text-cream">
                {site.contact.address1}
                <br />
                {site.contact.address2}
              </a>
              <a href={site.contact.phoneHref} className="text-cream-dim transition-colors hover:text-cream">
                {site.contact.phoneLabel}
              </a>
              <a href={site.contact.emailHref} className="text-cream-dim transition-colors hover:text-cream">
                {site.contact.emailLabel}
              </a>
              <span className="text-cream-faint">Mon – Sat · [open – close]</span>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(2.5rem,5vw,4rem)] flex flex-wrap items-center justify-between gap-4 border-t border-hair-soft py-6 font-mono text-[.68rem] leading-relaxed tracking-[.08em] text-cream-faint">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <nav aria-label="Legal" className="flex flex-wrap gap-5">
            {/* TODO: replace with real legal pages */}
            <a href="#" data-placeholder-link="privacy" className="hover:text-cream">Privacy policy</a>
            <a href="#" data-placeholder-link="terms" className="hover:text-cream">Terms</a>
            <a href="#" data-placeholder-link="accessibility" className="hover:text-cream">Accessibility</a>
          </nav>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="h-1.5"
        style={{ background: "linear-gradient(90deg,#7a3038,#b0913f 38%,#8c7a5c 62%,#7a3038)" }}
      />
    </footer>
  );
}
