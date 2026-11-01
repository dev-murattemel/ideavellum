"use client";

import * as React from "react";
import { ArrowLeft, CircleCheckBig, Ellipsis, Pencil, Play, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRow } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import type { Course } from "@/lib/data/types";
import { useCourseStats } from "@/lib/domain/course-stats";
import { AppLink, useNav } from "@/lib/nav/nav-context";
import { fmt, formatDuration, parseDay } from "@/lib/time";
import { startStudy } from "@/lib/timer/start-study";
import { ui } from "@/lib/ui-store";

/** Ders detayının renkli başlık alanı (ilham 04) */
export function CourseHeader({ course }: { course: Course }) {
  const term = useRow("terms", course.term_id);
  const stats = useCourseStats(course);
  const nav = useNav();
  const [confirm, setConfirm] = React.useState(false);
  const day = (s: string | null) => (s ? fmt(parseDay(s), "d MMM yyyy") : "—");

  const meta = [
    { label: "Dönem", value: term?.name ?? "Dönemsiz" },
    { label: "Başlangıç", value: day(course.start_date) },
    { label: course.status === "completed" ? "Tamamlandı" : "Hedef bitiş", value: course.completed_at ? fmt(new Date(course.completed_at), "d MMM yyyy") : day(course.target_end_date) },
    { label: "Toplam çalışma", value: formatDuration(stats.totalMinutes) },
  ];

  return (
    <header data-course={course.color} className="relative overflow-hidden rounded-2xl bg-course p-5 text-course-fg sm:p-7">
      <svg aria-hidden className="pointer-events-none absolute -top-16 -right-10 h-72 w-72 text-course-solid opacity-[0.14]" viewBox="0 0 200 200">
        <circle cx="120" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="18" />
        <circle cx="60" cy="150" r="46" fill="none" stroke="currentColor" strokeWidth="12" />
      </svg>

      <div className="relative flex items-start justify-between gap-3">
        <AppLink href="/dersler" className="-ml-1 inline-flex items-center gap-1.5 rounded-md px-1 text-13 font-medium opacity-80 hover:opacity-100">
          <ArrowLeft className="size-4" aria-hidden /> Dersler
        </AppLink>
        <div className="flex items-center gap-2">
          {course.status === "active" && (
            <Button size="sm" className="bg-course-fg text-surface hover:bg-course-fg/90" onClick={() => startStudy(course.id)}>
              <Play className="fill-current" /> <span className="max-sm:hidden">Çalışmayı başlat</span>
            </Button>
          )}
          {course.status !== "completed" && (
            <Button variant="secondary" size="sm" className="border-transparent bg-surface/70 hover:bg-surface" onClick={() => ui().open({ type: "course", courseId: course.id })}>
              <Pencil /> Düzenle
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon-sm" aria-label="Diğer eylemler" className="border-transparent bg-surface/70 hover:bg-surface">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {course.status !== "completed" && (
                <DropdownMenuItem onSelect={() => ui().open({ type: "complete-course", courseId: course.id })}>
                  <CircleCheckBig /> Dersi tamamla
                </DropdownMenuItem>
              )}
              {course.status === "completed" && (
                <DropdownMenuItem onSelect={() => { data().update("courses", course.id, { status: "active", completed_at: null }); toast("Ders yeniden açıldı"); }}>
                  <RotateCcw /> Dersi yeniden aç
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}>
                <Trash2 /> Dersi sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative mt-6 flex flex-col gap-2">
        {course.code && <span className="text-13 font-medium opacity-75">{course.code}</span>}
        <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{course.name}</h1>
        {course.goal && <p className="max-w-2xl text-sm opacity-85">{course.goal}</p>}
      </div>

      <dl className="relative mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-10">
        {meta.map((m) => (
          <div key={m.label} className="flex flex-col gap-0.5">
            <dt className="text-xs opacity-70">{m.label}</dt>
            <dd className="tabular text-sm font-semibold">{m.value}</dd>
          </div>
        ))}
      </dl>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`“${course.name}” silinsin mi?`}
        description="Dersin konuları, ders saatleri, görevleri, notları, kaynakları ve çalışma geçmişi de silinir. Bu işlem geri alınamaz."
        confirmLabel="Dersi sil"
        onConfirm={() => {
          data().remove("courses", course.id);
          toast(`“${course.name}” silindi`);
          nav.push("/dersler");
        }}
      />
    </header>
  );
}
