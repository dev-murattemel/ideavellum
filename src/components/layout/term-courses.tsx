"use client";

import { Plus } from "lucide-react";

import { useActiveCourses, useActiveTerm } from "@/lib/data/hooks";
import { AppLink, useNav } from "@/lib/nav/nav-context";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Aktif dönemin dersleri renk noktalarıyla (ilham 04). */
export function TermCourses() {
  const term = useActiveTerm();
  const courses = useActiveCourses();
  const { pathname } = useNav();

  return (
    <section aria-labelledby="term-courses-title" className="mt-6 flex min-h-0 flex-1 flex-col px-3">
      <div className="mb-1.5 flex items-center justify-between px-2.5">
        <h2 id="term-courses-title" className="truncate text-xs font-medium text-ink-subtle">
          {term ? term.name : "Dönem dersleri"}
        </h2>
        <button
          type="button"
          onClick={() => ui().open({ type: "course" })}
          aria-label="Ders ekle"
          className="-mr-1.5 inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-ink-subtle transition-colors hover:bg-hover hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      {courses.length === 0 ? (
        <p className="rounded-md border border-dashed border-line-strong px-2.5 py-2.5 text-xs leading-[18px] text-ink-muted">
          Henüz ders yok. Eklediğin dersler burada renk noktalarıyla görünecek.
        </p>
      ) : (
        <ul className="-mx-0.5 flex min-h-0 flex-col gap-0.5 overflow-y-auto px-0.5">
          {courses.map((c) => {
            const href = `/dersler/${c.id}`;
            const active = pathname === href;
            return (
              <li key={c.id}>
                <AppLink
                  href={href}
                  aria-current={active ? "page" : undefined}
                  data-course={c.color}
                  className={cn(
                    "flex h-8 items-center gap-3 rounded-md px-2.5 text-13 transition-colors",
                    active ? "bg-course font-medium text-course-fg" : "text-ink-muted hover:bg-hover hover:text-foreground",
                  )}
                >
                  <span className="flex size-[18px] shrink-0 items-center justify-center" aria-hidden>
                    <span className={cn("size-2 rounded-full bg-course-solid", c.status === "paused" && "opacity-40")} />
                  </span>
                  <span className="truncate">{c.name}</span>
                </AppLink>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
