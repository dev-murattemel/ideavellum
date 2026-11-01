"use client";

import * as React from "react";
import { addDays, endOfMonth, startOfMonth, subDays } from "date-fns";

import { useActiveCourses, useProfile, useRows } from "@/lib/data/hooks";
import { minutesByDay, streak } from "@/lib/domain/stats";
import { isoDate, utcToWall, weekStart } from "@/lib/time";

export type Period = "week" | "month";

export function periodRange(period: Period, anchor: Date) {
  const from = period === "week" ? weekStart(anchor) : startOfMonth(anchor);
  const to = period === "week" ? addDays(from, 6) : endOfMonth(anchor);
  return { from, to };
}

/** Rapor ekranının tüm sayıları: seçilen dönem (hafta/ay) için */
export function useReport(period: Period, anchor: Date, today: Date) {
  const logs = useRows("study_logs");
  const tasks = useRows("tasks");
  const topics = useRows("topics");
  const attendance = useRows("attendance");
  const sessions = useRows("class_sessions");
  const courses = useActiveCourses();
  const tz = useProfile().timezone;

  return React.useMemo(() => {
    const { from, to } = periodRange(period, anchor);
    const a = isoDate(from);
    const b = isoDate(to);
    const inRange = (iso: string | null) => !!iso && isoDate(utcToWall(iso, tz)) >= a && isoDate(utcToWall(iso, tz)) <= b;
    const periodLogs = logs.filter((l) => inRange(l.started_at));
    const byDay = minutesByDay(logs, tz);
    const days: { date: Date; key: string; minutes: number }[] = [];
    for (let d = from; d <= to; d = addDays(d, 1)) days.push({ date: d, key: isoDate(d), minutes: byDay.get(isoDate(d)) ?? 0 });

    const weeks = period === "week" ? 1 : days.length / 7;
    const perCourse = courses
      .filter((c) => c.status === "active")
      .map((c) => {
        const minutes = periodLogs.filter((l) => l.course_id === c.id).reduce((s, l) => s + l.duration_minutes, 0);
        const sIds = new Set(sessions.filter((s) => s.course_id === c.id).map((s) => s.id));
        const att = attendance.filter((x) => sIds.has(x.class_session_id) && x.date >= a && x.date <= b);
        return {
          course: c,
          minutes,
          target: c.target_weekly_minutes ? Math.round(c.target_weekly_minutes * weeks) : 0,
          attended: att.filter((x) => x.status === "attended").length,
          missed: att.filter((x) => x.status === "missed").length,
          postponed: att.filter((x) => x.status === "postponed").length,
        };
      })
      .sort((x, y) => y.minutes - x.minutes);

    const att = perCourse.reduce((s, c) => ({ ok: s.ok + c.attended, all: s.all + c.attended + c.missed + c.postponed }), { ok: 0, all: 0 });
    const heatFrom = weekStart(subDays(today, 7 * 51));
    const heat: { key: string; date: Date; minutes: number }[] = [];
    for (let d = heatFrom; d <= today; d = addDays(d, 1)) heat.push({ key: isoDate(d), date: d, minutes: byDay.get(isoDate(d)) ?? 0 });

    return {
      from,
      to,
      days,
      perCourse,
      totalMinutes: periodLogs.reduce((s, l) => s + l.duration_minutes, 0),
      targetMinutes: perCourse.reduce((s, c) => s + c.target, 0),
      completedTasks: tasks.filter((t) => t.status === "done" && inRange(t.completed_at)).length,
      completedTopics: topics.filter((t) => t.status === "done" && inRange(t.done_at)).length,
      attendanceRate: att.all ? Math.round((att.ok / att.all) * 100) : null,
      activeDays: days.filter((d) => d.minutes > 0).length,
      streak: streak(byDay, today),
      heat,
    };
  }, [period, anchor, today, logs, tasks, topics, attendance, sessions, courses, tz]);
}
