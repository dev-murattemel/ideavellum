"use client";

import * as React from "react";
import { Archive, CalendarRange, ChevronDown, LayoutGrid, Pencil, Plus } from "lucide-react";

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
import { AREA_KINDS, kindOf } from "@/lib/area-kinds";
import type { AreaKind } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function CoursesView() {
  const term = useActiveTerm();
  const courses = useActiveCourses();
  const completed = useRows("courses").filter((c) => c.status === "completed").length;
  const [kind, setKind] = React.useState<AreaKind | "all">("all");
  const kinds = AREA_KINDS.filter((k) => courses.some((c) => kindOf(c).key === k.key));
  const shown = courses.filter((c) => kind === "all" || kindOf(c).key === kind);
  const active = shown.filter((c) => c.status === "active");
  const paused = shown.filter((c) => c.status === "paused");

  const termLabel = term
    ? `${term.name} · ${fmt(parseDay(term.start_date), "d MMM")} – ${fmt(parseDay(term.end_date), "d MMM yyyy")}`
    : "Aktif dönem yok";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alanlar"
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
                  <AppLink href="/arsiv">
                    <Archive /> Arşiv ({completed})
                  </AppLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => ui().open({ type: "course" })}>
              <Plus /> Alan ekle
            </Button>
          </>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="Henüz alan yok"
          description="Ders, spor, mutfak, okuma… düzenli zaman ayırmak istediğin ilk alanı ekle."
          action={<Button onClick={() => ui().open({ type: "course" })}><Plus />Alan ekle</Button>}
        />
      ) : (
        <>
          {kinds.length > 1 && (
            <div role="tablist" aria-label="Türe göre süz" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
              {[{ key: "all" as const, label: "Tümü", icon: LayoutGrid }, ...kinds].map((k) => {
                const Icon = k.icon;
                const count = k.key === "all" ? courses.length : courses.filter((c) => kindOf(c).key === k.key).length;
                return (
                  <button
                    key={k.key}
                    role="tab"
                    aria-selected={kind === k.key}
                    onClick={() => setKind(k.key)}
                    className={cn(
                      "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-13 font-medium transition-colors",
                      kind === k.key ? "border-foreground bg-foreground text-surface" : "border-line bg-surface text-ink-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden /> {k.label}
                    <span className="tabular opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {active.map((c) => <CourseCard key={c.id} course={c} />)}
            <button
              type="button"
              onClick={() => ui().open({ type: "course" })}
              className="flex min-h-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong text-sm font-medium text-ink-muted transition-colors hover:border-primary/50 hover:bg-surface hover:text-foreground"
            >
              <Plus className="size-5" aria-hidden />
              Alan ekle
            </button>
          </div>
          {paused.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-ink-muted">Ara verilenler</h2>
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
