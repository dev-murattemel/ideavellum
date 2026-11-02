"use client";

import { Plus } from "lucide-react";

import { kindOf } from "@/lib/area-kinds";
import { useActiveCourses } from "@/lib/data/hooks";
import { AppLink, useNav } from "@/lib/nav/nav-context";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { SortableAreas } from "@/components/course/sortable-areas";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";

/** Aktif dersler: tür ikonu dersin renginde (ilham 04'teki renk noktalı liste). */
export function TermCourses() {
  const courses = useActiveCourses();
  const { pathname } = useNav();

  return (
    <section aria-label="Aktif dersler" className="mt-0.5 mb-1 flex flex-col">
      {courses.length === 0 ? (
        <button
          type="button"
          onClick={() => ui().open({ type: "course" })}
          className="ml-[30px] cursor-pointer rounded-md border border-dashed border-line-strong px-2.5 py-2 text-left text-xs leading-[18px] text-ink-muted hover:text-foreground"
        >
          İlk dersini ekle: dil, spor, okuma…
        </button>
      ) : (
        <ul className="flex flex-col gap-px">
          <SortableAreas
            items={courses}
            strategy={verticalListSortingStrategy}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            renderItem={(c) => {
            const href = `/dersler/${c.id}`;
            const active = pathname === href;
            const Icon = kindOf(c).icon;
            return (
                <AppLink
                  href={href}
                  aria-current={active ? "page" : undefined}
                  data-course={c.color}
                  className={cn(
                    "flex h-8 items-center gap-2.5 rounded-md pr-2.5 pl-[30px] text-13 transition-colors",
                    active ? "bg-course font-medium text-course-fg" : "text-ink-muted hover:bg-surface/60 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-3.5 shrink-0 text-course-solid", c.status === "paused" && "opacity-40")} strokeWidth={2.2} aria-hidden />
                  <span className="truncate">{c.name}</span>
                </AppLink>
            );
          }}
            itemAs="li"
            renderOverlay={(c) => {
              const Icon = kindOf(c).icon;
              return (
                <div data-course={c.color} className="flex h-8 items-center gap-2.5 rounded-md bg-surface pr-2.5 pl-[30px] text-13 font-medium shadow-lift ring-1 ring-line">
                  <Icon className="size-3.5 shrink-0 text-course-solid" strokeWidth={2.2} aria-hidden />
                  <span className="truncate">{c.name}</span>
                </div>
              );
            }}
          >
            {(nodes) => nodes}
          </SortableAreas>
          <li>
            <button
              type="button"
              onClick={() => ui().open({ type: "course" })}
              className="flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-md pr-2.5 pl-[30px] text-13 text-ink-subtle transition-colors hover:bg-surface/60 hover:text-foreground"
            >
              <Plus className="size-3.5 shrink-0" aria-hidden /> Ders ekle
            </button>
          </li>
        </ul>
      )}
    </section>
  );
}
