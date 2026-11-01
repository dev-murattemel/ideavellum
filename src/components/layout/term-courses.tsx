"use client";

import { Plus } from "lucide-react";

import { kindOf } from "@/lib/area-kinds";
import { useActiveCourses } from "@/lib/data/hooks";
import { AppLink, useNav } from "@/lib/nav/nav-context";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Aktif alanlar: tür ikonu alanın renginde (ilham 04'teki renk noktalı liste). */
export function TermCourses() {
  const courses = useActiveCourses();
  const { pathname } = useNav();

  return (
    <section aria-label="Aktif alanlar" className="mt-0.5 mb-1 flex flex-col">
      {courses.length === 0 ? (
        <button
          type="button"
          onClick={() => ui().open({ type: "course" })}
          className="ml-[30px] cursor-pointer rounded-md border border-dashed border-line-strong px-2.5 py-2 text-left text-xs leading-[18px] text-ink-muted hover:text-foreground"
        >
          İlk alanını ekle: ders, spor, mutfak, okuma…
        </button>
      ) : (
        <ul className="flex flex-col gap-px">
          {courses.map((c) => {
            const href = `/alanlar/${c.id}`;
            const active = pathname === href;
            const Icon = kindOf(c).icon;
            return (
              <li key={c.id}>
                <AppLink
                  href={href}
                  aria-current={active ? "page" : undefined}
                  data-course={c.color}
                  className={cn(
                    "flex h-8 items-center gap-2.5 rounded-md pr-2.5 pl-[30px] text-13 transition-colors",
                    active ? "bg-course font-medium text-course-fg" : "text-ink-muted hover:bg-hover hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-3.5 shrink-0 text-course-solid", c.status === "paused" && "opacity-40")} strokeWidth={2.2} aria-hidden />
                  <span className="truncate">{c.name}</span>
                </AppLink>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => ui().open({ type: "course" })}
              className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md pr-2.5 pl-[30px] text-13 text-ink-subtle transition-colors hover:bg-hover hover:text-foreground"
            >
              <Plus className="size-3.5 shrink-0" aria-hidden /> Alan ekle
            </button>
          </li>
        </ul>
      )}
    </section>
  );
}
