import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";

interface Props {
  eyebrow: string;
  /** Use <br /> to control the ragging of the display type. */
  title: ReactNode;
  aside?: ReactNode;
}

export function SectionHead({ eyebrow, title, aside }: Props) {
  return (
    <div className="mb-[clamp(2.5rem,5vw,4rem)] grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:gap-x-16">
      <Reveal>
        <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
        <h2 className="display max-w-[18ch] text-h2">{title}</h2>
      </Reveal>
      {aside ? <Reveal delay={1}>{aside}</Reveal> : null}
    </div>
  );
}
