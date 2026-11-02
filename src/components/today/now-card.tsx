"use client";

import { MapPin, Play, Sunrise } from "lucide-react";

import { QuickAddButton } from "@/components/layout/quick-add-button";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { kindOf } from "@/lib/area-kinds";
import { startStudy } from "@/lib/timer/start-study";
import { formatDuration, isoDate, minutesOfDay, minutesToTime, WEEKDAY_NAMES, isoWeekday } from "@/lib/time";
import { AttendanceButtons } from "./attendance-buttons";
import type { useToday } from "./use-today";

type T = ReturnType<typeof useToday>;

/** Şu an süren ya da sıradaki ders: canlı geri sayım, yoklama, çalışmayı başlat */
export function NowCard({ t, now }: { t: T; now: Date }) {
  const occ = t.current ?? t.next;
  if (!occ) {
    return (
      <section aria-label="Şu an ya da sıradaki program" className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-line-strong bg-surface p-5 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sunken text-ink-muted">
          <Sunrise className="size-5" strokeWidth={1.7} aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-base font-semibold">Sırada bir program yok</h2>
          <p className="text-sm text-ink-muted">Bir ders ekleyip saatini girdiğinde, şu anki program ve geri sayım burada görünecek.</p>
        </div>
        <QuickAddButton action="course" label="Ders ekle" />
      </section>
    );
  }

  const isCurrent = occ === t.current;
  const nowMin = minutesOfDay(now);
  const offset = isCurrent ? 0 : (t.nextDayOffset ?? 0);
  const remaining = isCurrent ? occ.end - nowMin : occ.start + offset * 1440 - nowMin;
  const countdown = remaining < 1 ? "1 dk'dan az" : formatDuration(Math.ceil(remaining));
  const dayLabel = offset === 0 ? "Bugün" : offset === 1 ? "Yarın" : WEEKDAY_NAMES[isoWeekday(occ.date) - 1];
  const topic = t.currentTopic(occ.course.id);
  const date = isoDate(occ.date);

  return (
    <section aria-label={isCurrent ? "Şu an" : "Sıradaki"} data-course={occ.course.color} className="flex flex-col gap-5 rounded-2xl bg-course p-5 text-course-fg sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface/70 px-2.5 py-1 text-xs font-semibold">
            {isCurrent && <span className="size-2 animate-pulse rounded-full bg-course-solid motion-reduce:animate-none" aria-hidden />}
            {isCurrent ? "Şu an sürüyor" : `Sıradaki · ${dayLabel}`}
          </span>
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">{occ.course.name}</h2>
          <p className="tabular flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-85">
            <span>{minutesToTime(occ.start)}–{minutesToTime(occ.end)}</span>
            {occ.session.location && (
              <span className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{occ.session.location}</span>
            )}
            {topic && <span>Konu: {topic.title}</span>}
          </p>
        </div>
        <div className="flex flex-col items-end" aria-live="polite">
          <span className="tabular text-3xl font-semibold tracking-[-0.03em]">{countdown}</span>
          <span className="text-13 opacity-80">{isCurrent ? "bitmesine" : "başlamasına"}</span>
        </div>
      </div>

      {isCurrent && <Progress value={((nowMin - occ.start) / (occ.end - occ.start)) * 100} tone="course" label="Geçen süre" className="h-2 bg-surface/50" />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {offset === 0 ? (
          <AttendanceButtons sessionId={occ.session.id} date={date} value={t.attendanceToday.get(occ.session.id)} />
        ) : (
          <span className="text-13 opacity-80">Yoklama o gün açılır.</span>
        )}
        <Button className="bg-course-fg text-surface hover:bg-course-fg/90" onClick={() => startStudy(occ.course.id, isCurrent ? "session" : "timer")}>
          <Play className="fill-current" /> {kindOf(occ.course).activity} başlat
        </Button>
      </div>
    </section>
  );
}
