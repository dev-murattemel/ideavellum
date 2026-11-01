import { fmt, isoDate, utcToWall, wallToUtc } from "@/lib/time";

/** Görev hatırlatması: saatliyse 1 saat önce, saatsizse (23:59) o gün 09:00 */
export function taskReminderAt(dueAt: string, tz?: string): Date {
  const wall = utcToWall(dueAt, tz);
  if (fmt(wall, "HH:mm") === "23:59") return wallToUtc(isoDate(wall), "09:00", tz);
  return new Date(new Date(dueAt).getTime() - 3600e3);
}
