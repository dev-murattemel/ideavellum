"use client";

import * as React from "react";
import { CalendarClock, MapPin } from "lucide-react";

import { InlineEmpty } from "@/components/today/inline-empty";
import { isoDate, minutesOfDay, minutesToTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { AttendanceButtons } from "./attendance-buttons";
import type { useToday } from "./use-today";

type T = ReturnType<typeof useToday>;

/** Bugünün programı: dikey zaman çizelgesi ve şu anki saat çizgisi */
export function TodayTimeline({ t, now }: { t: T; now: Date }) {
  const nowMin = minutesOfDay(now);
  if (t.occurrences.length === 0) {
    return <InlineEmpty icon={CalendarClock} title="Bugün programda bir şey yok" description="Takvime eklediğin saatler burada zaman çizelgesi olarak sıralanır." />;
  }
  const nowIndex = t.occurrences.findIndex((o) => o.start > nowMin);
  const insertAt = nowIndex === -1 ? t.occurrences.length : nowIndex;
  const date = isoDate(now);

  const NowLine = (
    <li key="now" aria-label={`Şu an ${minutesToTime(nowMin)}`} className="relative flex items-center gap-3 py-1">
      <span className="tabular w-12 shrink-0 text-right text-xs font-semibold text-accent-text">{minutesToTime(nowMin)}</span>
      <span className="relative flex flex-1 items-center">
        <span className="-ml-[5px] size-2.5 rounded-full bg-primary" />
        <span className="h-0.5 flex-1 bg-primary" />
      </span>
    </li>
  );

  return (
    <ol className="flex flex-col gap-2">
      {t.occurrences.map((o, i) => {
        const past = o.end <= nowMin;
        const current = o.start <= nowMin && nowMin < o.end;
        return (
          <React.Fragment key={o.session.id}>
            {i === insertAt && !current && NowLine}
            <li className="flex items-stretch gap-3">
              <span className={cn("tabular w-12 shrink-0 pt-2.5 text-right text-xs", past ? "text-ink-subtle" : "text-ink-muted")}>{minutesToTime(o.start)}</span>
              <div
                data-course={o.course.color}
                className={cn(
                  "flex min-w-0 flex-1 flex-col gap-2 rounded-lg border-l-[3px] border-course-solid bg-course px-3 py-2.5 text-course-fg",
                  past && "opacity-70",
                  current && "ring-2 ring-course-solid/40",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{o.course.name}</p>
                    <p className="tabular flex items-center gap-2 text-xs opacity-80">
                      {minutesToTime(o.start)}–{minutesToTime(o.end)}
                      {o.session.location && <span className="flex items-center gap-1 truncate"><MapPin className="size-3" aria-hidden />{o.session.location}</span>}
                    </p>
                  </div>
                  {current && <span className="shrink-0 rounded-full bg-surface/70 px-2 py-0.5 text-xs font-semibold">Şu an</span>}
                </div>
                {(past || current) && (
                  <AttendanceButtons compact sessionId={o.session.id} date={date} value={t.attendanceToday.get(o.session.id)} />
                )}
              </div>
            </li>
          </React.Fragment>
        );
      })}
      {insertAt === t.occurrences.length && NowLine}
    </ol>
  );
}
