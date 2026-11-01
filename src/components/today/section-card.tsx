import { cn } from "@/lib/utils";

/** Bugün ekranındaki başlıklı kart. */
export function SectionCard({
  title,
  meta,
  children,
  className,
}: {
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const id = `section-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section aria-labelledby={id} className={cn("lift flex flex-col rounded-xl border border-line bg-surface", className)}>
      <header className="flex h-12 items-center justify-between gap-3 border-b border-line px-4">
        <h2 id={id} className="text-sm font-semibold">
          {title}
        </h2>
        {meta && <div className="text-13 text-ink-muted">{meta}</div>}
      </header>
      <div className="flex flex-1 flex-col p-4">{children}</div>
    </section>
  );
}
