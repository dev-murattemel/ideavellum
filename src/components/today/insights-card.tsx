"use client";

import { ArrowRight, CircleAlert, Lightbulb, PartyPopper, Sparkles } from "lucide-react";

import { SectionCard } from "@/components/today/section-card";
import { Button } from "@/components/ui/button";
import { useProfile, useRows } from "@/lib/data/hooks";
import { buildInsights, type Insight } from "@/lib/domain/insights";
import { useNav } from "@/lib/nav/nav-context";
import { startStudy } from "@/lib/timer/start-study";
import { cn } from "@/lib/utils";

const TONE = {
  warn: { icon: CircleAlert, cls: "bg-[#FDE4EC] text-[#9C2A55] dark:bg-[#E2588A]/16 dark:text-[#F3A3C0]" },
  info: { icon: Lightbulb, cls: "bg-accent-soft text-accent-text" },
  good: { icon: PartyPopper, cls: "bg-[#DFF5EA] text-[#1D6B47] dark:bg-[#34B37A]/16 dark:text-[#7FD8AE]" },
} as const;

/** Verilerine bakarak çıkarılan kısa öneriler: gecikenler, hedefin gerisindekiler, unutulan dersler */
export function InsightsCard({ now, streak, studiedToday }: { now: Date; streak: number; studiedToday: number }) {
  const tz = useProfile().timezone;
  const courses = useRows("courses");
  const logs = useRows("study_logs");
  const tasks = useRows("tasks");
  const journal = useRows("journal_entries");
  const nav = useNav();
  const items = buildInsights({ now, tz, courses, logs, tasks, journal, streak, studiedToday });

  if (items.length === 0) return null;

  const act = (a: NonNullable<Insight["action"]>) => {
    if (a.kind === "start" && a.courseId) startStudy(a.courseId);
    else if (a.kind === "tasks") nav.push("/pano");
    else if (a.kind === "journal") nav.push("/gunluk");
    else if (a.kind === "area" && a.courseId) nav.push(`/alanlar/${a.courseId}`);
    else if (a.kind === "schedule") nav.push("/takvim");
  };

  return (
    <SectionCard
      title="Öneriler"
      meta={<span className="flex items-center gap-1"><Sparkles className="size-3.5" aria-hidden /> verilerine göre</span>}
      dense
    >
      {items.length === 0 ? (
        <p className="text-13 text-ink-muted">Her şey yolunda görünüyor. Programına devam et.</p>
      ) : (
        <ul className="stagger -my-1 flex flex-col divide-y divide-line">
          {items.map((i) => {
            const t = TONE[i.tone];
            const Icon = t.icon;
            return (
              <li key={i.id} className="flex items-center gap-3 py-2.5">
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", t.cls)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm font-medium">{i.title}</p>
                  <p className="text-13 text-ink-muted">{i.detail}</p>
                </div>
                {i.action && (
                  <Button variant="ghost" size="sm" className="shrink-0 text-accent-text" onClick={() => act(i.action!)}>
                    <span className="max-sm:sr-only">{i.action.label}</span> <ArrowRight />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
