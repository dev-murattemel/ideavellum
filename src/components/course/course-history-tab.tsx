"use client";

import * as React from "react";
import { History, Play, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import type { Course } from "@/lib/data/types";
import { startStudy } from "@/lib/timer/start-study";
import { fmt, formatDuration, isoDate, parseDay, utcToWall, weekStart } from "@/lib/time";
import { ui } from "@/lib/ui-store";

const SOURCE = { timer: "Zamanlayıcı", manual: "Elle", session: "Program saati" } as const;

/** Dersin çalışma kayıtları, haftalara göre gruplu */
export function CourseHistoryTab({ course }: { course: Course }) {
  const logs = useRows("study_logs");
  const weeks = React.useMemo(() => {
    const list = logs.filter((l) => l.course_id === course.id).sort((a, b) => b.started_at.localeCompare(a.started_at));
    const map = new Map<string, typeof list>();
    list.forEach((l) => {
      const k = isoDate(weekStart(utcToWall(l.started_at)));
      map.set(k, [...(map.get(k) ?? []), l]);
    });
    return [...map];
  }, [logs, course.id]);

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => startStudy(course.id)}><Play className="fill-current" /> Çalışmayı başlat</Button>
      <Button variant="secondary" onClick={() => ui().open({ type: "study-log", preset: { course_id: course.id } })}><Plus /> Süre ekle</Button>
    </div>
  );

  if (!weeks.length) {
    return <EmptyState compact icon={History} title="Henüz çalışma kaydı yok" description="Zamanlayıcıyı başlattığında ya da elle süre eklediğinde kayıtlar burada haftalara göre listelenir." action={actions} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {actions}
      {weeks.map(([week, items]) => (
        <section key={week} className="overflow-hidden rounded-xl border border-line bg-surface">
          <header className="flex h-11 items-center justify-between border-b border-line bg-sunken/40 px-4 text-13">
            <h3 className="font-semibold">{fmt(parseDay(week), "d MMMM")} haftası</h3>
            <span className="tabular text-ink-muted">{formatDuration(items.reduce((s, l) => s + l.duration_minutes, 0))}</span>
          </header>
          <ul>
            {items.map((l) => {
              const d = utcToWall(l.started_at);
              return (
                <li key={l.id} className="group flex items-center gap-3 border-b border-line px-4 py-2.5 text-13 last:border-b-0">
                  <span className="w-28 shrink-0 text-ink-muted">{fmt(d, "d MMM, EEE")}</span>
                  <span className="tabular w-12 text-ink-muted">{fmt(d, "HH:mm")}</span>
                  <span className="tabular flex-1 font-medium">{formatDuration(l.duration_minutes)}</span>
                  <span className="text-xs text-ink-subtle">{SOURCE[l.source]}</span>
                  <button type="button" onClick={() => data().remove("study_logs", l.id)} aria-label="Kaydı sil" className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-subtle opacity-0 group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100">
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
