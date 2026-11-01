"use client";

import { ExternalLink, Minus, Plus } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { data } from "@/lib/data/store";
import type { Course, Resource } from "@/lib/data/types";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { Rating } from "./rating";
import { statusLabel, TYPE_META, UNIT_SHORT } from "./resource-meta";

/** İlerlemeyi tek dokunuşla artır/azalt (sayfa, dakika, bölüm) */
function bump(r: Resource, delta: number) {
  const step = r.unit === "page" ? 10 : r.unit === "minute" ? 5 : 1;
  const total = r.progress_total ?? Infinity;
  const next = Math.max(0, Math.min(total, (r.progress_current ?? 0) + delta * step));
  data().update("resources", r.id, {
    progress_current: next,
    status: next >= total ? "done" : next > 0 ? "in_progress" : "queued",
  });
}

export function ResourceRow({ r, course }: { r: Resource; course?: Course }) {
  const meta = TYPE_META[r.type];
  const Icon = meta.icon;
  const pct = r.progress_total ? ((r.progress_current ?? 0) / r.progress_total) * 100 : r.status === "done" ? 100 : 0;

  return (
    <li data-course={course?.color ?? "slate"} className="flex flex-col gap-3 border-b border-line p-4 last:border-b-0 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-course text-course-fg" title={meta.label}>
          <Icon className="size-5" strokeWidth={1.8} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => ui().open({ type: "resource", resourceId: r.id })} className="max-w-full cursor-pointer truncate text-left text-sm font-semibold outline-none hover:underline focus-visible:underline">
            {r.title}
          </button>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
            <span>{meta.label}</span>
            {r.author && <span>· {r.author}</span>}
            {course && <span>· {course.name}</span>}
            {r.url && (
              <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-accent-text hover:underline">
                · Aç <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
          </p>
          {r.summary && <p className="mt-1 line-clamp-2 text-13 text-ink-muted">{r.summary}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:w-[22rem] sm:justify-end">
        <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-xs font-medium", r.status === "done" ? "bg-course text-course-fg" : r.status === "in_progress" ? "bg-accent-soft text-accent-text" : "bg-sunken text-ink-muted")}>
          {statusLabel(r.status, r.type)}
        </span>
        {r.progress_total ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-44">
            <button type="button" onClick={() => bump(r, -1)} aria-label="İlerlemeyi azalt" className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-subtle hover:bg-hover"><Minus className="size-3.5" /></button>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Progress value={pct} tone="course" label={`${r.title} ilerlemesi`} />
              <span className="tabular truncate text-xs text-ink-muted">{r.progress_current ?? 0}/{r.progress_total} {r.unit ? UNIT_SHORT[r.unit] : ""}</span>
            </div>
            <button type="button" onClick={() => bump(r, 1)} aria-label="İlerlemeyi artır" className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-subtle hover:bg-hover"><Plus className="size-3.5" /></button>
          </div>
        ) : (
          <span className="flex-1" />
        )}
        <Rating value={r.rating} />
      </div>
    </li>
  );
}
