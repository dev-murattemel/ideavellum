"use client";

import { useActiveCourses } from "@/lib/data/hooks";
import { cn } from "@/lib/utils";

/** Derse göre süzme: yatay kaydırılabilir çipler */
export function CourseFilterChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const courses = useActiveCourses();
  const chip = (id: string, label: string, color?: string) => {
    const active = value === id;
    return (
      <button
        key={id}
        type="button"
        role="radio"
        aria-checked={active}
        data-course={color}
        onClick={() => onChange(id)}
        className={cn(
          "inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 text-13 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active
            ? color ? "border-transparent bg-course text-course-fg" : "border-transparent bg-ink text-page"
            : "border-line bg-surface text-ink-muted hover:text-foreground",
        )}
      >
        {color && <span className="size-2 rounded-full bg-course-solid" aria-hidden />}
        {label}
      </button>
    );
  };
  return (
    <div role="radiogroup" aria-label="Derse göre süz" className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
      {chip("all", "Tümü")}
      {courses.map((c) => chip(c.id, c.name, c.color))}
      {chip("none", "Kişisel")}
    </div>
  );
}
