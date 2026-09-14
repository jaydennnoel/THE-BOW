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
         * Taken off photographs of the room rather than invented.
         *
         * The whole building is dark. Up front it's galvanized sheet, duct
         * work, a butcher-block counter and black stools under warm bulbs;
         * out back it's near-black wood panelling, neon, and pool tables
         * whose cloth is electric blue, not green. Black-and-white tile runs
         * under both. The wordmark stays black and white.
         */
        ink: { DEFAULT: "#0b0b0c", 2: "#121214", 3: "#1a1a1d" },
        char: { DEFAULT: "#212125", 2: "#2b2b30" },
        cream: {
          DEFAULT: "#f0ece2",
          dim: "rgba(240,236,226,.66)",
          faint: "rgba(240,236,226,.4)",
        },
        /** Galvanized sheet and stainless. */
        steel: { DEFAULT: "#6f7478", lit: "#aab0b4", dark: "#34373a" },
        /** Butcher block up front, panelling out back. */
        wood: { DEFAULT: "#8a6034", lit: "#c08b4e", dark: "#43301c" },
        /** The cloth on the tables. */
        cyan: { DEFAULT: "#1ba8c6", lit: "#4fd2e8", deep: "#0a4f63" },
        /** The bulbs over the counter and the lit menu board. */
        amber: { DEFAULT: "#e0a54a", lit: "#f3c87c", deep: "#7d5417" },
        /** Piping on the stools, and the sign in the window. */
        red: { DEFAULT: "#c0392b", lit: "#e05a48" },
        brick: "#7a3f33",
        felt: { DEFAULT: "#1ba8c6", lit: "#4fd2e8", deep: "#0a4f63" },
        hair: { DEFAULT: "rgba(240,236,226,.15)", soft: "rgba(240,236,226,.07)" },

        /**
         * Room-aware tokens. Both halves are dark now — they differ by
         * material and by the colour of the light, not by brightness. Front
         * of house is lit warm; the back room is lit by the tables.
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
