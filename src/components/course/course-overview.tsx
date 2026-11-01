"use client";

import { SectionCard } from "@/components/today/section-card";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/lib/data/types";
import { useCourseStats } from "@/lib/domain/course-stats";
import { formatDuration } from "@/lib/time";
import { CourseNotesCard } from "./course-notes-card";
import { CourseStudyCard } from "./course-study-card";
import { CourseWeekTimeline } from "./course-week-timeline";
import { WeekBars } from "./week-bars";
import { kindOf } from "@/lib/area-kinds";

export function CourseOverview({ course }: { course: Course }) {
  const s = useCourseStats(course);
  const target = course.target_weekly_minutes ?? 0;
  const weekPct = target ? (s.weekMinutes / target) * 100 : 0;

  return (
    <div data-course={course.color} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <CourseWeekTimeline course={course} weeklyMinutes={s.scheduledWeekly} />
      </div>

      <CourseStudyCard course={course} />

      <SectionCard title="Bu hafta" meta={target ? `Hedef ${formatDuration(target)}` : undefined}>
        <div className="flex flex-1 flex-col gap-3">
          <p className="tabular text-2xl font-semibold tracking-[-0.02em]">{formatDuration(s.weekMinutes)}</p>
          {target > 0 && <Progress value={weekPct} tone="course" label="Haftalık hedef" className="h-2" />}
          <p className="text-13 text-ink-muted">
            {target
              ? weekPct >= 100
                ? "Haftalık hedefe ulaştın."
                : `Hedefe ${formatDuration(Math.max(0, target - s.weekMinutes))} kaldı.`
              : "Haftalık hedef belirlenmedi."}
          </p>
          <div className="mt-auto border-t border-line pt-4"><WeekBars courseId={course.id} /></div>
        </div>
      </SectionCard>

      <SectionCard title="İlerleme" meta={`%${s.progress}`}>
        <div className="flex flex-col gap-3">
          <Progress value={s.progress} tone="course" label="İlerleme" className="h-2" />
          <p className="tabular text-13 text-ink-muted">
            {s.topicsTotal
              ? `${kindOf(course).topics}: ${s.topicsDone} bitti, ${s.topicsInProgress} devam ediyor, toplam ${s.topicsTotal}.`
              : `Henüz eklenmedi. ${kindOf(course).topics} sekmesinden ekleyebilirsin.`}
          </p>
        </div>
      </SectionCard>

      <div className={course.description ? "lg:col-span-2" : "lg:col-span-3"}>
        <CourseNotesCard course={course} />
      </div>

      {course.description && (
        <SectionCard title="Hakkında">
          <p className="text-sm text-ink-muted">{course.description}</p>
        </SectionCard>
      )}
    </div>
  );
}
