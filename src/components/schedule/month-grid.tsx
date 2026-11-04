"use client";

import * as React from "react";
import { addDays, endOfMonth, isSameDay, isSameMonth, startOfMonth } from "date-fns";

import { useRows } from "@/lib/data/hooks";
import { matchFilter, occurrencesOn } from "@/lib/domain/schedule";
import { fmt, minutesToTime, weekStart, WEEKDAY_SHORT } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useNow } from "./use-now";

export function MonthGrid({ anchor, onPickDay, filter = null }: { anchor: Date; onPickDay: (d: Date) => void; filter?: string | null }) {
  const allSessions = useRows("class_sessions");
  const sessions = React.useMemo(() => allSessions.filter((s) => matchFilter(s, filter)), [allSessions, filter]);
  const courses = useRows("courses");
  const now = useNow();
  const courseMap = React.useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses]);

  const first = weekStart(startOfMonth(anchor));
  const last = endOfMonth(anchor);
  const weeks = Math.ceil((last.getTime() - first.getTime()) / (7 * 864e5));
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i));

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="grid grid-cols-7 border-b border-line">
        {WEEKDAY_SHORT.map((d) => (
          <div key={d} className="py-2.5 text-center text-xs font-medium text-ink-muted">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const occ = occurrencesOn(sessions, courseMap, d);
          const inMonth = isSameMonth(d, anchor);
          const today = isSameDay(d, now);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onPickDay(d)}
              aria-label={`${fmt(d, "d MMMM EEEE")}, ${occ.length} program`}
              className={cn(
                "flex min-h-24 cursor-pointer flex-col gap-1 border-t border-l border-line p-1.5 text-left transition-colors outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:min-h-28 sm:p-2 [&:nth-child(7n+1)]:border-l-0 [&:nth-child(-n+7)]:border-t-0",
                !inMonth && "bg-sunken/40",
              )}
            >
              <span
                className={cn(
                  "tabular flex size-6 items-center justify-center rounded-full text-13 font-medium",
                  today ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-ink-subtle",
                )}
              >
                {fmt(d, "d")}
              </span>
              <span className="flex flex-col gap-0.5">
                {occ.slice(0, 3).map((o) => (
                  <span key={o.session.id} data-course={o.course.color} className="flex items-center gap-1.5 truncate rounded-sm bg-course px-1.5 py-0.5 text-xs text-course-fg max-sm:justify-center max-sm:px-0">
                    <span className="size-1.5 shrink-0 rounded-full bg-course-solid" aria-hidden />
                    <span className="tabular truncate max-sm:hidden">{minutesToTime(o.start)} {o.course.name}</span>
                  </span>
                ))}
                {occ.length > 3 && <span className="px-1.5 text-xs text-ink-muted">+{occ.length - 3} daha</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
