"use client";

import * as React from "react";
import { Pause, Play, Plus, Square, X } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/components/today/section-card";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data/hooks";
import type { Course } from "@/lib/data/types";
import { fmt, formatDuration, utcToWall } from "@/lib/time";
import { startStudy } from "@/lib/timer/start-study";
import { elapsedMs, formatClock, useTimer } from "@/lib/timer/store";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { kindOf } from "@/lib/area-kinds";

/** Ders sayfasındaki çalışma kartı: büyük sayaç, başlat / duraklat / bitir, elle süre ekleme */
export function CourseStudyCard({ course }: { course: Course }) {
  const t = useTimer();
  const logs = useRows("study_logs");
  const mine = t.courseId === course.id;
  const running = mine && !!t.runningSince;
  const [, tick] = React.useState(0);

  React.useEffect(() => {
    if (!running) return;
    const i = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, [running]);

  const recent = React.useMemo(
    () => logs.filter((l) => l.course_id === course.id).sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, 3),
    [logs, course.id],
  );

  const stop = () => {
    const res = useTimer.getState().stop();
    if (!res) return;
    if (res.minutes >= 1) toast.success(`${formatDuration(res.minutes)} kaydedildi`, { description: course.name });
    else toast("1 dakikadan kısa sürdüğü için kaydedilmedi");
  };

  const status = mine ? (running ? "Sürüyor" : "Duraklatıldı") : t.courseId ? "Başka bir alanda zamanlayıcı açık" : "Zamanlayıcı kapalı";

  return (
    <SectionCard title={kindOf(course).activity} meta={<span className={cn(running && "font-medium text-course-fg")}>{status}</span>}>
      <div className="flex flex-col gap-4">
        <div role="timer" aria-label="Geçen süre" className={cn("rounded-lg px-4 py-3 text-center", mine ? "bg-course text-course-fg" : "bg-sunken text-ink-muted")}>
          <span className="tabular text-[32px] leading-10 font-semibold tracking-[-0.02em]">{formatClock(mine ? elapsedMs(t) : 0)}</span>
        </div>

        {mine ? (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <Button variant="secondary" onClick={() => (running ? t.pause() : t.resume())}>
              {running ? <><Pause className="fill-current" /> Duraklat</> : <><Play className="fill-current" /> Devam et</>}
            </Button>
            <Button onClick={stop}><Square className="fill-current" /> Bitir</Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Kaydetmeden kapat"
              title="Kaydetmeden kapat"
              onClick={() => { t.discard(); toast("Zamanlayıcı kaydedilmeden kapatıldı"); }}
            >
              <X />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={course.status !== "active"} onClick={() => startStudy(course.id)}>
              <Play className="fill-current" /> Başlat
            </Button>
            <Button variant="secondary" onClick={() => ui().open({ type: "study-log", preset: { course_id: course.id } })}>
              <Plus /> Süre ekle
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-1.5 border-t border-line pt-3">
          <span className="text-xs text-ink-muted">Son kayıtlar</span>
          {recent.length === 0 ? (
            <p className="text-13 text-ink-muted">Henüz kayıt yok.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center justify-between text-13">
                  <span className="text-ink-muted">{fmt(utcToWall(l.started_at), "d MMM, EEE HH:mm")}</span>
                  <span className="tabular font-medium">{formatDuration(l.duration_minutes)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
