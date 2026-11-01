"use client";

import { FocusCard } from "@/components/ai/focus-card";
import { QuickNote } from "@/components/today/quick-note";
import { SectionCard } from "@/components/today/section-card";
import { SummaryStrip } from "@/components/today/summary-strip";
import { useNow } from "@/components/schedule/use-now";
import { useProfile, useRows } from "@/lib/data/hooks";
import { areaWeeks } from "@/lib/domain/insights";
import { formatLongDate, greeting } from "@/lib/dates";
import { NowCard } from "./now-card";
import { TodayTasks, useTodayTasks } from "./today-tasks";
import { TodayTimeline } from "./today-timeline";
import { useToday } from "./use-today";
import { DayCard } from "./day-card";
import { HabitsCard } from "./habits-card";
import { OnboardingCard } from "./onboarding-card";
import { InsightsCard } from "./insights-card";
import { WeekGoalsCard } from "./week-goals-card";
import { isoDate } from "@/lib/time";

export function TodayView() {
  const now = useNow(15_000);
  const profile = useProfile();
  const t = useToday(now);
  const tasks = useTodayTasks(now);
  const weeks = areaWeeks(useRows("courses"), useRows("study_logs"), now, profile.timezone);
  const week = { minutes: weeks.reduce((a, w) => a + w.minutes, 0), target: weeks.reduce((a, w) => a + w.target, 0) };
  const firstName = profile.full_name?.split(" ")[0];
  const real = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-13 font-medium text-ink-muted">
          <time dateTime={real.toISOString()}>{formatLongDate(real, profile.timezone)}</time>
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">
          {greeting(real, profile.timezone)}
          {firstName ? `, ${firstName}` : ""}
        </h1>
      </div>

      <OnboardingCard />

      <SummaryStrip studiedMinutes={t.studiedToday} completedTasks={t.completedToday} streakDays={t.streak} weekMinutes={week.minutes} weekTarget={week.target} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <FocusCard t={t} now={now} />
          <NowCard t={t} now={now} />
          <InsightsCard now={now} streak={t.streak} studiedToday={t.studiedToday} />
        </div>
        <div className="flex flex-col gap-4">
          <DayCard today={isoDate(now)} />
          <HabitsCard now={now} />
          <WeekGoalsCard now={now} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCard title="Bugünün programı" meta={`${t.occurrences.length} program`}>
          <TodayTimeline t={t} now={now} />
        </SectionCard>
        <div className="flex flex-col gap-4">
          <SectionCard title="Bugünün görevleri" meta={`${tasks.open.length} açık`}>
            <TodayTasks now={now} />
          </SectionCard>
          <SectionCard title="Hızlı not">
            <QuickNote defaultCourseId={(t.current ?? t.next)?.course.id} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
