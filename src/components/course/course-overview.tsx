"use client";

import { CalendarClock, MapPin, Plus } from "lucide-react";

import { SectionCard } from "@/components/today/section-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/lib/data/types";
import { useCourseStats } from "@/lib/domain/course-stats";
import { formatDuration, WEEKDAY_NAMES } from "@/lib/time";
import { ui } from "@/lib/ui-store";

export function CourseOverview({ course }: { course: Course }) {
  const s = useCourseStats(course);
  const target = course.target_weekly_minutes ?? 0;
  const weekPct = target ? (s.weekMinutes / target) * 100 : 0;

  return (
    <div data-course={course.color} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <SectionCard title="Konu ilerlemesi" meta={`%${s.progress}`}>
        <div className="flex flex-col gap-3">
          <Progress value={s.progress} tone="course" label="Konu ilerlemesi" className="h-2" />
          <p className="tabular text-13 text-ink-muted">
            {s.topicsDone} konu bitti, {s.topicsInProgress} devam ediyor, toplam {s.topicsTotal}.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Bu hafta" meta={target ? `Hedef ${formatDuration(target)}` : undefined}>
        <div className="flex flex-col gap-3">
          <p className="tabular text-2xl font-semibold tracking-[-0.02em]">{formatDuration(s.weekMinutes)}</p>
          {target > 0 && <Progress value={weekPct} tone="course" label="Haftalık hedef" className="h-2" />}
          <p className="text-13 text-ink-muted">
            {target
              ? weekPct >= 100
                ? "Haftalık hedefe ulaştın."
                : `Hedefe ${formatDuration(Math.max(0, target - s.weekMinutes))} kaldı.`
              : "Haftalık hedef belirlenmedi."}
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Ders saatleri" meta={s.scheduledWeekly ? `${formatDuration(s.scheduledWeekly)} / hafta` : undefined}>
        <div className="flex flex-col gap-2">
          {s.sessions.length === 0 && <p className="text-13 text-ink-muted">Bu dersin henüz haftalık saati yok.</p>}
          <ul className="flex flex-col gap-1.5">
            {s.sessions.map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  onClick={() => ui().open({ type: "session", sessionId: x.id })}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-course px-3 py-2 text-left text-13 text-course-fg transition-opacity hover:opacity-85"
                >
                  <CalendarClock className="size-4 shrink-0" aria-hidden />
                  <span className="font-medium">{WEEKDAY_NAMES[x.weekday - 1]}</span>
                  <span className="tabular">{x.start_time}–{x.end_time}</span>
                  {x.location && (
                    <span className="ml-auto flex min-w-0 items-center gap-1 opacity-80">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{x.location}</span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" className="mt-1 self-start" onClick={() => ui().open({ type: "session", preset: { course_id: course.id } })}>
            <Plus /> Ders saati ekle
          </Button>
        </div>
      </SectionCard>

      {course.description && (
        <SectionCard title="Hakkında" className="lg:col-span-3">
          <p className="text-sm text-ink-muted">{course.description}</p>
        </SectionCard>
      )}
    </div>
  );
}
