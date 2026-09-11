# The Bow — website

Bar, restaurant and billiards hall. React + TypeScript + Tailwind, built with Vite.

```bash
npm install
npm run dev        # local dev server
npm run typecheck  # tsc --noEmit
npm run build      # production bundle to dist/
```

Deploy `dist/` to Netlify, Vercel, Cloudflare Pages or any static host. There is no
server component and nothing to configure — the site takes no bookings and posts
no forms anywhere.

---

## Before launch — replace these

Nothing below was invented. Every one of these is a deliberate placeholder.

| What | Where |
|---|---|
| Address, phone, email, hours | `src/data/site.ts` → `site.contact`, `site.hours` |
| Domain (canonical, OG, schema) | `index.html` — search `REPLACE-WITH-DOMAIN.com`, also `public/robots.txt`, `public/sitemap.xml` |
| Social profile URLs | `src/data/site.ts` → `site.socials` |
| Menu items **and all pricing** | `src/data/site.ts` → `menu` (prices render as `$—` until you add them) |
| Drink categories | `src/data/site.ts` → `drinks` |
| Event schedule | `src/data/site.ts` → `events` |
| Full-menu / drink-menu links | `Menu.tsx`, `Drinks.tsx` — marked `data-placeholder-link` |
| Privacy, Terms, Accessibility pages | `Footer.tsx` — marked `data-placeholder-link` |
| Schema.org business details | `index.html` — the `application/ld+json` block |
| Social share image | add `public/og-image.jpg` at 1200×630 |
| Google Maps embed | `Contact.tsx` — the block marked *MAP INTEGRATION POINT* |

Placeholder links announce themselves when clicked (see the effect in `App.tsx`).
Delete that effect once every `href` points somewhere real.

### No bookings

The Bow runs on walk-ins, and the site says so everywhere: there is no reservation
form, no booking provider, and no "hold a table" call to action. `Pool.tsx` and the
walk-in panel in `Contact.tsx` carry that message. If the business ever does start
taking reservations, those are the two places to change.

---

## How it's put together

```
src/
  components/     one file per section, plus ui/ primitives
  hooks/          reveal, reduced-motion, scroll, active-section
  lib/table.ts    the break: physics on the cloth
  lib/render.ts   the break: camera and canvas rendering
  data/site.ts    ALL copy and placeholders
  styles/         Tailwind entry + the bespoke component layer
```

Tailwind carries the design tokens (`tailwind.config.ts`) and does the layout work.
The palette is a dive bar that has been there a while — warm near-black, bone,
brass and oxblood, with green felt. The wordmark stays black and white. The one
loud thing is the `neon` group, and it belongs to the sign in the window and
nothing else.

### The hero

`Hero.tsx` runs a single continuous shot, framed the way break footage is shot:
the camera low and close over the cloth, the bed filling the frame, the far
cushion just under the top edge and the dark room above it.

1. the frame opens on a racked table
2. the cue ball arrives from outside the shot and breaks
3. nine balls and the cue run off the edges of the frame
4. the six that are left roll together into **T H E   B O W** and stop

`lib/table.ts` is the simulation — elastic ball-on-ball collisions, cloth
friction, cushion rebound, rolling spin — in a flat coordinate space where `x`
runs across the table and `z` runs away from the camera. `lib/render.ts` owns the
pinhole camera that projects that plane, so a ball's size on screen is set purely
by its depth. Fast balls are smeared back along their own path; balls beyond the
focus plane lose a little contrast to the air.

Two things the simulation does deliberately, both invisible:

- the six lettered balls never leave the bed, so a stray carom can't lose a letter
- once they are close to home, letter-on-letter contacts stop being resolved —
  two balls that have to swap sides otherwise jam and the name comes out misspelt

The performance contract, verified in-browser:

- the rAF loop **stops entirely** once the name settles (zero idle frames)
- it only wakes for pointer interaction, and pauses off-screen and when the tab hides
- device pixel ratio is capped at 2
- the wordmark is measured against the viewport and placed at the depth that fills
  it, so it reads the same on a phone as on a desktop
- phones stack `THE / BOW`, with `THE` set deeper so it lands above `BOW`
- the headline appears **with** the break, not after it, so copy never waits on motion
- `prefers-reduced-motion` draws the final frame and hides the replay control

### The neon sign

`NeonSign.tsx` is bent glass rather than glowing type: every tube is a stroke with
a dark unlit twin behind it, so the letters keep their weight when a tube drops
out. The bloom is stacked strokes, not a CSS `drop-shadow` — a filter is clipped
to the element's box and leaves a visible rectangle where the glow is cut off.
Two tubes flicker on separate cycles. Reduced motion leaves the sign lit and still.

### Accessibility

Skip link, visible focus rings, `aria-current` on the active nav item, roving
tabindex + arrow keys on the menu tabs, Escape closes the drawer, the canvas is
`aria-hidden` with a real `<h1>` behind it, the neon sign carries its text as a
label, and reduced motion is respected throughout. Accent colours are chosen to
clear WCAG AA against the panels they sit on.

## Dependencies

React, ReactDOM, Vite, Tailwind. That's it — no animation library. Scroll reveals
are IntersectionObserver + CSS transitions, and the break is canvas, so Framer
Motion would have added weight without doing anything the site needs.
