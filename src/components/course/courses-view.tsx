"use client";

import { BookOpen, CalendarRange, ChevronDown, GraduationCap, Pencil, Plus } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveCourses, useActiveTerm, useRows } from "@/lib/data/hooks";
import { AppLink } from "@/lib/nav/nav-context";
import { fmt, parseDay } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { CourseCard } from "./course-card";

export function CoursesView() {
  const term = useActiveTerm();
  const courses = useActiveCourses();
  const completed = useRows("courses").filter((c) => c.status === "completed").length;
  const active = courses.filter((c) => c.status === "active");
  const paused = courses.filter((c) => c.status === "paused");

  const termLabel = term
    ? `${term.name} · ${fmt(parseDay(term.start_date), "d MMM")} – ${fmt(parseDay(term.end_date), "d MMM yyyy")}`
    : "Aktif dönem yok";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dersler"
        description={termLabel}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  <CalendarRange /> Dönem <ChevronDown className="size-3.5 text-ink-subtle" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {term && (
                  <DropdownMenuItem onSelect={() => ui().open({ type: "term", termId: term.id })}>
                    <Pencil /> Dönemi düzenle
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => ui().open({ type: "term" })}>
                  <Plus /> Yeni dönem aç
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <AppLink href="/transkript">
                    <GraduationCap /> Transkript ({completed})
                  </AppLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => ui().open({ type: "course" })}>
              <Plus /> Ders ekle
            </Button>
          </>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Henüz ders yok"
          description="İlk dersini ekleyerek döneme başla."
          action={<Button onClick={() => ui().open({ type: "course" })}><Plus />Ders ekle</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {active.map((c) => <CourseCard key={c.id} course={c} />)}
            <button
              type="button"
              onClick={() => ui().open({ type: "course" })}
              className="flex min-h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong text-sm font-medium text-ink-muted transition-colors hover:border-primary/50 hover:bg-surface hover:text-foreground"
            >
              <Plus className="size-5" aria-hidden />
              Ders ekle
            </button>
          </div>
          {paused.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-ink-muted">Ara verilen dersler</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paused.map((c) => <CourseCard key={c.id} course={c} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
