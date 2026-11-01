"use client";

import { useMemo } from "react";

import { useActiveCourses, useProfile, useRows } from "@/lib/data/hooks";
import { thisWeekLogs } from "@/lib/domain/stats";

/** Aktif derslerin bu haftaki çalışma süresi ve hedefi (AI odak önerisi için) */
export function useCourseStatsMap(now: Date) {
  const courses = useActiveCourses();
  const logs = useRows("study_logs");
  const tz = useProfile().timezone;
  return useMemo(() => {
    const week = thisWeekLogs(logs, now, tz);
    return courses
      .filter((c) => c.status === "active")
      .map((c) => ({ name: c.name, weekMinutes: week.filter((l) => l.course_id === c.id).reduce((s, l) => s + l.duration_minutes, 0), target: c.target_weekly_minutes ?? 0 }));
  }, [courses, logs, now, tz]);
}
