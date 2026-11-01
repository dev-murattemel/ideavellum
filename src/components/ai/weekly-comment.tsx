"use client";

import { Sparkles } from "lucide-react";

import type { useReport } from "@/components/reports/use-report";
import { SectionCard } from "@/components/today/section-card";
import { Button } from "@/components/ui/button";
import { AiLoading, AiMark, AiSampleNote } from "./ai-parts";
import { useAi, useAiEnabled } from "./use-ai";

/** Rapora kısa yorum ve öneri ekler */
export function WeeklyComment({ r, label }: { r: ReturnType<typeof useReport>; label: string }) {
  const enabled = useAiEnabled();
  const ai = useAi("weekly");
  if (!enabled) return null;
  const ask = () =>
    void ai.run({
      range: label,
      totalMinutes: r.totalMinutes,
      targetMinutes: r.targetMinutes,
      completedTasks: r.completedTasks,
      completedTopics: r.completedTopics,
      attendanceRate: r.attendanceRate,
      streak: r.streak,
      perCourse: r.perCourse.map((c) => ({ name: c.course.name, minutes: c.minutes, target: c.target })),
    });

  return (
    <SectionCard title="Asistanın yorumu" meta={<AiMark />}>
      {!ai.result && !ai.loading && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-13 text-ink-muted">Bu dönemin sayılarını kısa bir yorum ve gelecek için öneriye dönüştürür. Sadece bu sayfadaki özet gönderilir.</p>
          <Button variant="soft" onClick={ask}><Sparkles /> Bu dönemi yorumla</Button>
          {ai.error && <p className="text-13 text-destructive">{ai.error}</p>}
        </div>
      )}
      {ai.loading && <AiLoading text="Sayılarına bakıyor…" />}
      {ai.result && (
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-6">{ai.result.data.comment}</p>
          {ai.result.data.suggestions.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {ai.result.data.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2 text-13"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />{s}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AiSampleNote sample={ai.result.sample} />
            <Button variant="ghost" size="sm" onClick={ask}>Yeniden yorumla</Button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
