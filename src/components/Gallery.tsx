import { gallery, galleryPlaceholders } from "@/data/site";
import { Lead } from "./ui/Lead";
import { Reveal } from "./ui/Reveal";
import { SectionHead } from "./ui/SectionHead";

export function Gallery() {
  return (
    <section
      aria-labelledby="gallery-heading"
      className="relative isolate overflow-hidden py-section"
      style={{
        background:
          "radial-gradient(50% 45% at 50% 0%,rgba(31,122,63,.2),transparent 65%),#0b0a08",
      }}
    >
      <div className="shell relative">
        <SectionHead
          eyebrow="The room"
          title={<span id="gallery-heading">Come see it.</span>}
          aside={<Lead>Neon in the window, checkerboard floors, and green felt as far as the room goes.</Lead>}
        />

        <Reveal delay={1}>
          <div className="grid auto-rows-[clamp(112px,26vw,180px)] grid-cols-2 gap-[clamp(.5rem,1vw,.85rem)] md:auto-rows-[clamp(150px,15vw,215px)] md:grid-cols-4">
            {gallery.map((tile) => (
              <figure key={tile.src} className={`group relative m-0 h-full overflow-hidden rounded-edge bg-char ${tile.span}`}>
                <img
                  src={tile.src}
                  alt={tile.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover brightness-[.88] contrast-[1.08] saturate-[1.25] transition-[transform,filter] duration-[1100ms] ease-cue group-hover:scale-[1.06] group-hover:brightness-110 group-hover:saturate-[1.6] group-focus-within:scale-[1.06] group-focus-within:saturate-[1.6]"
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/90 to-transparent px-4 pb-3.5 pt-6 font-mono text-[.64rem] uppercase leading-none tracking-[.18em] text-cream opacity-0 transition-[opacity,transform] duration-[400ms] ease-cue group-hover:translate-y-0 group-hover:opacity-100">
                  {tile.caption}
                </figcaption>
              </figure>
            ))}

            {galleryPlaceholders.map((label) => (
              <figure key={label} className="m-0 h-full rounded-edge bg-char">
                <div className="grid h-full place-items-center border border-dashed border-hair p-4 text-center font-mono text-[.62rem] uppercase leading-relaxed tracking-[.14em] text-cream-faint">
                  Add photo
                  <br />
                  {label}
                </div>
              </figure>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
