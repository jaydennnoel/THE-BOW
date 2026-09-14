export function Lead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`max-w-[56ch] text-lead text-room-dim ${className}`}>{children}</p>;
}
