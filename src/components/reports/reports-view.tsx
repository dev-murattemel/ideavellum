"use client";

import * as React from "react";
import { addMonths, addWeeks, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { WeeklyComment } from "@/components/ai/weekly-comment";
import { PageHeader } from "@/components/layout/page-header";
import { useNow } from "@/components/schedule/use-now";
import { SectionCard } from "@/components/today/section-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmt, formatDuration } from "@/lib/time";
import { AttendanceTable } from "./attendance-table";
import { CourseBars } from "./course-bars";
import { DailyChart } from "./daily-chart";
import { StreakHeatmap } from "./streak-heatmap";
import { useReport, type Period } from "./use-report";
import { MoodTime } from "./mood-time";

export function ReportsView() {
  const now = useNow(60_000);
  const [period, setPeriod] = React.useState<Period>("week");
  const [anchor, setAnchor] = React.useState(now);
  const r = useReport(period, anchor, now);
  const step = (d: 1 | -1) => setAnchor((a) => (period === "week" ? addWeeks(a, d) : addMonths(a, d)));
  const label = period === "month"
    ? fmt(r.from, "MMMM yyyy")
    : isSameMonth(r.from, r.to) ? `${fmt(r.from, "d")}–${fmt(r.to, "d MMMM yyyy")}` : `${fmt(r.from, "d MMM")} – ${fmt(r.to, "d MMM yyyy")}`;
  const targetPct = r.targetMinutes ? (r.totalMinutes / r.targetMinutes) * 100 : 0;

  const stats = [
    { label: "Ayrılan süre", value: formatDuration(r.totalMinutes), sub: `${r.activeDays} gün` },
    { label: "Tamamlanan görev", value: String(r.completedTasks), sub: "Bitti sütununa geçen" },
    { label: "Biten konu", value: String(r.completedTopics), sub: "Konular sekmesinden" },
    { label: "Katılım", value: r.attendanceRate === null ? "—" : `%${r.attendanceRate}`, sub: "Katıldığın program saatleri" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="İlerleme" description="Haftalık ve aylık ilerlemen, hedeflerine göre." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon-sm" aria-label="Önceki" onClick={() => step(-1)}><ChevronLeft /></Button>
          <Button variant="secondary" size="icon-sm" aria-label="Sonraki" onClick={() => step(1)}><ChevronRight /></Button>
          <Button variant="secondary" size="sm" onClick={() => setAnchor(now)}>{period === "week" ? "Bu hafta" : "Bu ay"}</Button>
          <h2 className="ml-1 text-base font-semibold first-letter:uppercase" aria-live="polite">{label}</h2>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList aria-label="Dönem">
            <TabsTrigger value="week">Haftalık</TabsTrigger>
            <TabsTrigger value="month">Aylık</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-xl border border-line bg-surface p-4">
            <dt className="text-13 text-ink-muted">{s.label}</dt>
            <dd className="tabular text-2xl font-semibold tracking-[-0.02em]">{s.value}</dd>
            <dd className="text-xs text-ink-subtle">{s.sub}</dd>
          </div>
        ))}
      </dl>

      <WeeklyComment r={r} label={label} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <SectionCard title={period === "week" ? "Bu hafta: hedef ve gerçekleşen" : "Bu ay: hedef ve gerçekleşen"} meta={r.targetMinutes ? `%${Math.round(targetPct)}` : undefined}>
          <div className="flex flex-col gap-5">
            {r.targetMinutes > 0 && (
              <div className="flex flex-col gap-2">
                <p className="tabular text-13 text-ink-muted"><span className="text-xl font-semibold text-foreground">{formatDuration(r.totalMinutes)}</span> / {formatDuration(r.targetMinutes)} hedef</p>
                <Progress value={targetPct} label="Toplam hedef" className="h-2" />
              </div>
            )}
            <CourseBars rows={r.perCourse} />
            <p className="text-xs text-ink-subtle">Çubuktaki ince dikey çizgi alanın haftalık hedefini gösterir.</p>
          </div>
        </SectionCard>
        <SectionCard title="Günlük süre" meta={`Günde ort. ${formatDuration(Math.round(r.totalMinutes / Math.max(1, r.days.length)))}`}>
          <DailyChart days={r.days} />
        </SectionCard>
      </div>

      <SectionCard title="Ruh hali ve ayrılan süre" meta="Günlükten">
        <MoodTime days={r.days} />
      </SectionCard>

      <SectionCard title="Seri takvimi" meta={`${r.streak} gün seri`}>
        <StreakHeatmap cells={r.heat} />
      </SectionCard>

      <SectionCard title="Katılım">
        <AttendanceTable rows={r.perCourse} />
      </SectionCard>
    </div>
  );
}
