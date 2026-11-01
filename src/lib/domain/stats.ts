import { addDays, subDays } from "date-fns";

import { isoDate, utcToWall, weekStart } from "@/lib/time";
import type { StudyLog } from "@/lib/data/types";

/** Çalışma kayıtlarını kullanıcının gününe göre (yyyy-MM-dd) toplar */
export function minutesByDay(logs: StudyLog[], tz?: string) {
  const map = new Map<string, number>();
  logs.forEach((l) => {
    const day = isoDate(utcToWall(l.started_at, tz));
    map.set(day, (map.get(day) ?? 0) + l.duration_minutes);
  });
  return map;
}

/** Art arda çalışılan gün sayısı (bugün henüz çalışılmadıysa dünden geriye sayar) */
export function streak(byDay: Map<string, number>, today: Date) {
  let count = 0;
  let day = byDay.get(isoDate(today)) ? today : subDays(today, 1);
  while (byDay.get(isoDate(day))) {
    count++;
    day = subDays(day, 1);
  }
  return count;
}

export function logsBetween(logs: StudyLog[], from: Date, to: Date, tz?: string) {
  const a = isoDate(from);
  const b = isoDate(to);
  return logs.filter((l) => {
    const d = isoDate(utcToWall(l.started_at, tz));
    return d >= a && d <= b;
  });
}

export function thisWeekLogs(logs: StudyLog[], today: Date, tz?: string) {
  const start = weekStart(today);
  return logsBetween(logs, start, addDays(start, 6), tz);
}

export const sumMinutes = (logs: StudyLog[]) => logs.reduce((s, l) => s + l.duration_minutes, 0);

export function minutesByCourse(logs: StudyLog[]) {
  const map = new Map<string, number>();
  logs.forEach((l) => {
    if (l.course_id) map.set(l.course_id, (map.get(l.course_id) ?? 0) + l.duration_minutes);
  });
  return map;
}
