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
        ink: { DEFAULT: "#0b0a08", 2: "#121110", 3: "#1a1714" },
        char: { DEFAULT: "#211d18", 2: "#2b251e" },
        cream: {
          DEFAULT: "#ece4d4",
          dim: "rgba(236,228,212,.66)",
          faint: "rgba(236,228,212,.38)",
        },
        brass: { DEFAULT: "#c8962f", lit: "#e3b755", deep: "#8a6318" },
        oxblood: { DEFAULT: "#7d2029", lit: "#a63340" },
        rust: "#a8481f",
        felt: { DEFAULT: "#1f7a3f", lit: "#2f9e55", deep: "#12452a" },
        neon: { pink: "#ff4d8d", warm: "#ffd9a8", ice: "#8fe6ff" },
        hair: { DEFAULT: "rgba(236,228,212,.15)", soft: "rgba(236,228,212,.07)" },
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
        inset: "inset 0 1px 0 rgba(236,228,212,.08)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "none" },
        },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        /** A tube that never quite settled after it warmed up. */
        flicker: {
          "0%,18%,22%,25%,53%,57%,100%": { opacity: "1" },
          "20%,23.5%,55%": { opacity: ".28" },
          "56%": { opacity: ".7" },
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
