import "server-only";

import { addDays, subDays } from "date-fns";

import type { Attendance, ClassSession, Course, Profile, StudyLog, Task } from "@/lib/data/types";
import { occurrencesOn } from "@/lib/domain/schedule";
import { minutesByDay, streak } from "@/lib/domain/stats";
import type { AdminClient } from "@/lib/supabase/admin";
import { fmt, formatDuration, isoDate, utcToWall, wallToUtc, weekStart, zonedNow } from "@/lib/time";

async function load(admin: AdminClient, userId: string) {
  const [c, s, t] = await Promise.all([
    admin.from("courses").select("*").eq("user_id", userId),
    admin.from("class_sessions").select("*").eq("user_id", userId),
    admin.from("tasks").select("*").eq("user_id", userId),
  ]);
  const courses = Object.fromEntries((c.data ?? []).map((x: Course) => [x.id, x])) as Record<string, Course>;
  const sessions = (s.data ?? []).map((x: ClassSession) => ({ ...x, start_time: x.start_time.slice(0, 5), end_time: x.end_time.slice(0, 5) }));
  return { courses, sessions, tasks: (t.data ?? []) as Task[] };
}

const dueText = (t: Task, tz: string) => {
  const d = utcToWall(t.due_at!, tz);
  const time = fmt(d, "HH:mm");
  return `${fmt(d, "d MMM")}${time === "23:59" ? "" : ` ${time}`}`;
};

export async function morningDigestData(admin: AdminClient, p: Profile, appUrl: string) {
  const { courses, sessions, tasks } = await load(admin, p.id);
  const today = zonedNow(p.timezone);
  const todayIso = isoDate(today);
  return {
    appUrl,
    name: p.full_name?.split(" ")[0],
    dateLabel: fmt(today, "d MMMM yyyy, EEEE"),
    sessions: occurrencesOn(sessions, courses, today).map((o) => ({ course: o.course.name, color: o.course.color, time: `${o.session.start_time}–${o.session.end_time}`, location: o.session.location })),
    tasks: tasks
      .filter((t) => t.status !== "done" && t.due_at && isoDate(utcToWall(t.due_at, p.timezone)) <= todayIso)
      .map((t) => ({ title: t.title, due: dueText(t, p.timezone), course: t.course_id ? courses[t.course_id]?.name : null, color: t.course_id ? courses[t.course_id]?.color : null, overdue: isoDate(utcToWall(t.due_at!, p.timezone)) < todayIso })),
  };
}

export async function overdueData(admin: AdminClient, p: Profile, appUrl: string) {
  const { courses, tasks } = await load(admin, p.id);
  const now = new Date();
  return {
    appUrl,
    tasks: tasks
      .filter((t) => t.status !== "done" && t.due_at && new Date(t.due_at) < now)
      .map((t) => ({ title: t.title, due: dueText(t, p.timezone), course: t.course_id ? courses[t.course_id]?.name : null, color: t.course_id ? courses[t.course_id]?.color : null })),
  };
}

export async function weeklyReportData(admin: AdminClient, p: Profile, appUrl: string) {
  const tz = p.timezone;
  const today = zonedNow(tz);
  const start = weekStart(today);
  const fromUtc = wallToUtc(isoDate(start), "00:00", tz).toISOString();
  const toUtc = wallToUtc(isoDate(addDays(start, 7)), "00:00", tz).toISOString();
  const { courses, tasks } = await load(admin, p.id);
  const [{ data: logs }, { data: allLogs }, { data: att }] = await Promise.all([
    admin.from("study_logs").select("*").eq("user_id", p.id).gte("started_at", fromUtc).lt("started_at", toUtc),
    admin.from("study_logs").select("started_at,duration_minutes").eq("user_id", p.id).gte("started_at", subDays(new Date(), 120).toISOString()),
    admin.from("attendance").select("*").eq("user_id", p.id).gte("date", isoDate(start)).lte("date", isoDate(addDays(start, 6))),
  ]);
  const byCourse = new Map<string, number>();
  (logs ?? []).forEach((l: StudyLog) => l.course_id && byCourse.set(l.course_id, (byCourse.get(l.course_id) ?? 0) + l.duration_minutes));
  const total = [...byCourse.values()].reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...byCourse.values());
  const a = (att ?? []) as Attendance[];
  return {
    appUrl,
    rangeLabel: `${fmt(start, "d MMM")} – ${fmt(addDays(start, 6), "d MMM yyyy")}`,
    totalLabel: formatDuration(total),
    completedTasks: tasks.filter((t) => t.completed_at && t.completed_at >= fromUtc && t.completed_at < toUtc).length,
    attendanceRate: a.length ? Math.round((a.filter((x) => x.status === "attended").length / a.length) * 100) : null,
    streak: streak(minutesByDay((allLogs ?? []) as StudyLog[], tz), today),
    courses: [...byCourse].sort((x, y) => y[1] - x[1]).map(([id, m]) => ({ name: courses[id]?.name ?? "Ders", color: courses[id]?.color ?? "slate", minutesLabel: formatDuration(m), pct: Math.round((m / max) * 100) })),
  };
}
