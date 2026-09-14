import type { Config } from "tailwindcss";

/**
 * The Bow — a dive bar that's been there a while.
 *
 * Warm near-black, bone, brass and oxblood: cigarette-stained wood, a brass
 * rail, a green felt table and an amber bottle held up to the light. The
 * wordmark itself stays black and white; colour is the room around it.
 *
 * The `neon` group is the one loud thing in here, and it belongs to the sign
 * in the window — not to buttons, links or headings.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /**
         * The Bow's wordmark is black and white, and the page is built on
         * neutrals. The accents are the things in the room that have aged:
         * tarnished brass on the rail, brick, spilled wine soaked into wood,
         * a bottle held up to the light, nicotine on the ceiling.
         *
         * All of them are dulled on purpose — nothing here is saturated
         * enough to read as a highlighter. Where an accent carries text it
         * clears WCAG AA on the panel it sits on; `oxblood` is deliberately
         * too dark for that and is only ever used as a fill, edge or wash.
         */
        ink: { DEFAULT: "#0a0a09", 2: "#111110", 3: "#181817" },
        char: { DEFAULT: "#1f1f1d", 2: "#2a2a27" },
        cream: {
          DEFAULT: "#f4f1ea",
          dim: "rgba(244,241,234,.66)",
          faint: "rgba(244,241,234,.4)",
        },
        brass: { DEFAULT: "#b0913f", lit: "#c9ab5c", deep: "#6f5a25" },
        clay: "#a85f43",
        bottle: { DEFAULT: "#5c7a52", lit: "#7b9c6e" },
        tobacco: "#8c7a5c",
        oxblood: { DEFAULT: "#7a3038", lit: "#9c5a52" },
        /** The one lit object on the page: the sign hanging in the window. */
        sign: { red: "#ef3b22", ice: "#cfeaff" },
        /** The cloth on the table, used by the hero canvas. */
        felt: { DEFAULT: "#1f7a3f", lit: "#2f9e55", deep: "#12452a" },
        hair: { DEFAULT: "rgba(244,241,234,.15)", soft: "rgba(244,241,234,.07)" },

        /**
         * The front room: an old diner. Formica, a bone counter, red vinyl
         * booths, chrome edging and a strip of tile.
         */
        diner: {
          cream: "#f1ebdd",
          bone: "#fbf7ec",
          ink: "#171612",
          red: "#a8332e",
          teal: "#35665f",
          chrome: "#c5c9cb",
        },

        /**
         * Room-aware tokens. Anything shared between the two halves of the
         * page paints with these; a section sets which room it is in and the
         * primitives inside it follow. Defaults are the back room, so the
         * dark half needs no markup at all.
         */
        room: {
          fg: "var(--fg)",
          dim: "var(--fg-dim)",
          faint: "var(--fg-faint)",
          rule: "var(--rule)",
          soft: "var(--rule-soft)",
          accent: "var(--accent)",
        },
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', "Haettenschweiler", '"Arial Narrow"', "sans-serif"],
        body: ['"Instrument Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        // fluid scale — no breakpoint jumps
        h1: ["clamp(2.9rem,1.2rem + 7.4vw,7rem)", { lineHeight: ".82" }],
        h2: ["clamp(2.9rem,1.6rem + 6vw,6rem)", { lineHeight: ".84" }],
        h3: ["clamp(1.35rem,1.15rem + .8vw,1.9rem)", { lineHeight: "1" }],
        lead: ["clamp(1.05rem,1rem + .4vw,1.3rem)", { lineHeight: "1.6" }],
      },
      spacing: {
        gutter: "clamp(1.25rem,4.5vw,3.75rem)",
        section: "clamp(4.75rem,9vw,8.5rem)",
        header: "74px",
      },
      maxWidth: { shell: "1340px" },
      borderRadius: { edge: "2px" },
      transitionTimingFunction: { cue: "cubic-bezier(.22,.61,.36,1)" },
      boxShadow: {
        lift: "0 30px 70px -30px rgba(0,0,0,.95)",
        inset: "inset 0 1px 0 rgba(244,241,234,.08)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        /** A tube that never quite settled after it warmed up. */
        flicker: {
          "0%,31%,33.5%,36%,72%,74%,100%": { opacity: "1" },
          "32%,35%,73%": { opacity: ".34" },
        },
        /** The slow breathing of a transformer under load. */
        hum: {
          "0%,100%": { filter: "brightness(1)" },
          "50%": { filter: "brightness(1.09)" },
        },
      },
      animation: {
        fadeUp: "fadeUp .5s cubic-bezier(.22,.61,.36,1)",
        marquee: "marquee 38s linear infinite",
        flicker: "flicker 7s steps(1,end) infinite",
        hum: "hum 3.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
