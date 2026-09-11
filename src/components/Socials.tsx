import type { ReactNode } from "react";
import { site } from "@/data/site";

const ICONS: Record<string, ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" />
    </>
  ),
  facebook: <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5v4h3v7h4v-7h3l1-4h-4V7.5A1.5 1.5 0 0 1 13.5 6H16V3Z" />,
  tiktok: (
    <>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.6 2.6 2.3 4.2 5 4.4" />
    </>
  ),
};

export function Socials({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {site.socials.map((s) => (
        <a
          key={s.id}
          href={s.href}
          data-placeholder-link={s.id}
          aria-label={`${site.name} on ${s.label}`}
          className="grid h-[42px] w-[42px] place-items-center rounded-edge border border-hair transition-[background,color,border-color,transform] duration-300 ease-cue hover:-translate-y-0.5 hover:bg-cream hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            {ICONS[s.id]}
          </svg>
        </a>
      ))}
    </div>
  );
}
