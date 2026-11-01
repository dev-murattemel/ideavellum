import { X } from "lucide-react";

import { tagColor } from "@/lib/tags";
import { cn } from "@/lib/utils";

/** Küçük renkli etiket. onRemove verilirse sağda kaldırma düğmesi çıkar. */
export function TagChip({ tag, onRemove, active, onClick, className }: { tag: string; onRemove?: () => void; active?: boolean; onClick?: () => void; className?: string }) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      {...(onClick ? { type: "button" as const, onClick, "aria-pressed": active } : {})}
      data-course={tagColor(tag)}
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1 rounded-md px-2 text-xs font-medium whitespace-nowrap",
        active === false ? "bg-sunken text-ink-muted hover:text-foreground" : "bg-course text-course-fg",
        onClick && "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="opacity-60">#</span>
      <span className="truncate">{tag}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`${tag} etiketini kaldır`} className="-mr-1 flex size-4 cursor-pointer items-center justify-center rounded-sm opacity-60 hover:opacity-100">
          <X className="size-3" />
        </button>
      )}
    </Comp>
  );
}
