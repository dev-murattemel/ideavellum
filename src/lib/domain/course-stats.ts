"use client";

import { useMemo } from "react";

import { useProfile, useRows } from "@/lib/data/hooks";
import { sumMinutes, thisWeekLogs } from "@/lib/domain/stats";
import { timeToMinutes, WEEKDAY_NAMES, zonedNow } from "@/lib/time";
import type { Course } from "@/lib/data/types";

/** Ders kartı ve detay sayfası için özet sayılar */
export function useCourseStats(course: Course) {
  const topics = useRows("topics");
  const logs = useRows("study_logs");
  const sessions = useRows("class_sessions");
  const tasks = useRows("tasks");
  const tz = useProfile().timezone;

  return useMemo(() => {
    const t = topics.filter((x) => x.course_id === course.id);
    const done = t.filter((x) => x.status === "done").length;
    const inProgress = t.filter((x) => x.status === "in_progress").length;
    const courseLogs = logs.filter((l) => l.course_id === course.id);
    const now = zonedNow(tz);
    const s = sessions
      .filter((x) => x.course_id === course.id)
      .sort((a, b) => a.weekday - b.weekday || timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
    return {
      topicsTotal: t.length,
      topicsDone: done,
      topicsInProgress: inProgress,
      progress: t.length ? Math.round((done / t.length) * 100) : 0,
      totalMinutes: sumMinutes(courseLogs),
      weekMinutes: sumMinutes(thisWeekLogs(courseLogs, now, tz)),
      sessions: s,
      scheduledWeekly: s.reduce((sum, x) => sum + timeToMinutes(x.end_time) - timeToMinutes(x.start_time), 0),
      openTasks: tasks.filter((x) => x.course_id === course.id && x.status !== "done").length,
      slotLabel: s.length ? `${WEEKDAY_NAMES[s[0].weekday - 1]} ${s[0].start_time}` : null,
    };
  }, [topics, logs, sessions, tasks, course.id, tz]);
}
