import { addDays } from "date-fns";

import { fmt, isoDate, weekStart } from "@/lib/time";
import { cn } from "@/lib/utils";

/** Son 12 haftanın işaretleri: her sütun bir hafta (Pazartesi üstte) */
export function HabitHeatmap({ days, today, weeks = 12 }: { days: Set<string>; today: Date; weeks?: number }) {
  const start = addDays(weekStart(today), -7 * (weeks - 1));
  const todayKey = isoDate(today);
  const cols = Array.from({ length: weeks }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
  const count = cols.flat().filter((d) => days.has(isoDate(d))).length;

  return (
    <div role="img" aria-label={`Son ${weeks} haftada ${count} gün işaretlendi`} className="flex gap-[3px]">
      {cols.map((col, i) => (
        <div key={i} className="flex flex-col gap-[3px]">
          {col.map((d) => {
            const key = isoDate(d);
            return (
              <span
                key={key}
                title={fmt(d, "d MMMM")}
                className={cn("size-2.5 rounded-[3px]", key > todayKey ? "bg-transparent" : days.has(key) ? "bg-course-solid" : "bg-sunken", key === todayKey && "ring-1 ring-foreground/40")}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
