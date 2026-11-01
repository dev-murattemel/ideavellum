"use client";


import { useProfile, useRows } from "@/lib/data/hooks";
import { minutesByDay } from "@/lib/domain/stats";
import { formatDuration, isoDate, weekDays, WEEKDAY_SHORT, zonedNow } from "@/lib/time";
import { cn } from "@/lib/utils";

/** Bu haftanın günlük çalışma süreleri, küçük çubuklar (tek renk; ders kimliği başlıkta) */
export function WeekBars({ courseId }: { courseId: string }) {
  const logs = useRows("study_logs");
  const tz = useProfile().timezone;
  const now = zonedNow(tz);
  const today = isoDate(now);
  const days = weekDays(now);
  const byDay = minutesByDay(logs.filter((l) => l.course_id === courseId), tz);
  const values = days.map((d) => byDay.get(isoDate(d)) ?? 0);
  const max = Math.max(60, ...values);

  return (
    <div className="flex items-end gap-1.5" role="img" aria-label={`Günlük çalışma: ${days.map((d, i) => `${WEEKDAY_SHORT[i]} ${formatDuration(values[i])}`).join(", ")}`}>
      {days.map((d, i) => {
        const v = values[i];
        const isToday = isoDate(d) === today;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5" title={`${WEEKDAY_SHORT[i]}: ${formatDuration(v)}`}>
            <div className="flex h-16 w-full items-end">
              <div
                className={cn("w-full rounded-[4px]", v ? "bg-course-solid" : "bg-sunken", isoDate(d) > today && "opacity-50")}
                style={{ height: v ? `${Math.max(8, (v / max) * 100)}%` : 4 }}
              />
            </div>
            <span className={cn("text-[11px] leading-none", isToday ? "font-semibold text-foreground" : "text-ink-subtle")}>{WEEKDAY_SHORT[i].slice(0, 2)}</span>
          </div>
        );
      })}
    </div>
  );
}
