/**
 * ─────────────────────────────────────────────────────────────
 *  THE BOW — single source of truth for site content.
 *
 *  The menu below is transcribed from a photograph of the board
 *  on the wall, prices included. Check it against the board
 *  before launch — it was read off a picture, and the board
 *  changes. Everything still in square brackets is a placeholder
 *  awaiting real information. Nothing here is invented as fact.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "The Bow",
  tagline: "Burgers | Brews | Billiards",
  /** Replace before launch — used for canonical, OG and schema URLs. */
  domain: "https://REPLACE-WITH-DOMAIN.com",

  contact: {
    address1: "[Street address]",
    address2: "[City, State ZIP]",
    /** tel: link target — digits only, e.g. "+18645551234" */
    phoneHref: "tel:+10000000000",
    phoneLabel: "[(000) 000-0000]",
    emailHref: "mailto:hello@example.com",
    emailLabel: "[hello@thebow.com]",
    mapsUrl: "https://maps.google.com/?q=The+Bow",
  },

  /**
   * The door says Monday–Saturday and the board says the grill closes at
   * nine. The opening time on the door decal isn't legible in the photo —
   * confirm it before launch.
   */
  hours: [
    { days: "Monday – Saturday", time: "[open] – 9:00" },
    { days: "Grill closes", time: "9:00" },
    { days: "Sunday", time: "Closed" },
  ],

  /** Off the board: 5–7pm, can beer 2.25, wine 3.40. */
  happyHour: { when: "Happy hour · 5 – 7pm", detail: "Can beer $2.25 · Wine $3.40" },

  socials: [
    { id: "instagram", label: "Instagram", href: "#" },
    { id: "facebook", label: "Facebook", href: "#" },
    { id: "tiktok", label: "TikTok", href: "#" },
  ],

  nav: [
    { href: "#home", label: "Home" },
    { href: "#menu", label: "Menu" },
    { href: "#pool", label: "Pool hall" },
    { href: "#drinks", label: "Drinks" },
    { href: "#events", label: "Events" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ],
} as const;

export const about = [
  { n: "01", title: "Eat", body: "The burgers are what people come for. Shareables for the table, and a kitchen that runs late." },
  { n: "02", title: "Drink", body: "Draft and bottled beer, house cocktails, wine, and something for whoever's driving." },
  { n: "03", title: "Play", body: "Tournament-grade tables, open play all week, plus leagues and tournament nights. Walk-ins only." },
] as const;

export interface MenuItem {
  name: string;
  /** As printed on the board. */
  price?: string;
  desc?: string;
  badge?: string;
}
export interface MenuCategory {
  id: string;
  label: string;
  items: MenuItem[];
}

/**
 * Transcribed from the board on the wall. No descriptions here on purpose —
 * the board doesn't carry any, and inventing them would put words in the
 * kitchen's mouth.
 */
export const menu: MenuCategory[] = [
  {
    id: "burgers",
    label: "Burgers & more",
    items: [
      { name: "Hamburger", price: "5.23", badge: "House" },
      { name: "Cheeseburger", price: "5.80" },
      { name: "Hamburger steak", price: "10.18" },
      { name: "Chicken fingers", price: "5.23" },
      { name: "Grilled chicken", price: "5.65" },
      { name: "Chicken salad sandwich", price: "4.40" },
      { name: "Wings", price: "9.08" },
      { name: "Hot dog", price: "2.59" },
      { name: "Corn dog", price: "2.37" },
      { name: "Ham sandwich", price: "3.85" },
      { name: "Baby club", price: "5.78" },
      { name: "BLT", price: "4.68" },
      { name: "Egg sandwich", price: "3.58" },
      { name: "Bacon & egg", price: "4.95" },
      { name: "Bologna", price: "3.59" },
      { name: "Bologna & egg", price: "4.24" },
      { name: "Grilled cheese", price: "3.04" },
      { name: "Fish & chips", price: "5.50" },
      { name: "Large salad", price: "8.53" },
    ],
  },
  {
    id: "appetizers",
    label: "Appetizers",
    items: [
      { name: "Fried pickles", price: "4.68" },
      { name: "Jalapeño poppers", price: "6.60" },
      { name: "Cheese sticks", price: "5.78" },
      { name: "Jalapeño corn nuggets", price: "3.58" },
    ],
  },
  {
    id: "sides",
    label: "Sides",
    items: [
      { name: "French fries", price: "2.04" },
      { name: "Onion rings", price: "2.64" },
      { name: "Tater tots", price: "2.27" },
      { name: "Half & half", price: "3.58", desc: "Fries and onion rings only." },
      { name: "Chili cheese fries", price: "5.78" },
      { name: "Chili cheese tots", price: "6.05" },
      { name: "Small salad", price: "3.58" },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    items: [
      { name: "Hamburger patty", price: "3.85" },
      { name: "Chili", price: "1.65" },
      { name: "Bacon", price: "1.38" },
      { name: "Egg", price: ".77" },
      { name: "Gravy", price: ".66" },
      { name: "Jalapeños", price: ".66" },
      { name: "Cole slaw", price: ".66" },
      { name: "Sauces", price: ".66" },
      { name: "Extra onions", price: ".66" },
      { name: "Cheese", price: ".55" },
      { name: "To-go fee", price: ".39" },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    items: [
      { name: "Cokes", price: "2.20" },
      { name: "Tea", price: "2.20" },
      { name: "Monster", price: "3.30" },
      { name: "Bottled water", price: "1.38" },
      { name: "Tap water or ice", price: ".39" },
    ],
  },
  {
    id: "beer",
    label: "Beer & wine",
    items: [
      { name: "12 oz can", price: "2.75" },
      { name: "12 oz bottle", price: "3.30" },
      { name: "Wine", price: "4.40" },
      { name: "Happy hour can beer", price: "2.25", badge: "5 – 7pm" },
      { name: "Happy hour wine", price: "3.40", badge: "5 – 7pm" },
    ],
  },
];

export const drinks = [
  { n: "01", name: "Cocktails", accent: "#c0392b", body: "House classics and a short list of our own. Shaken, stirred, no theatrics.", glass: "cocktail" },
  { n: "02", name: "Beer", accent: "#e0a54a", body: "Draft, bottles and cans. Domestic staples plus whatever's local right now.", glass: "beer" },
  { n: "03", name: "Wine", accent: "#e05a48", body: "Reds, whites and bubbles by the glass or the bottle.", glass: "wine" },
  { n: "04", name: "Spirits", accent: "#c08b4e", body: "Whiskey, tequila, gin, rum and vodka. Neat, rocks, or built into something.", glass: "spirit" },
  { n: "05", name: "Zero proof", accent: "#1ba8c6", body: "Mocktails, sodas and coffee for whoever's driving everyone home.", glass: "soda" },
] as const;

/** The hall runs on walk-ins. Nothing here is held, booked or reserved. */
export const pool = [
  { n: "01", title: "Open play", body: "Put your name on the board and we'll shout when a table frees up. First come, first rack." },
  { n: "02", title: "Winner stays", body: "House rule on the front tables. Lose and you're back on the board — no hard feelings." },
  { n: "03", title: "TouchTunes", body: "The jukebox takes requests from your phone. Queue something decent and the whole room hears it." },
  { n: "04", title: "Leagues", body: "Weekly league nights for regulars. Ask the bar about picking up a spot on a team." },
  { n: "05", title: "Tournaments", body: "Bracket nights with a sign-up sheet at the bar. Turn up early, the board fills fast." },
  { n: "06", title: "Big groups", body: "Bring the whole crew — just tell the bar how many of you there are when you land." },
] as const;

/** PLACEHOLDER schedule — replace with the real calendar. */
export const events = [
  { when: "Tuesdays", cadence: "Weekly", name: "8-ball tournament", desc: "Sign-up sheet at the bar, bracket play, winner takes the pot.", cta: "How it works", href: "#pool", accent: "#e0a54a" },
  { when: "Wednesdays", cadence: "Weekly", name: "Trivia night", desc: "Teams of six or fewer. Prizes for the top three. Come early for a seat.", cta: "See the menu", href: "#menu", accent: "#c0392b" },
  { when: "Thursdays", cadence: "Weekly", name: "League night", desc: "The hall is busy and loud. Open tables at the back all night.", cta: "Join a team", href: "#contact", accent: "#7a3f33" },
  { when: "Fridays", cadence: "Weekly", name: "Live music", desc: "Local acts on the floor. Kitchen runs late, bar runs later.", cta: "What's pouring", href: "#drinks", accent: "#c08b4e" },
  { when: "Game day", cadence: "Seasonal", name: "Watch party", desc: "Every screen on, sound up for the big one, food and drink specials.", cta: "Find us", href: "#contact", accent: "#1ba8c6" },
] as const;

export const gallery = [
  { src: "/images/hall.webp", alt: "Rows of pool tables under fluorescent lamps inside The Bow's billiards room.", caption: "The back room", span: "col-span-2 row-span-2" },
  { src: "/images/tables.webp", alt: "Pool tables in a line with cue chalk on the rails.", caption: "Fresh felt", span: "row-span-2" },
  { src: "/images/sign.webp", alt: "The Bow's exterior sign mounted on white brick above the entrance.", caption: "The sign", span: "row-span-2" },
  { src: "/images/window.webp", alt: "The Bow's window lettering reading burgers, brews, billiards, with the street outside.", caption: "Out front", span: "col-span-2" },
] as const;

/** Open slots for photography that doesn't exist yet. */
export const galleryPlaceholders = ["— food —", "— the bar —"] as const;
