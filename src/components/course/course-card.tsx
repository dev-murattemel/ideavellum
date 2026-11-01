"use client";

import { CalendarClock, Timer } from "lucide-react";

import { useCourseTopics } from "@/lib/data/hooks";
import type { Course } from "@/lib/data/types";
import { useCourseStats } from "@/lib/domain/course-stats";
import { AppLink } from "@/lib/nav/nav-context";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";
import { TopicDots } from "./topic-dots";
import { kindOf } from "@/lib/area-kinds";

export function CourseCard({ course }: { course: Course }) {
  const stats = useCourseStats(course);
  const topics = useCourseTopics(course.id);
  const target = course.target_weekly_minutes;
  const kind = kindOf(course);
  const KindIcon = kind.icon;

  return (
    <AppLink
      href={`/alanlar/${course.id}`}
      data-course={course.color}
      className={cn(
        "group flex min-h-52 flex-col gap-4 rounded-xl bg-course p-4 text-course-fg transition-[transform,box-shadow] outline-none hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        course.status === "paused" && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface/60" aria-hidden>
            <KindIcon className="size-[18px] text-course-solid" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{course.name}</h3>
            <p className="text-xs opacity-75">{kind.label}{course.code ? ` · ${course.code}` : ""}</p>
          </div>
        </div>
        {course.status === "paused" && (
          <span className="rounded-md bg-surface/60 px-2 py-0.5 text-xs font-medium">Ara verildi</span>
        )}
      </div>
      {course.goal && <p className="line-clamp-2 text-13 opacity-85">{course.goal}</p>}

      <div className="mt-auto flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span>{kind.topics}</span>
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
