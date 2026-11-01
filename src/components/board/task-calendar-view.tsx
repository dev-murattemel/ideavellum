"use client";

import * as React from "react";
import { addDays, addMonths, endOfMonth, isSameDay, isSameMonth, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TaskStatus } from "@/lib/data/types";
import { fmt, isoDate, utcToWall, weekStart, WEEKDAY_SHORT } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import type { CardData } from "./task-card";

/** Görevleri son tarihlerine göre ay takviminde gösterir. */
export function TaskCalendarView({ columns, now }: { columns: Record<TaskStatus, CardData[]>; now: Date }) {
  const [anchor, setAnchor] = React.useState(now);
  const byDay = React.useMemo(() => {
    const m = new Map<string, CardData[]>();
    Object.values(columns).flat().forEach((c) => {
      if (!c.task.due_at) return;
      const k = isoDate(utcToWall(c.task.due_at));
      m.set(k, [...(m.get(k) ?? []), c]);
    });
    return m;
  }, [columns]);

  const first = weekStart(startOfMonth(anchor));
  const weeks = Math.ceil((endOfMonth(anchor).getTime() - first.getTime()) / (7 * 864e5));
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon-sm" aria-label="Önceki ay" onClick={() => setAnchor((a) => addMonths(a, -1))}><ChevronLeft /></Button>
        <Button variant="secondary" size="icon-sm" aria-label="Sonraki ay" onClick={() => setAnchor((a) => addMonths(a, 1))}><ChevronRight /></Button>
        <h2 className="ml-1 text-base font-semibold first-letter:uppercase">{fmt(anchor, "MMMM yyyy")}</h2>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="grid grid-cols-7 border-b border-line">
          {WEEKDAY_SHORT.map((d) => <div key={d} className="py-2.5 text-center text-xs font-medium text-ink-muted">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const items = byDay.get(isoDate(d)) ?? [];
            return (
              <div key={d.toISOString()} className={cn("flex min-h-28 flex-col gap-1 border-t border-l border-line p-1.5 [&:nth-child(7n+1)]:border-l-0 [&:nth-child(-n+7)]:border-t-0", !isSameMonth(d, anchor) && "bg-sunken/40")}>
                <span className={cn("tabular flex size-6 items-center justify-center rounded-full text-13 font-medium", isSameDay(d, now) ? "bg-primary text-primary-foreground" : isSameMonth(d, anchor) ? "" : "text-ink-subtle")}>
                  {fmt(d, "d")}
                </span>
                {items.slice(0, 3).map(({ task, course }) => (
                  <button
                    key={task.id}
                    type="button"
                    data-course={course?.color ?? "slate"}
                    onClick={() => ui().openTask(task.id)}
                    className={cn("cursor-pointer truncate rounded-sm bg-course px-1.5 py-0.5 text-left text-xs text-course-fg hover:opacity-80", task.status === "done" && "line-through opacity-60")}
                  >
                    {task.title}
                  </button>
                ))}
                {items.length > 3 && <span className="px-1.5 text-xs text-ink-muted">+{items.length - 3} daha</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
