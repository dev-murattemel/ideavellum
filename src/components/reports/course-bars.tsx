"use client";

import { AppLink } from "@/lib/nav/nav-context";
import { formatDuration } from "@/lib/time";
import type { useReport } from "./use-report";

type Rows = ReturnType<typeof useReport>["perCourse"];

/**
 * Ders bazında çalışma süresi: yatay çubuklar. Her satırda ders adı ve değer yazılıdır,
 * renk yalnızca destekleyicidir. İnce çizgi işaret hedef süreyi gösterir.
 */
export function CourseBars({ rows }: { rows: Rows }) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.minutes, r.target)));
  if (!rows.length) return <p className="text-13 text-ink-muted">Aktif alan yok.</p>;
  return (
    <ul className="flex flex-col gap-3.5" aria-label="Alan bazında süre">
      {rows.map((r) => {
        const pct = (r.minutes / max) * 100;
        const targetPct = r.target ? (r.target / max) * 100 : null;
        const reached = r.target > 0 && r.minutes >= r.target;
        return (
          <li key={r.course.id} data-course={r.course.color} className="grid grid-cols-[minmax(0,8rem)_1fr] items-center gap-x-3 gap-y-1 sm:grid-cols-[minmax(0,11rem)_1fr_8.5rem]">
            <AppLink href={`/alanlar/${r.course.id}`} className="flex min-w-0 items-center gap-2 text-13 font-medium hover:underline">
              <span className="size-2 shrink-0 rounded-full bg-course-solid" aria-hidden />
              <span className="truncate">{r.course.name}</span>
            </AppLink>
            <div className="relative flex h-6 items-center" title={`${r.course.name}: ${formatDuration(r.minutes)}${r.target ? ` / hedef ${formatDuration(r.target)}` : ""}`}>
              <div className="absolute inset-x-0 top-[7px] h-3 rounded-r-[4px] bg-sunken/70" aria-hidden />
              <div className="relative h-3 rounded-r-[4px] bg-course-solid transition-[width] duration-500" style={{ width: `${Math.max(pct, r.minutes ? 1.5 : 0)}%` }} />
              {targetPct !== null && (
                <span className="absolute top-0.5 bottom-0.5 w-0.5 rounded-full bg-ink/70" style={{ left: `calc(${targetPct}% - 1px)` }} aria-hidden />
              )}
            </div>
            <span className="tabular col-start-2 text-xs text-ink-muted sm:col-start-3 sm:text-right">
              <span className="font-medium text-foreground">{formatDuration(r.minutes)}</span>
              {r.target > 0 && <span> / {formatDuration(r.target)}{reached ? " ✓" : ""}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
