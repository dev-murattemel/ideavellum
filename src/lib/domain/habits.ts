import { addDays, subDays } from "date-fns";

import { data } from "@/lib/data/store";
import type { Habit, HabitCheck } from "@/lib/data/types";
import { isoDate, weekStart } from "@/lib/time";

/** Alışkanlığın işaretlendiği günler */
export function checkedDays(habitId: string, checks: HabitCheck[]) {
  return new Set(checks.filter((c) => c.habit_id === habitId).map((c) => c.date));
}

/** Art arda işaretlenen gün sayısı (bugün henüz işaretlenmediyse dünden geriye) */
export function habitStreak(days: Set<string>, today: Date) {
  let d = days.has(isoDate(today)) ? today : subDays(today, 1);
  let n = 0;
  while (days.has(isoDate(d))) {
    n++;
    d = subDays(d, 1);
  }
  return n;
}

/** Bu hafta kaç gün işaretlendi */
export function weekCount(days: Set<string>, today: Date) {
  const start = weekStart(today);
  let n = 0;
  for (let i = 0; i < 7; i++) if (days.has(isoDate(addDays(start, i)))) n++;
  return n;
}

/** Bir günü işaretler ya da işareti kaldırır */
export function toggleHabit(habit: Habit, date: string) {
  const existing = Object.values(data().habit_checks).find((c) => c.habit_id === habit.id && c.date === date);
  if (existing) data().remove("habit_checks", existing.id);
  else data().insert("habit_checks", { habit_id: habit.id, date });
}

export const byHabitOrder = (a: Habit, b: Habit) =>
  a.position && b.position ? (a.position < b.position ? -1 : 1) : a.position ? -1 : b.position ? 1 : a.created_at.localeCompare(b.created_at);
