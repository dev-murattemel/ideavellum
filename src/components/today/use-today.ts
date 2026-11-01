"use client";

import * as React from "react";

import { useRows } from "@/lib/data/hooks";
import { currentAndNext, occurrencesOn } from "@/lib/domain/schedule";
import { minutesByDay, streak } from "@/lib/domain/stats";
import { isoDate, utcToWall } from "@/lib/time";

/** Bugün ekranının tüm hesapları tek yerde */
export function useToday(now: Date) {
  const sessions = useRows("class_sessions");
  const courses = useRows("courses");
  const attendance = useRows("attendance");
  const logs = useRows("study_logs");
  const tasks = useRows("tasks");
  const topics = useRows("topics");

  return React.useMemo(() => {
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
    const today = isoDate(now);
    const byDay = minutesByDay(logs);
    const att = new Map(attendance.filter((a) => a.date === today).map((a) => [a.class_session_id, a.status]));
    const currentTopic = (courseId: string) =>
      topics.filter((t) => t.course_id === courseId && t.status === "in_progress").sort((a, b) => (a.position < b.position ? -1 : 1))[0] ?? null;
    return {
      courseMap,
      occurrences: occurrencesOn(sessions, courseMap, now),
      ...currentAndNext(sessions, courseMap, now),
      attendanceToday: att,
      studiedToday: byDay.get(today) ?? 0,
      completedToday: tasks.filter((t) => t.status === "done" && t.completed_at && isoDate(utcToWall(t.completed_at)) === today).length,
      streak: streak(byDay, now),
      currentTopic,
    };
  }, [sessions, courses, attendance, logs, tasks, topics, now]);
}
