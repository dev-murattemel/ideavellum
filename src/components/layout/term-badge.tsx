"use client";

import { differenceInCalendarDays } from "date-fns";
import { CalendarRange, Plus } from "lucide-react";

import { useActiveTerm, useProfile } from "@/lib/data/hooks";
import { isoDate, parseDay, zonedNow } from "@/lib/time";
import { ui } from "@/lib/ui-store";

/** Kenar çubuğunda aktif dönem: "2026 Güz · Hafta 3/12" ve ilerleme çubuğu */
export function TermBadge() {
  const term = useActiveTerm();
  const tz = useProfile().timezone;
  const today = zonedNow(tz);

  if (!term) {
    return (
      <button
        type="button"
        onClick={() => ui().open({ type: "term" })}
        className="mx-3 mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-2 text-left text-xs text-ink-muted hover:text-foreground"
      >
        <Plus className="size-3.5" aria-hidden /> 12 haftalık bir dönem başlat
      </button>
    );
  }

  const start = parseDay(term.start_date);
  const end = parseDay(term.end_date);
  const totalWeeks = Math.max(1, Math.ceil((differenceInCalendarDays(end, start) + 1) / 7));
  const week = Math.min(totalWeeks, Math.max(1, Math.floor(differenceInCalendarDays(today, start) / 7) + 1));
  const before = isoDate(today) < term.start_date;
  const after = isoDate(today) > term.end_date;
  const pct = before ? 0 : after ? 100 : Math.round((week / totalWeeks) * 100);

  return (
    <button
      type="button"
      onClick={() => ui().open({ type: "term", termId: term.id })}
      title="Dönemi düzenle"
      className="mx-3 mt-2 flex cursor-pointer flex-col gap-1.5 rounded-lg bg-surface/70 px-3 py-2.5 text-left ring-1 ring-line transition-colors hover:bg-surface"
    >
      <span className="flex items-center justify-between gap-2 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
          <CalendarRange className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
          <span className="truncate">{term.name}</span>
        </span>
        <span className="tabular shrink-0 text-ink-muted">
          {before ? "Başlamadı" : after ? "Bitti" : `Hafta ${week}/${totalWeeks}`}
        </span>
      </span>
      <span className="h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Dönem ilerlemesi">
        <span className="block h-full rounded-full bg-foreground/70" style={{ width: `${pct}%` }} />
      </span>
    </button>
  );
}
