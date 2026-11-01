"use client";

import * as React from "react";
import { isSameDay } from "date-fns";
import { CalendarPlus } from "lucide-react";

import { placeLanes } from "@/components/schedule/lanes";
import { useNow } from "@/components/schedule/use-now";
import { Button } from "@/components/ui/button";
import { useCourseMap, useRows } from "@/lib/data/hooks";
import type { Course } from "@/lib/data/types";
import { occurrencesOn } from "@/lib/domain/schedule";
import { fmt, formatDuration, isoWeekday, minutesOfDay, minutesToTime, weekDays, WEEKDAY_NAMES, WEEKDAY_SHORT } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { kindOf } from "@/lib/area-kinds";

const HOUR_PX = 44;
const PX = HOUR_PX / 60;

/** Görünen saat aralığı: derslerin etrafında birer saat boşluk, en az 8 saat */
function visibleRange(mins: number[]) {
  if (!mins.length) return { from: 8 * 60, to: 22 * 60 };
  let from = Math.max(0, Math.floor(Math.min(...mins) / 60) * 60 - 60);
  let to = Math.min(24 * 60, Math.ceil(Math.max(...mins) / 60) * 60 + 60);
  while (to - from < 8 * 60) {
    if (from > 0) from -= 60;
    if (to - from < 8 * 60 && to < 24 * 60) to += 60;
  }
  return { from, to };
}

/**
 * Ders detayında bu haftanın zaman çizelgesi. Bu dersin saatleri kendi renginde,
 * diğer derslerin saatleri soluk görünür (çakışmaları görmek için).
 * Boş alana tıklayınca o gün ve saatte bu derse ders saati eklenir.
 */
export function CourseWeekTimeline({ course, weeklyMinutes }: { course: Course; weeklyMinutes: number }) {
  const sessions = useRows("class_sessions");
  const courseMap = useCourseMap();
  const now = useNow();
  const days = React.useMemo(() => weekDays(now), [now]);
  const [hover, setHover] = React.useState<{ day: number; min: number } | null>(null);

  const columns = React.useMemo(() => {
    const map = { ...courseMap, [course.id]: { ...course, status: "active" as const } };
    return days.map((d) => placeLanes(occurrencesOn(sessions, map, d)));
  }, [days, sessions, courseMap, course]);

  const { from, to } = visibleRange(columns.flat().flatMap((o) => [o.start, o.end]));
  const hours = Array.from({ length: (to - from) / 60 + 1 }, (_, i) => from / 60 + i);
  const top = (min: number) => (min - from) * PX;
  const nowMin = minutesOfDay(now);
  const todayIndex = days.findIndex((d) => isSameDay(d, now));
  const hasOwn = columns.some((c) => c.some((o) => o.course.id === course.id));

  const slotAt = (e: React.MouseEvent<HTMLDivElement>) => {
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    return Math.min(to - 60, Math.max(from, Math.floor((from + y / PX) / 30) * 30));
  };
  const add = (weekday: number, start: number) =>
    ui().open({ type: "session", preset: { course_id: course.id, weekday, start_time: minutesToTime(start), end_time: minutesToTime(Math.min(24 * 60 - 1, start + 90)) } });

  return (
    <section aria-labelledby="course-week" className="flex flex-col rounded-xl border border-line bg-surface">
      <header className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-line px-4 py-2">
        <div className="flex items-baseline gap-3">
          <h2 id="course-week" className="text-sm font-semibold">Bu hafta takvimde</h2>
          <span className="tabular text-13 text-ink-muted">
            {weeklyMinutes ? `${formatDuration(weeklyMinutes)} / hafta` : "Henüz takvim saati yok"}
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={() => add(isoWeekday(now), 19 * 60)}>
          <CalendarPlus /> {kindOf(course).session} ekle
        </Button>
      </header>

      <div className="relative overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="flex border-b border-line">
            <div className="w-12 shrink-0" />
            <div className="grid flex-1 grid-cols-7">
              {days.map((d, i) => (
                <div key={i} className="flex h-11 items-center justify-center gap-1.5 border-l border-line">
                  <span className={cn("text-xs", i === todayIndex ? "font-medium text-accent-text" : "text-ink-muted")}>{WEEKDAY_SHORT[i]}</span>
                  <span className={cn("tabular flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-13 font-semibold", i === todayIndex && "bg-primary text-primary-foreground")}>
                    {fmt(d, "d")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex" style={{ height: (to - from) * PX }}>
            <div className="relative w-12 shrink-0" aria-hidden>
              {hours.slice(1, -1).map((h) => (
                <span key={h} className="tabular absolute right-2 -translate-y-1/2 text-xs text-ink-subtle" style={{ top: top(h * 60) }}>
                  {String(h).padStart(2, "0")}:00
                </span>
              ))}
            </div>

            <div className="relative grid flex-1 grid-cols-7">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                {hours.slice(1, -1).map((h) => (
                  <div key={h} className="absolute inset-x-0 border-t border-line" style={{ top: top(h * 60) }} />
                ))}
              </div>

              {days.map((d, i) => (
                <div
                  key={i}
                  role="presentation"
                  className={cn("relative cursor-copy border-l border-line", i === todayIndex && "bg-accent-soft/35")}
                  onMouseMove={(e) => e.target === e.currentTarget && setHover({ day: i, min: slotAt(e) })}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => e.target === e.currentTarget && add(isoWeekday(d), slotAt(e))}
                >
                  {hover?.day === i && (
                    <div aria-hidden className="pointer-events-none absolute inset-x-1 rounded-md border border-dashed border-primary/50 bg-accent-soft/50 px-1.5 py-1 text-xs font-medium text-accent-text" style={{ top: top(hover.min), height: 90 * PX }}>
                      + {minutesToTime(hover.min)}
                    </div>
                  )}

                  {columns[i].map((o) => {
                    const own = o.course.id === course.id;
                    const h = (o.end - o.start) * PX;
                    const label = `${o.course.name}, ${WEEKDAY_NAMES[i]} ${o.session.start_time}–${o.session.end_time}`;
                    return (
                      <div
                        key={o.session.id}
                        data-course={o.course.color}
                        className={cn("absolute px-0.5 py-px", own ? "z-[2]" : "z-[1]")}
                        style={{ top: top(o.start), height: h, left: `${(o.lane / o.lanes) * 100}%`, width: `${100 / o.lanes}%` }}
                      >
                        <button
                          type="button"
                          aria-label={own ? `${label}, düzenle` : `${label} (başka alan)`}
                          onClick={() => ui().open({ type: "session", sessionId: o.session.id })}
                          className={cn(
                            "flex size-full cursor-pointer flex-col overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-left transition-[filter] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            own
                              ? "border-course-solid bg-course text-course-fg hover:brightness-[0.97]"
                              : "border border-l border-dashed border-line-strong bg-transparent text-ink-subtle hover:bg-sunken/60 hover:text-ink-muted",
                          )}
                        >
                          <span className="tabular text-xs font-semibold leading-tight">
                            {o.session.start_time}–{o.session.end_time}
                          </span>
                          {h >= 44 && (
                            <span className="truncate text-xs leading-tight opacity-85">{own ? (o.session.location ?? course.name) : o.course.name}</span>
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {i === todayIndex && nowMin >= from && nowMin < to && (
                    <div aria-hidden className="pointer-events-none absolute inset-x-0 z-[3] flex items-center" style={{ top: top(nowMin) }}>
                      <span className="-ml-1 size-2 rounded-full bg-primary" />
                      <span className="h-0.5 flex-1 bg-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!hasOwn && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
            <p className="rounded-lg border border-line bg-surface px-3 py-2 text-13 text-ink-muted shadow-sm">
              Bir güne ve saate tıklayarak takvime saat ekle.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
