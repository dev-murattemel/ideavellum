import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Yönlendirici boş durum: ne olmadığını ve ilk adımı söyler. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-line bg-surface text-center",
        compact ? "gap-3 px-6 py-10" : "gap-4 px-6 py-16 sm:py-20",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-sunken text-ink-muted",
          compact ? "size-10" : "size-12",
        )}
      >
        <Icon className={compact ? "size-5" : "size-6"} strokeWidth={1.7} aria-hidden />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base")}>{title}</h2>
        <p className={cn("text-ink-muted", compact ? "text-13" : "text-sm")}>{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
