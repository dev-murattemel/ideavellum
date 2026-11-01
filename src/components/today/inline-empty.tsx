import type { LucideIcon } from "lucide-react";

/** Kart içinde kullanılan sade boş durum. */
export function InlineEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg bg-sunken text-ink-muted">
        <Icon className="size-5" strokeWidth={1.7} aria-hidden />
      </span>
      <div className="flex max-w-xs flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-13 text-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
