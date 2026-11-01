import { CalendarClock } from "lucide-react";

import type { Task } from "@/lib/data/types";
import { dueLabel } from "@/lib/domain/tasks";
import { cn } from "@/lib/utils";

export function DueChip({ task, now, className }: { task: Task; now: Date; className?: string }) {
  const due = dueLabel(task, now);
  if (!due) return null;
  return (
    <span
      data-course={due.tone === "overdue" ? "rose" : undefined}
      className={cn(
        "tabular inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-xs font-medium",
        due.tone === "overdue" ? "bg-course text-course-fg" : "bg-surface/70 text-current",
        className,
      )}
    >
      <CalendarClock className="size-3.5" aria-hidden />
      {due.text}
    </span>
  );
}
