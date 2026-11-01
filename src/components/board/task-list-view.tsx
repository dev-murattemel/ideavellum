"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useRows } from "@/lib/data/hooks";
import type { TaskStatus } from "@/lib/data/types";
import { setTaskDone, STATUSES } from "@/lib/domain/tasks";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { DueChip } from "./due-chip";
import { PriorityFlag } from "./priority-flag";
import type { CardData } from "./task-card";

export function TaskListView({ columns, now }: { columns: Record<TaskStatus, CardData[]>; now: Date }) {
  const all = useRows("tasks");
  return (
    <div className="flex flex-col gap-4">
      {STATUSES.map((s) => (
        <section key={s.id} aria-label={s.label} className="overflow-hidden rounded-xl border border-line bg-surface">
          <header className="flex h-11 items-center gap-2 border-b border-line bg-sunken/40 px-4">
            <span className={cn("size-2 rounded-full", s.dot)} aria-hidden />
            <h2 className="text-13 font-semibold">{s.label}</h2>
            <span className="tabular text-13 text-ink-muted">{columns[s.id].length}</span>
          </header>
          {columns[s.id].length === 0 ? (
            <p className="px-4 py-3 text-13 text-ink-muted">Bu durumda görev yok.</p>
          ) : (
            <ul>
              {columns[s.id].map(({ task, course, checklist }) => (
                <li key={task.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0 hover:bg-hover/60">
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={(c) => setTaskDone(task, c === true, all)}
                    aria-label={task.status === "done" ? `${task.title} görevini geri al` : `${task.title} görevini tamamla`}
                  />
                  <button type="button" onClick={() => ui().openTask(task.id)} className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 text-left outline-none focus-visible:underline sm:flex-row sm:items-center sm:gap-3">
                    <span className={cn("truncate text-sm font-medium", task.status === "done" && "text-ink-muted line-through")}>{task.title}</span>
                    {checklist.length > 0 && (
                      <span className="tabular text-xs text-ink-muted">
                        {checklist.filter((c) => c.is_done).length}/{checklist.length}
                      </span>
                    )}
                  </button>
                  {course && (
                    <span data-course={course.color} className="hidden h-6 items-center gap-1.5 rounded-md bg-course px-2 text-xs font-medium text-course-fg md:inline-flex">
                      {course.name}
                    </span>
                  )}
                  <DueChip task={task} now={now} className="hidden bg-sunken sm:inline-flex" />
                  <PriorityFlag priority={task.priority} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
