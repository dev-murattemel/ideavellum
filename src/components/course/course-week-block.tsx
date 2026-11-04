"use client";

import { ListChecks } from "lucide-react";

import type { Placed } from "@/components/schedule/lanes";
import type { SessionEntry } from "@/lib/data/types";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/**
 * Ders sayfasındaki haftalık çizelgede tek blok. Bu dersin saati kendi renginde,
 * başka derslerin saatleri kesik çizgili ve soluk görünür.
 */
export function CourseWeekBlock({ o, own, fallback, date, dayName, top, height: h, entry }: {
  o: Placed;
  own: boolean;
  fallback: string;
  date: string;
  dayName: string;
  top: number;
  height: number;
  entry?: SessionEntry;
}) {
  const checks = entry?.checklist ?? [];
  const label = `${o.course.name}${entry?.title ? `, ${entry.title}` : ""}, ${dayName} ${o.session.start_time}–${o.session.end_time}`;
  return (
    <div
      data-course={o.course.color}
      className={cn("absolute px-0.5 py-px", own ? "z-[2]" : "z-[1]")}
      style={{ top, height: h, left: `${(o.lane / o.lanes) * 100}%`, width: `${100 / o.lanes}%` }}
    >
      <button
        type="button"
        aria-label={own ? `${label}, günün ayrıntısı` : `${label} (başka alan)`}
        onClick={() => ui().openOccurrence({ sessionId: o.session.id, date })}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
            e.preventDefault();
            ui().setClip({ sessionId: o.session.id, date });
          }
        }}
        className={cn(
          "relative flex size-full cursor-pointer flex-col overflow-hidden rounded-lg py-1 pr-1.5 text-left transition-[filter] outline-none focus-visible:ring-2 focus-visible:ring-ring",
          own
            ? "bg-course pl-3 text-course-fg ring-1 ring-course-solid/15 ring-inset hover:brightness-[0.98]"
            : "border border-dashed border-line-strong bg-transparent pl-1.5 text-ink-subtle hover:bg-sunken/60 hover:text-ink-muted",
        )}
      >
        {own && <span aria-hidden className="absolute inset-y-1 left-1 w-[3px] rounded-full bg-course-solid" />}
        <span className="tabular text-xs leading-tight font-semibold">
          {o.session.start_time}–{o.session.end_time}
        </span>
        {h >= 44 && (
          <span className={cn("truncate text-xs leading-tight", entry?.title ? "font-medium" : "opacity-85")}>
            {own ? (entry?.title ?? o.session.location ?? fallback) : o.course.name}
          </span>
        )}
        {own && checks.length > 0 && h >= 60 && (
          <span className="tabular mt-auto flex items-center gap-1 text-xs opacity-80">
            <ListChecks className="size-3 shrink-0" aria-hidden />
            {checks.filter((c) => c.done).length}/{checks.length}
          </span>
        )}
      </button>
    </div>
  );
}
