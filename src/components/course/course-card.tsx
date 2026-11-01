"use client";

import { CalendarClock, Timer } from "lucide-react";

import { useCourseTopics } from "@/lib/data/hooks";
import type { Course } from "@/lib/data/types";
import { useCourseStats } from "@/lib/domain/course-stats";
import { AppLink } from "@/lib/nav/nav-context";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";
import { TopicDots } from "./topic-dots";

export function CourseCard({ course }: { course: Course }) {
  const stats = useCourseStats(course);
  const topics = useCourseTopics(course.id);
  const target = course.target_weekly_minutes;

  return (
    <AppLink
      href={`/dersler/${course.id}`}
      data-course={course.color}
      className={cn(
        "group flex min-h-52 flex-col gap-4 rounded-xl bg-course p-4 text-course-fg transition-[transform,box-shadow] outline-none hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        course.status === "paused" && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{course.name}</h3>
          {course.code && <p className="text-xs opacity-75">{course.code}</p>}
        </div>
        {course.status === "paused" && (
          <span className="rounded-md bg-surface/60 px-2 py-0.5 text-xs font-medium">Ara verildi</span>
        )}
      </div>
      {course.goal && <p className="line-clamp-2 text-13 opacity-85">{course.goal}</p>}

      <div className="mt-auto flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span>Konular</span>
          <span className="tabular">
            {stats.topicsDone}/{stats.topicsTotal} · %{stats.progress}
          </span>
        </div>
        <TopicDots topics={topics} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-course-solid/20 pt-3 text-xs">
        <span className="tabular flex items-center gap-1.5">
          <Timer className="size-3.5" aria-hidden />
          Bu hafta {formatDuration(stats.weekMinutes)}
          {target ? ` / ${formatDuration(target)}` : ""}
        </span>
        {stats.slotLabel && (
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5" aria-hidden />
            {stats.slotLabel}
            {stats.sessions.length > 1 && ` +${stats.sessions.length - 1}`}
          </span>
        )}
      </div>
    </AppLink>
  );
}
