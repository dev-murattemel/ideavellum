"use client";

import * as React from "react";
import { GraduationCap, Quote } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Rating } from "@/components/resources/rating";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data/hooks";
import { AppLink } from "@/lib/nav/nav-context";
import { fmt, formatDuration } from "@/lib/time";

/** Tamamlanmış derslerin arşivi */
export function TranscriptView() {
  const courses = useRows("courses");
  const terms = useRows("terms");
  const topics = useRows("topics");
  const logs = useRows("study_logs");

  const done = React.useMemo(
    () => courses.filter((c) => c.status === "completed").sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? "")),
    [courses],
  );
  const termName = (id: string | null) => terms.find((t) => t.id === id)?.name ?? "Dönemsiz";
  const minutes = (id: string) => logs.filter((l) => l.course_id === id).reduce((s, l) => s + l.duration_minutes, 0);
  const totalMinutes = done.reduce((s, c) => s + minutes(c.id), 0);
  const avg = done.length ? done.reduce((s, c) => s + (c.final_rating ?? 0), 0) / done.length : 0;

  if (!done.length) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Transkript" description="Tamamladığın alanların arşivi ve değerlendirmesi." />
        <EmptyState icon={GraduationCap} title="Transkriptin henüz boş" description="Bir alanı tamamladığında kapanış notun ve kendine verdiğin puanla birlikte burada arşivlenecek."
          action={<Button asChild variant="secondary"><AppLink href="/alanlar">Alanlara git</AppLink></Button>} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transkript" description={`${done.length} alan tamamlandı · toplam ${formatDuration(totalMinutes)} · ortalama puan ${avg.toFixed(1)}`} />
      <ol className="flex flex-col gap-4">
        {done.map((c) => {
          const t = topics.filter((x) => x.course_id === c.id);
          return (
            <li key={c.id} data-course={c.color} className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                <div className="flex min-w-0 flex-1 gap-4">
                  <span className="w-1 shrink-0 self-stretch rounded-full bg-course-solid" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-ink-muted">{termName(c.term_id)}{c.code ? ` · ${c.code}` : ""}</p>
                    <AppLink href={`/alanlar/${c.id}`} className="text-base font-semibold hover:underline">{c.name}</AppLink>
                    {c.final_reflection && (
                      <blockquote className="mt-3 flex gap-2 text-sm text-ink-muted">
                        <Quote className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden />
                        <span>{c.final_reflection}</span>
                      </blockquote>
                    )}
                    {c.final_note && <p className="mt-2 text-13 text-ink-muted"><span className="font-medium text-foreground">Kendime not:</span> {c.final_note}</p>}
                  </div>
                </div>
                <dl className="grid shrink-0 grid-cols-4 gap-x-6 gap-y-1 text-13 sm:grid-cols-2 sm:text-right">
                  <div><dt className="text-xs text-ink-muted">Süre</dt><dd className="tabular font-medium">{formatDuration(minutes(c.id))}</dd></div>
                  <div><dt className="text-xs text-ink-muted">Konu</dt><dd className="tabular font-medium">{t.filter((x) => x.status === "done").length}/{t.length}</dd></div>
                  <div><dt className="text-xs text-ink-muted">Bitiş</dt><dd className="tabular font-medium">{c.completed_at ? fmt(new Date(c.completed_at), "d MMM yyyy") : "—"}</dd></div>
                  <div><dt className="text-xs text-ink-muted">Puan</dt><dd className="flex sm:justify-end"><Rating value={c.final_rating} /></dd></div>
                </dl>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
