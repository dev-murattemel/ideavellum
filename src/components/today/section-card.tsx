import { cn } from "@/lib/utils";

/** Bugün ekranındaki başlıklı kart. */
export function SectionCard({
  title,
  meta,
  children,
  className,
  dense,
}: {
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Daha sıkı başlık ve iç boşluk */
  dense?: boolean;
}) {
  const id = `section-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id} className={cn("lift flex flex-col rounded-xl border border-line bg-surface", className)}>
      <header className={cn("flex items-center justify-between gap-3 border-b border-line px-4", dense ? "h-11" : "h-12")}>
        <h2 id={id} className="text-sm font-semibold">
          {title}
        </h2>
        {meta && <div className="text-13 text-ink-muted">{meta}</div>}
      </header>
      <div className={cn("flex flex-1 flex-col", dense ? "px-4 py-1.5" : "p-4")}>{children}</div>
    </section>
  );
}
