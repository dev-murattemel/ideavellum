"use client";

import { useActiveCourses, useRows } from "@/lib/data/hooks";
import { formatDuration, timeToMinutes } from "@/lib/time";

/** Ders başına haftalık programlanmış süre */
export function WeeklyLegend() {
  const courses = useActiveCourses().filter((c) => c.status === "active");
  const sessions = useRows("class_sessions");
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Haftalık programlanan süre">
      {courses.map((c) => {
        const min = sessions
          .filter((s) => s.course_id === c.id)
          .reduce((sum, s) => sum + timeToMinutes(s.end_time) - timeToMinutes(s.start_time), 0);
        return (
          <li key={c.id} data-course={c.color} className="flex h-8 items-center gap-2 rounded-md border border-line bg-surface pr-3 pl-2.5 text-13">
            <span className="size-2 rounded-full bg-course-solid" aria-hidden />
            <span className="font-medium">{c.name}</span>
            <span className="tabular text-ink-muted">{min ? `${formatDuration(min)} / hafta` : "saat yok"}</span>
          </li>
        );
      })}
    </ul>
  );
}
