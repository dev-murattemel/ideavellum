"use client";

import * as React from "react";

import { fmt, formatDuration, WEEKDAY_SHORT } from "@/lib/time";
import { cn } from "@/lib/utils";

type Cell = { key: string; date: Date; minutes: number };

const LEVELS = [
  "bg-sunken",
  "bg-[color-mix(in_srgb,var(--accent)_22%,var(--surface-card))]",
  "bg-[color-mix(in_srgb,var(--accent)_45%,var(--surface-card))]",
  "bg-[color-mix(in_srgb,var(--accent)_70%,var(--surface-card))]",
  "bg-[var(--accent)]",
];
const level = (m: number) => (m === 0 ? 0 : m < 30 ? 1 : m < 60 ? 2 : m < 120 ? 3 : 4);

/** GitHub tarzı seri takvimi: sütunlar haftalar, satırlar günler (Pazartesi üstte) */
export function StreakHeatmap({ cells }: { cells: Cell[] }) {
  const weeks: Cell[][] = [];
  cells.forEach((c, i) => {
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push(c);
  });
  const scroller = React.useRef<HTMLDivElement>(null);
  // Dar ekranda en yeni haftalar görünsün
  React.useEffect(() => {
    if (scroller.current) scroller.current.scrollLeft = scroller.current.scrollWidth;
  }, []);
  return (
    <div className="flex flex-col gap-3">
      <div ref={scroller} className="relative -mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex w-max gap-[3px] lg:w-full lg:justify-between">
          <div className="mr-1 flex flex-col gap-[3px] pt-5" aria-hidden>
            {WEEKDAY_SHORT.map((d, i) => (
              <span key={d} className={cn("flex h-3.5 items-center text-[10px] leading-none text-ink-subtle", i % 2 && "invisible")}>{d}</span>
            ))}
          </div>
          {weeks.map((w, wi) => (
            <div key={w[0].key} className="flex flex-col gap-[3px]">
              <span className="h-4 w-3.5 overflow-visible text-[10px] leading-4 whitespace-nowrap text-ink-subtle" aria-hidden>
                {(wi === 0 || w[0].date.getDate() <= 7) && wi < weeks.length - 1 ? fmt(w[0].date, "MMM") : ""}
              </span>
              {w.map((c) => (
                <span
                  key={c.key}
                  title={`${fmt(c.date, "d MMMM EEEE")}: ${c.minutes ? formatDuration(c.minutes) : "çalışma yok"}`}
                  aria-label={`${fmt(c.date, "d MMMM")}: ${c.minutes ? formatDuration(c.minutes) : "çalışma yok"}`}
                  className={cn("size-3.5 rounded-[3px]", LEVELS[level(c.minutes)])}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 self-end text-xs text-ink-muted" aria-hidden>
        <span>Az</span>
        {LEVELS.map((l) => <span key={l} className={cn("size-3.5 rounded-[3px]", l)} />)}
        <span>Çok</span>
      </div>
    </div>
  );
}
