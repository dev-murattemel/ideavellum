import { Flag } from "lucide-react";

import type { TaskPriority } from "@/lib/data/types";
import { PRIORITY_META } from "@/lib/domain/tasks";
import { cn } from "@/lib/utils";

export function PriorityFlag({ priority, withLabel = false, className }: { priority: TaskPriority; withLabel?: boolean; className?: string }) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", className)} title={`Öncelik: ${meta.label}`}>
      <Flag className={cn("size-3.5", meta.color)} fill={priority === "urgent" || priority === "high" ? "currentColor" : "none"} aria-hidden />
      {withLabel ? meta.label : <span className="sr-only">Öncelik: {meta.label}</span>}
    </span>
  );
}
