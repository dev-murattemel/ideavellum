"use client";

import { FocusCard } from "@/components/ai/focus-card";
import { useNow } from "@/components/schedule/use-now";
import { useProfile, useRows } from "@/lib/data/hooks";
import { areaWeeks } from "@/lib/domain/insights";
import { formatLongDate } from "@/lib/dates";
import { BackupReminder } from "./backup-reminder";
import { HabitsCard } from "./habits-card";
import { InsightsCard } from "./insights-card";
import { NowStrip } from "./now-strip";
import { OnboardingCard } from "./onboarding-card";
import { QuickCapture } from "./quick-capture";
import { TodayAgenda } from "./today-agenda";
import { TodayHeader } from "./today-header";
import { useToday } from "./use-today";
import { WeekGoalsCard } from "./week-goals-card";

/**
 * Bugün: 3 saniyede "şu an ne var, sırada ne var, bugün ne yapacağım".
 * Solda şimdi şeridi + günün planı (program ve görevler) + öneriler;
 * sağda hızlı yaz, alışkanlıklar ve haftalık hedef.
 */
export function TodayView() {
  const now = useNow(15_000);
  const profile = useProfile();
  const t = useToday(now);
  const weeks = areaWeeks(useRows("courses"), useRows("study_logs"), now, profile.timezone);
  const week = { minutes: weeks.reduce((a, w) => a + w.minutes, 0), target: weeks.reduce((a, w) => a + w.target, 0) };
  const real = new Date();

  return (
    <div className="flex flex-col gap-5">
      {/* Masaüstünde tarih üst çubukta yazıyor */}
      <p className="-mb-3 text-13 font-medium text-ink-muted md:hidden">
        <time dateTime={real.toISOString()}>{formatLongDate(real, profile.timezone)}</time>
      </p>
      <TodayHeader now={now} studied={t.studiedToday} streak={t.streak} week={week} />

      <BackupReminder />
      <OnboardingCard />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <NowStrip t={t} now={now} />
          <TodayAgenda t={t} now={now} />
          {/* Telefonda hızlı yaz planın hemen altında; geniş ekranda sağ sütunda */}
          <div className="lg:hidden"><QuickCapture /></div>
          <InsightsCard now={now} streak={t.streak} studiedToday={t.studiedToday} />
          <FocusCard t={t} now={now} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="hidden lg:block"><QuickCapture /></div>
          <HabitsCard now={now} />
          <WeekGoalsCard now={now} />
        </div>
      </div>
    </div>
  );
}
