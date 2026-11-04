"use client";

import { Flame, Target, Timer } from "lucide-react";

import { useProfile, useRows } from "@/lib/data/hooks";
import { greeting } from "@/lib/dates";
import { quoteOfDay } from "@/lib/quotes";
import { formatDuration, isoDate } from "@/lib/time";

/**
 * Bugün başlığı: selam + günün sözü tek satır; sağda üç küçük sayaç
 * (bugün ayrılan süre, seri, bu hafta / hedef).
 */
export function TodayHeader({ now, studied, streak, week }: { now: Date; studied: number; streak: number; week: { minutes: number; target: number } }) {
  const profile = useProfile();
  const quote = quoteOfDay(useRows("quotes"), isoDate(now));
  const firstName = profile.full_name?.split(" ")[0];
  const chips = [
    { icon: Timer, label: "Bugün", value: formatDuration(studied) },
    { icon: Flame, label: "Seri", value: `${streak} gün` },
    { icon: Target, label: "Bu hafta", value: week.target ? `${formatDuration(week.minutes)} / ${formatDuration(week.target)}` : formatDuration(week.minutes) },
  ];
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">
          {greeting(new Date(), profile.timezone)}{firstName ? `, ${firstName}` : ""}
        </h1>
        {quote && (
          <p className="max-w-[640px] truncate text-13 text-ink-muted" title={`${quote.text} — ${quote.author ?? "Ben"}`}>
            “{quote.text}” <span className="text-ink-subtle">— {quote.author ?? "Ben"}</span>
          </p>
        )}
      </div>
      <dl className="flex flex-wrap items-center gap-2">
        {chips.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-13">
            <Icon className="size-3.5 text-ink-subtle" aria-hidden />
            <dt className="text-ink-muted">{label}</dt>
            <dd className="tabular font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
