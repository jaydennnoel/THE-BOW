import { useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Rail } from "./components/Rail";
import { About } from "./components/About";
import { Menu } from "./components/Menu";
import { Drinks } from "./components/Drinks";
import { Pool } from "./components/Pool";
import { Events } from "./components/Events";
import { Gallery } from "./components/Gallery";
import { CtaBand } from "./components/CtaBand";
import { Contact } from "./components/Contact";
import { Doorway } from "./components/Doorway";
import { Footer } from "./components/Footer";

export default function App() {
  /**
   * Placeholder links say so when clicked rather than silently doing nothing.
   * Delete this effect once every href points somewhere real.
   */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-placeholder-link]");
      if (!a) return;
      e.preventDefault();
      if (a.dataset.busy || a.querySelector("svg")) return;
      const original = a.textContent ?? "";
      a.dataset.busy = "1";
      a.textContent = "Link not set yet";
      window.setTimeout(() => {
        a.textContent = original;
        a.dataset.busy = "";
      }, 1600);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-[-100px] z-[200] bg-cream px-4 py-3 font-mono text-[.8rem] font-semibold leading-none text-ink transition-[top] focus:top-4"
      >
        Skip to content
      </a>

      <Header />

      <main id="main">
        {/* the front door, then the counter… */}
        <Hero />
        <Rail />
        <About />
        <Menu />
        {/* …then through to the back */}
        <Doorway />
        <Drinks />
        <Pool />
        <Events />
        <Gallery />
        <CtaBand />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
