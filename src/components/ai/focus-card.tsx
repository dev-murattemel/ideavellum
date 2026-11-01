"use client";

import { Sparkles, X } from "lucide-react";

import type { useToday } from "@/components/today/use-today";
import { useTodayTasks } from "@/components/today/today-tasks";
import { Button } from "@/components/ui/button";
import { useCourseMap } from "@/lib/data/hooks";
import { dueLabel } from "@/lib/domain/tasks";
import { useCourseStatsMap } from "@/lib/domain/course-week";
import { fmt, minutesOfDay, minutesToTime } from "@/lib/time";
import { AiLoading, AiMark, AiSampleNote } from "./ai-parts";
import { useAi, useAiEnabled } from "./use-ai";

/** "Bugün neye odaklanmalıyım?" — programa, gecikmiş görevlere ve hedef sürelere göre öneri */
export function FocusCard({ t, now }: { t: ReturnType<typeof useToday>; now: Date }) {
  const enabled = useAiEnabled();
  const ai = useAi("focus");
  const tasks = useTodayTasks(now);
  const courses = useCourseMap();
  const week = useCourseStatsMap(now);
  if (!enabled) return null;

  const ask = () => {
    const nowMin = minutesOfDay(now);
    const map = (list: typeof tasks.open) =>
      list.slice(0, 30).map((x) => ({ title: x.title, course: x.course_id ? (courses[x.course_id]?.name ?? null) : null, due: dueLabel(x, now)?.text ?? "", priority: x.priority }));
    void ai.run({
      now: fmt(now, "d MMMM EEEE HH:mm"),
      sessionsToday: t.occurrences.map((o) => ({ course: o.course.name, time: `${minutesToTime(o.start)}–${minutesToTime(o.end)}`, done: o.end <= nowMin })),
      overdue: map(tasks.open.filter((x) => dueLabel(x, now)?.tone === "overdue")),
      dueToday: map(tasks.open.filter((x) => dueLabel(x, now)?.tone !== "overdue")),
      courses: week,
    });
  };

  if (!ai.result && !ai.loading && !ai.error) {
    return (
      <button type="button" onClick={ask} className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-accent-soft/40 px-4 py-3 text-left transition-colors hover:bg-accent-soft">
        <Sparkles className="size-5 text-accent-text" aria-hidden />
        <span className="flex-1 text-sm font-medium text-accent-text">Bugün neye odaklanmalıyım?</span>
        <AiMark />
      </button>
    );
  }

  return (
    <section aria-label="Bugünün odağı" className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <AiMark />
        <h2 className="text-sm font-semibold">Bugünün odağı</h2>
        <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Kapat" onClick={ai.reset}><X /></Button>
      </div>
      {ai.loading && <AiLoading text="Programına ve görevlerine bakıyor…" />}
      {ai.error && <p className="text-13 text-destructive">{ai.error}</p>}
      {ai.result && (
        <>
          <p className="text-base font-semibold">{ai.result.data.headline}</p>
          <ol className="flex flex-col gap-2">
            {ai.result.data.items.map((it, i) => (
              <li key={i} className="flex gap-3">
                <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text">{i + 1}</span>
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{it.title}</span>
                  <span className="text-13 text-ink-muted">{it.reason}</span>
                </span>
              </li>
            ))}
          </ol>
          <AiSampleNote sample={ai.result.sample} />
        </>
      )}
    </section>
  );
}
