/** Marks content that is placeholder and must be replaced before launch. */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-edge border border-dashed border-room-accent px-2.5 py-1.5 font-mono text-[.62rem] uppercase leading-none tracking-[.18em] text-room-accent">
      <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-room-accent opacity-90" />
      {children}
    </span>
  );
}
