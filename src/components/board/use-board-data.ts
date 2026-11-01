"use client";

import * as React from "react";
import { subDays } from "date-fns";

import { useRows } from "@/lib/data/hooks";
import { sortByPosition } from "@/lib/data/position";
import type { Task, TaskPriority, TaskStatus } from "@/lib/data/types";
import { isoDate, utcToWall, weekDays } from "@/lib/time";
import type { CardData } from "./task-card";

export type BoardFilters = {
  course: string; // "all" | "none" | id
  topic: string; // "all" | id
  priority: "all" | TaskPriority;
  due: "all" | "today" | "week" | "overdue" | "none";
};

export const DEFAULT_FILTERS: BoardFilters = { course: "all", topic: "all", priority: "all", due: "all" };

function matchesDue(t: Task, due: BoardFilters["due"], now: Date) {
  if (due === "all") return true;
  if (due === "none") return !t.due_at;
  if (!t.due_at) return false;
  const d = isoDate(utcToWall(t.due_at));
  if (due === "today") return d === isoDate(now);
  if (due === "overdue") return t.status !== "done" && utcToWall(t.due_at) < now;
  const w = weekDays(now);
  return d >= isoDate(w[0]) && d <= isoDate(w[6]);
}

/** Süzülmüş ve sütunlara ayrılmış kartlar. Bitti sütununda 14 günden eskiler gizlenir. */
export function useBoardData(filters: BoardFilters, now: Date, showOldDone: boolean) {
  const tasks = useRows("tasks");
  const courses = useRows("courses");
  const checklist = useRows("task_checklist_items");

  return React.useMemo(() => {
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
    const byTask = new Map<string, typeof checklist>();
    sortByPosition(checklist).forEach((c) => byTask.set(c.task_id, [...(byTask.get(c.task_id) ?? []), c]));
    const cutoff = subDays(now, 14).toISOString();

    const filtered = tasks.filter(
      (t) =>
        (filters.course === "all" || (filters.course === "none" ? !t.course_id : t.course_id === filters.course)) &&
        (filters.topic === "all" || t.topic_id === filters.topic) &&
        (filters.priority === "all" || t.priority === filters.priority) &&
        matchesDue(t, filters.due, now),
    );
    const columns = {} as Record<TaskStatus, CardData[]>;
    let hiddenDone = 0;
    (["todo", "in_progress", "review", "done"] as TaskStatus[]).forEach((s) => {
      let col = sortByPosition(filtered.filter((t) => t.status === s));
      if (s === "done" && !showOldDone) {
        const before = col.length;
        col = col.filter((t) => !t.completed_at || t.completed_at >= cutoff);
        hiddenDone = before - col.length;
      }
      columns[s] = col.map((task) => ({ task, course: task.course_id ? courseMap[task.course_id] : undefined, checklist: byTask.get(task.id) ?? [] }));
    });
    return { columns, hiddenDone, total: filtered.length };
  }, [tasks, courses, checklist, filters, now, showOldDone]);
}
