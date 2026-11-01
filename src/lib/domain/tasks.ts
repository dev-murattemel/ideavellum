import { differenceInCalendarDays } from "date-fns";

import { positionAtEnd, positionAtStart } from "@/lib/data/position";
import { data } from "@/lib/data/store";
import type { AttendanceStatus, Task, TaskPriority, TaskStatus } from "@/lib/data/types";
import { formatShortDate, fmt, utcToWall } from "@/lib/time";

export const STATUSES: { id: TaskStatus; label: string; dot: string }[] = [
  { id: "todo", label: "Yapılacak", dot: "bg-ink-subtle" },
  { id: "in_progress", label: "Devam ediyor", dot: "bg-[var(--sky-solid)]" },
  { id: "review", label: "Gözden geçir", dot: "bg-[var(--butter-solid)]" },
  { id: "done", label: "Bitti", dot: "bg-[var(--mint-solid)]" },
];
export const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.id, s.label])) as Record<TaskStatus, string>;

export const PRIORITIES: { id: TaskPriority; label: string; color: string }[] = [
  { id: "urgent", label: "Acil", color: "text-[var(--rose-solid)]" },
  { id: "high", label: "Yüksek", color: "text-[var(--peach-solid)]" },
  { id: "medium", label: "Orta", color: "text-[var(--sky-solid)]" },
  { id: "low", label: "Düşük", color: "text-ink-subtle" },
];
export const PRIORITY_META = Object.fromEntries(PRIORITIES.map((p) => [p.id, p])) as Record<TaskPriority, (typeof PRIORITIES)[number]>;
export const PRIORITY_RANK: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function isOverdue(t: Task, now: Date) {
  // now: kullanıcı saat dilimindeki duvar saati
  return t.status !== "done" && !!t.due_at && utcToWall(t.due_at) < now;
}

/** "Bugün 18:00", "Yarın", "3 gün gecikti", "12 Kas" */
export function dueLabel(t: Task, now: Date) {
  if (!t.due_at) return null;
  const d = utcToWall(t.due_at);
  const diff = differenceInCalendarDays(d, now);
  const time = fmt(d, "HH:mm");
  const hasTime = time !== "23:59";
  if (t.status !== "done" && diff < 0) return { text: diff === -1 ? "Dün" : `${-diff} gün gecikti`, tone: "overdue" as const };
  if (diff === 0) return { text: hasTime ? `Bugün ${time}` : "Bugün", tone: isOverdue(t, now) ? ("overdue" as const) : ("today" as const) };
  if (diff === 1) return { text: hasTime ? `Yarın ${time}` : "Yarın", tone: "soon" as const };
  return { text: formatShortDate(d), tone: "later" as const };
}

/** Görevi tamamla / geri al: Bitti sütununun başına taşır */
export function setTaskDone(task: Task, done: boolean, all: Task[]) {
  const target: TaskStatus = done ? "done" : "todo";
  const col = all.filter((t) => t.status === target && t.id !== task.id);
  data().update("tasks", task.id, {
    status: target,
    completed_at: done ? new Date().toISOString() : null,
    position: done ? positionAtStart(col) : positionAtEnd(col),
  });
}

/** Bir ders saatinin o günkü yoklamasını kaydeder (varsa günceller). */
export function setAttendance(sessionId: string, date: string, status: AttendanceStatus) {
  const existing = Object.values(data().attendance).find((a) => a.class_session_id === sessionId && a.date === date);
  if (existing) data().update("attendance", existing.id, { status });
  else data().insert("attendance", { class_session_id: sessionId, date, status, note: null });
}

export { taskReminderAt } from "./task-time";
