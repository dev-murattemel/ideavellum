import { differenceInCalendarDays } from "date-fns";

import { kindOf } from "@/lib/area-kinds";
import type { Course, JournalEntry, StudyLog, Task } from "@/lib/data/types";
import { formatDuration, isoDate, utcToWall, weekStart } from "@/lib/time";
import { thisWeekLogs } from "./stats";

export type Insight = {
  id: string;
  tone: "warn" | "info" | "good";
  title: string;
  detail: string;
  action?: { label: string; kind: "start" | "tasks" | "journal" | "area" | "schedule"; courseId?: string };
};

export type AreaWeek = { course: Course; minutes: number; target: number; pct: number };

/** Aktif derslerin bu haftaki süreleri, hedefe göre */
export function areaWeeks(courses: Course[], logs: StudyLog[], now: Date, tz?: string): AreaWeek[] {
  const week = thisWeekLogs(logs, now, tz);
  return courses
    .filter((c) => c.status === "active")
    .map((course) => {
      const minutes = week.filter((l) => l.course_id === course.id).reduce((s, l) => s + l.duration_minutes, 0);
      const target = course.target_weekly_minutes ?? 0;
      return { course, minutes, target, pct: target ? Math.min(100, Math.round((minutes / target) * 100)) : 0 };
    })
    .sort((a, b) => (b.target ? 1 : 0) - (a.target ? 1 : 0) || a.pct - b.pct);
}

/**
 * Kurallara dayalı öneriler (yapay zekâ gerektirmez). En önemli 4 tanesi döner.
 * Örnek: "Koşu: hafta bitmeden 1 sa 45 dk daha gerekiyor."
 */
export function buildInsights(input: {
  now: Date;
  tz?: string;
  courses: Course[];
  logs: StudyLog[];
  tasks: Task[];
  journal: JournalEntry[];
  streak: number;
  studiedToday: number;
}): Insight[] {
  const { now, tz, courses, logs, tasks, journal, streak, studiedToday } = input;
  const today = isoDate(now);
  const out: (Insight & { score: number })[] = [];
  const daysLeft = 7 - differenceInCalendarDays(now, weekStart(now)); // bugün dahil

  // 1) Gecikmiş görevler
  const overdue = tasks.filter((t) => t.status !== "done" && t.due_at && isoDate(utcToWall(t.due_at, tz)) < today);
  if (overdue.length) {
    out.push({ id: "overdue", tone: "warn", score: 90 + overdue.length, title: `${overdue.length} görev gecikti`, detail: "Bugün birini bitir ya da yeni bir tarih ver; liste hafiflesin.", action: { label: "Görevlere git", kind: "tasks" } });
  }

  // 2) Seri tehlikede
  if (streak > 0 && studiedToday === 0 && now.getHours() >= 12) {
    out.push({ id: "streak", tone: "warn", score: 85, title: `${streak} günlük serin tehlikede`, detail: "Bugün henüz süre kaydetmedin; 15 dakika bile seriyi korur." });
  }

  // 3) Haftalık hedefin gerisindeki dersler (birden fazlaysa tek satırda toplanır)
  const behind = areaWeeks(courses, logs, now, tz).filter((a) => {
    if (!a.target || a.pct >= 100) return false;
    const expected = (a.target * (7 - daysLeft + 1)) / 7;
    return a.minutes < expected * 0.8;
  });
  if (behind.length === 1) {
    const a = behind[0];
    const remaining = a.target - a.minutes;
    const perDay = Math.ceil(remaining / Math.max(1, daysLeft) / 5) * 5;
    out.push({
      id: `behind-${a.course.id}`, tone: "info", score: 60 + (100 - a.pct) / 4,
      title: `${a.course.name}: haftalık hedefin gerisinde`,
      detail: `${formatDuration(a.minutes)} / ${formatDuration(a.target)}. ${daysLeft > 1 ? `Günde yaklaşık ${formatDuration(perDay)} yeter.` : `Bugün ${formatDuration(remaining)} ayırırsan hedef tamam.`}`,
      action: { label: `${kindOf(a.course).activity} başlat`, kind: "start", courseId: a.course.id },
    });
  } else if (behind.length > 1) {
    const remaining = behind.reduce((n, a) => n + a.target - a.minutes, 0);
    const names = behind.map((a) => a.course.name);
    out.push({
      id: "behind", tone: "info", score: 70,
      title: `${behind.length} alan haftalık hedefin gerisinde`,
      detail: `${names.slice(0, 3).join(", ")}${names.length > 3 ? ` ve ${names.length - 3} alan daha` : ""}. Hafta bitmeden toplam ${formatDuration(remaining)}; takvimde saat ayır.`,
      action: { label: "Takvimde planla", kind: "schedule" },
    });
  }

  // 4) Uzun süredir dokunulmayan dersler
  courses
    .filter((c) => c.status === "active")
    .forEach((c) => {
      const last = logs.filter((l) => l.course_id === c.id).reduce<string | null>((m, l) => (!m || l.started_at > m ? l.started_at : m), null);
      if (!last) return;
      const days = differenceInCalendarDays(now, utcToWall(last, tz));
      if (days >= 7) {
        out.push({ id: `idle-${c.id}`, tone: "info", score: 50 + days, title: `${c.name} ${days} gündür bekliyor`, detail: "Kısa bir oturumla geri dön ya da derse ara ver.", action: { label: "Derse git", kind: "area", courseId: c.id } });
      }
    });

  // 5) Günlük
  if (!journal.some((e) => e.date === today) && now.getHours() >= 18) {
    out.push({ id: "journal", tone: "info", score: 40, title: "Bugünü kapatmadın", detail: "Günlüğe iki cümle yaz, ruh halini işaretle.", action: { label: "Günlüğe yaz", kind: "journal" } });
  }

  // 6) İyi giden şeyler
  if (studiedToday >= 60) out.push({ id: "good-today", tone: "good", score: 30, title: `Bugün ${formatDuration(studiedToday)} ayırdın`, detail: "Güzel bir gün. Kısa bir mola hak ettin." });
  const done = areaWeeks(courses, logs, now, tz).filter((a) => a.target && a.pct >= 100);
  if (done.length) out.push({ id: "good-week", tone: "good", score: 25, title: `${done.map((a) => a.course.name).join(", ")}: haftalık hedef tamam`, detail: "Bu hafta bu ders(lar)da hedefine ulaştın." });

  return out.sort((a, b) => b.score - a.score).slice(0, 3);
}
