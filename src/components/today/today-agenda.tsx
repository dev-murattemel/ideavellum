"use client";

import * as React from "react";
import { CircleCheck, CircleX, Clock3, Plus } from "lucide-react";

import { DueChip } from "@/components/board/due-chip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCourseMap, useRows } from "@/lib/data/hooks";
import { dayChecks, entryKey } from "@/lib/domain/session-entries";
import { PRIORITY_RANK, setTaskDone } from "@/lib/domain/tasks";
import { goTo } from "@/lib/nav/nav-context";
import { isoDate, minutesOfDay, minutesToTime, utcToWall } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { useTodayTasks } from "./today-tasks";
import type { useToday } from "./use-today";

type T = ReturnType<typeof useToday>;
const ATT = { attended: CircleCheck, missed: CircleX, postponed: Clock3 } as const;

/** Bugünün planı tek kartta: solda programdaki saatler, sağda görevler */
export function TodayAgenda({ t, now }: { t: T; now: Date }) {
  return (
    <section aria-label="Bugünün planı" className="grid overflow-hidden rounded-xl border border-line bg-surface xl:grid-cols-2">
      <Program t={t} now={now} />
      <Tasks now={now} />
    </section>
  );
}

function Head({ title, meta, onAdd, addLabel }: { title: string; meta: string; onAdd: () => void; addLabel: string }) {
  return (
    <header className="flex h-11 items-center gap-2 border-b border-line px-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <span className="tabular text-13 text-ink-muted">{meta}</span>
      <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label={addLabel} title={addLabel} onClick={onAdd}><Plus /></Button>
    </header>
  );
}

function Empty({ text, action, onAction }: { text: string; action: string; onAction: () => void }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-4 text-13 text-ink-muted">
      {text}
      <button type="button" onClick={onAction} className="cursor-pointer font-medium text-foreground underline-offset-4 hover:underline">{action}</button>
    </p>
  );
}

function Program({ t, now }: { t: T; now: Date }) {
  const entries = useRows("session_entries");
  const date = isoDate(now);
  const nowMin = minutesOfDay(now);
  const byKey = React.useMemo(() => new Map(entries.map((e) => [entryKey(e.class_session_id, e.date), e])), [entries]);

  return (
    <div className="flex min-w-0 flex-col xl:border-r xl:border-line">
      <Head title="Program" meta={t.occurrences.length ? `${t.occurrences.length} saat` : "boş"} addLabel="Takvime saat ekle" onAdd={() => ui().open({ type: "session" })} />
      {t.occurrences.length === 0 ? (
        <Empty text="Bugün takvimde saat yok." action="Takvime git" onAction={() => goTo("/takvim")} />
      ) : (
        <ul className="flex flex-col py-1.5">
          {t.occurrences.map((o) => {
            const past = o.end <= nowMin;
            const current = o.start <= nowMin && nowMin < o.end;
            const entry = byKey.get(entryKey(o.session.id, date));
            const att = t.attendanceToday.get(o.session.id);
            const Icon = att ? ATT[att] : null;
            const checks = dayChecks(entry, o.session);
            const sub = entry?.title || o.session.notes;
            return (
              <li key={o.session.id}>
                <button
                  type="button"
                  onClick={() => ui().openOccurrence({ sessionId: o.session.id, date })}
                  data-course={o.course.color}
                  className={cn("flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors outline-none hover:bg-hover/60 focus-visible:bg-hover", past && !current && "opacity-60")}
                >
                  <span className="tabular w-[92px] shrink-0 text-13 whitespace-nowrap text-ink-muted">{minutesToTime(o.start)}–{minutesToTime(o.end)}</span>
                  <span className="h-8 w-[3px] shrink-0 rounded-full bg-course-solid" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{o.course.name}</span>
                    {(sub || checks.length > 0) && (
                      <span className="tabular block truncate text-xs text-ink-muted">
                        {sub}{sub && checks.length ? " · " : ""}{checks.length ? `${checks.filter((c) => c.done).length}/${checks.length} madde` : ""}
                      </span>
                    )}
                  </span>
                  {current && <span className="rounded-full bg-course px-2 py-0.5 text-xs font-semibold text-course-fg">Şu an</span>}
                  {Icon && <Icon className="size-4 shrink-0 text-ink-muted" aria-label="Katılım işaretlendi" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Tasks({ now }: { now: Date }) {
  const { open, doneToday, all } = useTodayTasks(now);
  const courses = useCourseMap();
  const today = isoDate(now);
  // Bugün az iş varsa önümüzdeki 3 günün görevleri de görünür
  const soon = React.useMemo(() => {
    const limit = isoDate(new Date(now.getTime() + 3 * 864e5));
    return all
      .filter((x) => x.status !== "done" && x.due_at && isoDate(utcToWall(x.due_at)) > today && isoDate(utcToWall(x.due_at)) <= limit)
      .sort((a, b) => a.due_at!.localeCompare(b.due_at!) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
      .slice(0, 3);
  }, [all, now, today]);
  const add = () => ui().open({ type: "task", preset: { due_today: true } });

  const row = (task: (typeof all)[number], showDue: boolean) => {
    const done = task.status === "done";
    const course = task.course_id ? courses[task.course_id] : undefined;
    return (
      <li key={task.id} className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-hover/60">
        <Checkbox checked={done} onCheckedChange={(c) => setTaskDone(task, c === true, all)} aria-label={done ? `${task.title} görevini geri al` : `${task.title} görevini tamamla`} className="size-[18px] rounded-full" />
        <button type="button" onClick={() => ui().openTask(task.id)} className="min-w-0 flex-1 cursor-pointer text-left outline-none focus-visible:underline">
          <span className={cn("block truncate text-sm", done && "text-ink-muted line-through")}>{task.title}</span>
          {course && (
            <span data-course={course.color} className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="size-1.5 rounded-full bg-course-solid" aria-hidden />{course.name}
            </span>
          )}
        </button>
        {showDue && !done && <DueChip task={task} now={now} className="bg-sunken" />}
      </li>
    );
  };

  return (
    <div className="flex min-w-0 flex-col border-t border-line xl:border-t-0">
      <Head title="Görevler" meta={open.length ? `${open.length} açık` : doneToday.length ? `${doneToday.length} bitti` : "boş"} addLabel="Bugüne görev ekle" onAdd={add} />
      {open.length + doneToday.length === 0 && !soon.length ? (
        <Empty text="Bugün için görev yok." action="Görev ekle" onAction={add} />
      ) : (
        <>
          {open.length + doneToday.length > 0 ? (
            <ul className="flex flex-col py-1.5">{[...open, ...doneToday].map((x) => row(x, true))}</ul>
          ) : (
            <Empty text="Bugün için görev yok." action="Görev ekle" onAction={add} />
          )}
          {soon.length > 0 && (
            <>
              <p className="px-4 pt-1 text-xs font-medium text-ink-subtle">Önümüzdeki 3 gün</p>
              <ul className="flex flex-col pb-1.5">{soon.map((x) => row(x, true))}</ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
