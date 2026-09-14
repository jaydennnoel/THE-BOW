/**
 * ─────────────────────────────────────────────────────────────
 *  THE BOW — single source of truth for site content.
 *  Everything in square brackets is a PLACEHOLDER awaiting real
 *  business information. Nothing here is invented as fact.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "The Bow",
  tagline: "Burgers · Brews · Billiards",
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

  /** From the hours card on the door: Monday–Saturday. Times to confirm. */
  hours: [
    { days: "Monday – Thursday", time: "[open – close]" },
    { days: "Friday – Saturday", time: "[open – close]" },
    { days: "Sunday", time: "[hours]" },
  ],

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
  desc: string;
  badge?: string;
}
export interface MenuCategory {
  id: string;
  label: string;
  items: MenuItem[];
}

/** PLACEHOLDER menu — swap in the real board. Prices intentionally blank. */
export const menu: MenuCategory[] = [
  {
    id: "burgers",
    label: "Burgers",
    items: [
      { name: "The Bow burger", desc: "Double smash patty, American, pickle, house sauce.", badge: "House" },
      { name: "Bacon & cheddar", desc: "Thick-cut bacon, sharp cheddar, crispy onion." },
      { name: "Mushroom swiss", desc: "Sautéed mushrooms, swiss, garlic aioli." },
      { name: "Jalapeño smash", desc: "Pepper jack, jalapeño, chipotle mayo." },
      { name: "Patty melt", desc: "Griddled rye, caramelized onion, swiss." },
      { name: "Black bean burger", desc: "House black bean patty, avocado, lime crema.", badge: "Veg" },
    ],
  },
  {
    id: "starters",
    label: "Starters",
    items: [
      { name: "Fried pickles", desc: "Hand-battered spears, house ranch." },
      { name: "Loaded fries", desc: "Cheese, bacon, scallion, sour cream." },
      { name: "Cheese curds", desc: "White cheddar, marinara on the side." },
      { name: "Wings", desc: "Six or twelve. Buffalo, dry rub, or gold sauce." },
      { name: "Onion rings", desc: "Thick cut, beer battered." },
      { name: "Chips & queso", desc: "Warm queso, pickled jalapeño." },
    ],
  },
  {
    id: "sandwiches",
    label: "Sandwiches",
    items: [
      { name: "Chicken sandwich", desc: "Fried or grilled, slaw, pickles, brioche." },
      { name: "Philly", desc: "Shaved steak, peppers, onions, provolone." },
      { name: "Club", desc: "Turkey, bacon, lettuce, tomato, toasted sourdough." },
      { name: "Grilled cheese & soup", desc: "Three cheeses, cup of tomato." },
    ],
  },
  {
    id: "entrees",
    label: "Entrées",
    items: [
      { name: "Ribeye", desc: "Two sides, garlic butter." },
      { name: "Chicken tenders", desc: "Hand breaded, fries, choice of sauce." },
      { name: "Fish & chips", desc: "Beer battered cod, slaw, tartar." },
      { name: "Chopped salad", desc: "Greens, cucumber, tomato, feta, herb vinaigrette.", badge: "Veg" },
    ],
  },
  {
    id: "shareables",
    label: "Shareables",
    items: [
      { name: "The rack", desc: "Wings, tenders, rings, fried pickles. Built for four." },
      { name: "Nacho pile", desc: "Queso, beef or chicken, all the fixings." },
      { name: "Soft pretzels", desc: "Beer cheese, whole grain mustard." },
      { name: "Flatbread", desc: "Ask your server what's on it tonight." },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    items: [
      { name: "Skillet cookie", desc: "Warm, vanilla ice cream, two spoons." },
      { name: "Fried cheesecake", desc: "Berry sauce, powdered sugar." },
      { name: "Brownie sundae", desc: "Hot fudge, whipped cream." },
      { name: "Boozy shake", desc: "Ask the bar. 21+." },
    ],
  },
];

export const drinks = [
  { n: "01", name: "Cocktails", accent: "#a85f43", body: "House classics and a short list of our own. Shaken, stirred, no theatrics.", glass: "cocktail" },
  { n: "02", name: "Beer", accent: "#b0913f", body: "Draft, bottles and cans. Domestic staples plus whatever's local right now.", glass: "beer" },
  { n: "03", name: "Wine", accent: "#9c5a52", body: "Reds, whites and bubbles by the glass or the bottle.", glass: "wine" },
  { n: "04", name: "Spirits", accent: "#8c7a5c", body: "Whiskey, tequila, gin, rum and vodka. Neat, rocks, or built into something.", glass: "spirit" },
  { n: "05", name: "Zero proof", accent: "#5c7a52", body: "Mocktails, sodas and coffee for whoever's driving everyone home.", glass: "soda" },
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
  { when: "Tuesdays", cadence: "Weekly", name: "8-ball tournament", desc: "Sign-up sheet at the bar, bracket play, winner takes the pot.", cta: "How it works", href: "#pool", accent: "#b0913f" },
  { when: "Wednesdays", cadence: "Weekly", name: "Trivia night", desc: "Teams of six or fewer. Prizes for the top three. Come early for a seat.", cta: "See the menu", href: "#menu", accent: "#a85f43" },
  { when: "Thursdays", cadence: "Weekly", name: "League night", desc: "The hall is busy and loud. Open tables at the back all night.", cta: "Join a team", href: "#contact", accent: "#7a3038" },
  { when: "Fridays", cadence: "Weekly", name: "Live music", desc: "Local acts on the floor. Kitchen runs late, bar runs later.", cta: "What's pouring", href: "#drinks", accent: "#8c7a5c" },
  { when: "Game day", cadence: "Seasonal", name: "Watch party", desc: "Every screen on, sound up for the big one, food and drink specials.", cta: "Find us", href: "#contact", accent: "#5c7a52" },
] as const;

export const gallery = [
  { src: "/images/hall.webp", alt: "Rows of pool tables under fluorescent lamps inside The Bow's billiards room.", caption: "The back room", span: "col-span-2 row-span-2" },
  { src: "/images/tables.webp", alt: "Pool tables in a line with cue chalk on the rails.", caption: "Fresh felt", span: "row-span-2" },
  { src: "/images/sign.webp", alt: "The Bow's exterior sign mounted on white brick above the entrance.", caption: "The sign", span: "row-span-2" },
  { src: "/images/window.webp", alt: "The Bow's window lettering reading burgers, brews, billiards, with the street outside.", caption: "Out front", span: "col-span-2" },
] as const;

/** Open slots for photography that doesn't exist yet. */
export const galleryPlaceholders = ["— food —", "— the bar —"] as const;
