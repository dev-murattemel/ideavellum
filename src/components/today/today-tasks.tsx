"use client";

import * as React from "react";
import { ListTodo, Plus } from "lucide-react";

import { DueChip } from "@/components/board/due-chip";
import { PriorityFlag } from "@/components/board/priority-flag";
import { InlineEmpty } from "@/components/today/inline-empty";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCourseMap, useRows } from "@/lib/data/hooks";
import { PRIORITY_RANK, setTaskDone } from "@/lib/domain/tasks";
import { isoDate, utcToWall } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Son tarihi bugün olan ya da geciken görevler + bugün tamamlananlar */
export function useTodayTasks(now: Date) {
  const tasks = useRows("tasks");
  return React.useMemo(() => {
    const today = isoDate(now);
    const open = tasks
      .filter((t) => t.status !== "done" && t.due_at && isoDate(utcToWall(t.due_at)) <= today)
      .sort((a, b) => a.due_at!.localeCompare(b.due_at!) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    const doneToday = tasks.filter((t) => t.status === "done" && t.completed_at && isoDate(utcToWall(t.completed_at)) === today);
    return { open, doneToday, all: tasks };
  }, [tasks, now]);
}

export function TodayTasks({ now }: { now: Date }) {
  const { open, doneToday, all } = useTodayTasks(now);
  const courses = useCourseMap();
  const list = [...open, ...doneToday];

  if (list.length === 0) {
    return (
      <InlineEmpty icon={ListTodo} title="Bugün için görev yok" description="Son tarihi bugün olan ya da geciken görevler burada listelenir."
        action={<Button variant="secondary" onClick={() => ui().open({ type: "task", preset: { due_today: true } })}><Plus /> Görev ekle</Button>} />
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <ul className="-mx-2 flex flex-col">
        {list.map((task) => {
          const course = task.course_id ? courses[task.course_id] : undefined;
          const done = task.status === "done";
          return (
            <li key={task.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-hover/60">
              <Checkbox
                checked={done}
                onCheckedChange={(c) => setTaskDone(task, c === true, all)}
                aria-label={done ? `${task.title} görevini geri al` : `${task.title} görevini tamamla`}
                className="size-5 rounded-full"
              />
              <button type="button" onClick={() => ui().openTask(task.id)} className="flex min-w-0 flex-1 cursor-pointer flex-col items-start text-left outline-none focus-visible:underline">
                <span className={cn("max-w-full truncate text-sm font-medium transition-colors", done && "text-ink-muted line-through")}>{task.title}</span>
                {course && (
                  <span data-course={course.color} className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <span className="size-1.5 rounded-full bg-course-solid" aria-hidden />{course.name}
                  </span>
                )}
              </button>
              {!done && <DueChip task={task} now={now} className="bg-sunken" />}
              <PriorityFlag priority={task.priority} />
            </li>
          );
        })}
      </ul>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => ui().open({ type: "task", preset: { due_today: true } })}>
        <Plus /> Bugüne görev ekle
      </Button>
    </div>
  );
}
