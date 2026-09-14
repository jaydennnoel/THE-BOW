/** Small mono label with a hairline rule — the section signpost. */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3.5 font-mono text-[.7rem] uppercase leading-none tracking-[.24em] text-cream ${className}`}>
      <span aria-hidden="true" className="h-px w-9 bg-cream opacity-70" />
      {children}
    </p>
  );
}
