"use client";

import * as React from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { JournalEntry } from "@/lib/data/types";
import { fmt, isoDate, parseDay, WEEKDAY_SHORT } from "@/lib/time";
import { cn } from "@/lib/utils";
import { moodOf } from "./moods";

/** Ay takvimi: yazılan günler ruh hali renginde nokta, seçili gün çerçeveli */
export function JournalCalendar({ entries, selected, today, onSelect }: { entries: Map<string, JournalEntry>; selected: string; today: string; onSelect: (d: string) => void }) {
  const [month, setMonth] = React.useState(() => startOfMonth(parseDay(selected)));
  const days = eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold capitalize">{fmt(month, "MMMM yyyy")}</h2>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon-sm" aria-label="Önceki ay" onClick={() => setMonth((m) => addMonths(m, -1))}><ChevronLeft /></Button>
          <Button variant="ghost" size="icon-sm" aria-label="Sonraki ay" onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center" role="grid" aria-label="Günlük takvimi">
        {WEEKDAY_SHORT.map((d) => <span key={d} className="pb-1 text-[11px] text-ink-subtle">{d.slice(0, 2)}</span>)}
        {days.map((d) => {
          const key = isoDate(d);
          const e = entries.get(key);
          const mood = moodOf(e?.mood);
          const future = key > today;
          return (
            <button
              key={key}
              type="button"
              disabled={future}
              onClick={() => onSelect(key)}
              aria-label={`${fmt(d, "d MMMM")}${e ? ", yazıldı" : ""}${mood ? `, ${mood.label}` : ""}`}
              aria-current={key === today ? "date" : undefined}
              aria-pressed={key === selected}
              className={cn(
                "relative mx-auto flex size-9 cursor-pointer flex-col items-center justify-center rounded-lg text-13 tabular transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-30",
                !isSameMonth(d, month) && "text-ink-subtle/60",
                key === selected ? "bg-primary text-primary-foreground" : "hover:bg-hover",
                key === today && key !== selected && "font-semibold text-accent-text",
              )}
            >
              {fmt(d, "d")}
              {e && (
                <span
                  data-course={mood?.color}
                  className={cn("absolute bottom-1 size-1 rounded-full", key === selected ? "bg-primary-foreground" : mood ? "bg-course-solid" : "bg-ink-subtle")}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
