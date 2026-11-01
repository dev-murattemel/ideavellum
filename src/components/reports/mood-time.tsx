"use client";

import { MOODS, moodOf } from "@/components/journal/moods";
import { useRows } from "@/lib/data/hooks";
import { fmt, formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";

type Day = { date: Date; key: string; minutes: number };

/**
 * Ruh hali ve ayrılan süre yan yana: her gün bir sütun (süre gri çubuk, ruh hali renkli nokta).
 * Altında tek cümlelik çıkarım: iyi günlerde mi daha çok zaman ayırıyorsun?
 */
export function MoodTime({ days }: { days: Day[] }) {
  const journal = useRows("journal_entries");
  const mood = new Map(journal.filter((e) => e.mood).map((e) => [e.date, e.mood as number]));
  const max = Math.max(60, ...days.map((d) => d.minutes));
  const withMood = days.filter((d) => mood.has(d.key));
  const avg = (xs: Day[]) => (xs.length ? Math.round(xs.reduce((s, d) => s + d.minutes, 0) / xs.length) : null);
  const good = avg(withMood.filter((d) => (mood.get(d.key) ?? 0) >= 4));
  const low = avg(withMood.filter((d) => (mood.get(d.key) ?? 5) <= 2));

  if (!withMood.length) {
    return <p className="text-13 text-ink-muted">Bu dönemde günlükte ruh hali işaretlenmemiş. Günlükten ya da Bugün ekranından ruh halini seçtikçe burada ayrılan süreyle yan yana görünecek.</p>;
  }

  const insight =
    good !== null && low !== null
      ? good > low
        ? `İyi hissettiğin günlerde ortalama ${formatDuration(good)}, zor günlerde ${formatDuration(low)} ayırdın.`
        : `Zor günlerde bile ortalama ${formatDuration(low)} ayırmışsın; iyi günlerde ${formatDuration(good)}.`
      : `${withMood.length} günün ruh hali işaretli.`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-44 items-end gap-1" role="img" aria-label={days.map((d) => `${fmt(d.date, "d MMM")}: ${formatDuration(d.minutes)}${mood.has(d.key) ? `, ${moodOf(mood.get(d.key))?.label}` : ""}`).join("; ")}>
        {days.map((d) => {
          const m = moodOf(mood.get(d.key));
          return (
            <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${fmt(d.date, "d MMMM")} · ${formatDuration(d.minutes)}${m ? ` · ${m.label}` : ""}`}>
              <span data-course={m?.color} className={cn("size-2.5 shrink-0 rounded-full", m ? "bg-course-solid" : "bg-transparent")} />
              <div className="flex h-32 w-full items-end justify-center">
                <div className={cn("w-full max-w-9 rounded-t-[3px]", d.minutes ? "bg-ink-subtle/35" : "bg-sunken")} style={{ height: d.minutes ? `${Math.max(4, (d.minutes / max) * 100)}%` : 3 }} />
              </div>
              <span className="text-[10px] leading-none text-ink-subtle">{days.length > 7 ? fmt(d.date, "d") : fmt(d.date, "EEE")}</span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-13">{insight}</p>
        <ul className="flex flex-wrap gap-3" aria-label="Ruh hali renkleri">
          {MOODS.map((m) => (
            <li key={m.value} data-course={m.color} className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="size-2 rounded-full bg-course-solid" aria-hidden /> {m.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
