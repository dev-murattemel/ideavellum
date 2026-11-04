"use client";

import { CalendarPlus, MapPin, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { kindOf } from "@/lib/area-kinds";
import { goTo } from "@/lib/nav/nav-context";
import { startStudy } from "@/lib/timer/start-study";
import { formatDuration, isoDate, isoWeekday, minutesOfDay, minutesToTime, WEEKDAY_NAMES } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { AttendanceButtons } from "./attendance-buttons";
import type { useToday } from "./use-today";

type T = ReturnType<typeof useToday>;

/**
 * "Şimdi" şeridi: tek satırda şu an süren ya da sıradaki ders.
 * Sıradaki ders bugün değilse büyük geri sayım yerine sakin bir bilgi satırı gösterilir.
 */
export function NowStrip({ t, now }: { t: T; now: Date }) {
  const occ = t.current ?? t.next;
  const nowMin = minutesOfDay(now);

  if (!occ) {
    return (
      <Strip>
        <p className="min-w-0 flex-1 text-sm text-ink-muted">Takvimde yaklaşan bir saat yok.</p>
        <Button size="sm" variant="secondary" onClick={() => goTo("/takvim")}><CalendarPlus /> Takvime saat ekle</Button>
      </Strip>
    );
  }

  const isCurrent = occ === t.current;
  const offset = isCurrent ? 0 : (t.nextDayOffset ?? 0);
  const vocab = kindOf(occ.course);
  const date = isoDate(occ.date);

  // Sıradaki ders başka bir günde: sadece bilgi
  if (!isCurrent && offset > 0) {
    const day = offset === 1 ? "Yarın" : WEEKDAY_NAMES[isoWeekday(occ.date) - 1];
    return (
      <Strip>
        <p className="min-w-0 flex-1 text-sm">
          <span className="text-ink-muted">Bugün takvimde saat yok. Sıradaki: </span>
          <button type="button" onClick={() => ui().openOccurrence({ sessionId: occ.session.id, date })} data-course={occ.course.color} className="cursor-pointer font-medium underline-offset-4 hover:underline">
            <span className="mr-1.5 inline-block size-2 rounded-full bg-course-solid align-middle" aria-hidden />
            {day} {minutesToTime(occ.start)} · {occ.course.name}
          </button>
        </p>
        <Button size="sm" variant="secondary" onClick={() => startStudy(occ.course.id, "timer")}><Play /> Şimdi {vocab.activity.toLocaleLowerCase("tr")}</Button>
      </Strip>
    );
  }

  const remaining = isCurrent ? occ.end - nowMin : occ.start - nowMin;
  const countdown = remaining < 1 ? "1 dk'dan az" : formatDuration(Math.ceil(remaining));

  return (
    <section
      aria-label={isCurrent ? "Şu an" : "Sıradaki"}
      data-course={occ.course.color}
      className={cn("flex flex-col gap-3 rounded-xl p-4", isCurrent ? "bg-course text-course-fg" : "border border-line bg-surface")}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className={cn("flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold", isCurrent ? "bg-surface/70" : "bg-course text-course-fg")}>
          {isCurrent && <span className="size-1.5 animate-pulse rounded-full bg-course-solid motion-reduce:animate-none" aria-hidden />}
          {isCurrent ? "Şu an" : "Sıradaki"}
        </span>
        <button type="button" onClick={() => ui().openOccurrence({ sessionId: occ.session.id, date })} className="min-w-0 flex-1 cursor-pointer text-left outline-none focus-visible:underline">
          <span className="block truncate text-base font-semibold">{occ.course.name}</span>
          <span className={cn("tabular flex flex-wrap items-center gap-x-2 text-13", isCurrent ? "opacity-85" : "text-ink-muted")}>
            {minutesToTime(occ.start)}–{minutesToTime(occ.end)}
            {occ.session.location && <span className="flex items-center gap-1"><MapPin className="size-3" aria-hidden />{occ.session.location}</span>}
          </span>
        </button>
        <p className="tabular text-right text-sm" aria-live="polite">
          <span className="font-semibold">{countdown}</span> <span className={isCurrent ? "opacity-80" : "text-ink-muted"}>{isCurrent ? "kaldı" : "sonra"}</span>
        </p>
        <div className="flex items-center gap-2">
          {isCurrent && <AttendanceButtons compact sessionId={occ.session.id} date={date} value={t.attendanceToday.get(occ.session.id)} />}
          <Button size="sm" className={isCurrent ? "bg-course-fg text-surface hover:bg-course-fg/90" : undefined} onClick={() => startStudy(occ.course.id, isCurrent ? "session" : "timer")}>
            <Play className="fill-current" /> {vocab.activity} başlat
          </Button>
        </div>
      </div>
      {isCurrent && <Progress value={((nowMin - occ.start) / (occ.end - occ.start)) * 100} tone="course" label="Geçen süre" className="h-1.5 bg-surface/50" />}
    </section>
  );
}

function Strip({ children }: { children: React.ReactNode }) {
  return <section aria-label="Sıradaki program" className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">{children}</section>;
}
