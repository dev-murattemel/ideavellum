"use client";

import { ArrowRight, Check, Flame, Plus } from "lucide-react";

import { SectionCard } from "@/components/today/section-card";
import { useRows } from "@/lib/data/hooks";
import { HabitDayPopover } from "@/components/habits/habit-day-popover";
import { byHabitOrder, checksOf, dayRatio, doneDays, fmtAmount, habitStreak, hasTarget, loggedDays, toggleHabit } from "@/lib/domain/habits";
import { AppLink } from "@/lib/nav/nav-context";
import { isoDate } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

/** Bugün ekranında alışkanlıklar: tek dokunuşla işaretle */
export function HabitsCard({ now }: { now: Date }) {
  const habits = useRows("habits").filter((h) => !h.archived).sort(byHabitOrder);
  const checks = useRows("habit_checks");
  const today = isoDate(now);
  const done = habits.filter((h) => doneDays(h, checks).has(today)).length;

  return (
    <SectionCard title="Alışkanlıklar" meta={habits.length ? <AppLink href="/aliskanliklar" className="flex items-center gap-1 hover:text-foreground">{done}/{habits.length} <ArrowRight className="size-3.5" aria-hidden /></AppLink> : undefined}>
      {habits.length === 0 ? (
        <button type="button" onClick={() => ui().open({ type: "habit" })} className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-3 text-left text-13 text-ink-muted hover:text-foreground">
          <Plus className="size-4" aria-hidden /> İlk alışkanlığını ekle (ör. 10 sayfa oku)
        </button>
      ) : (
        <ul className="-mx-1 flex flex-col">
          {habits.map((h) => {
            const check = checksOf(h.id, checks).get(today);
            const ratio = dayRatio(h, check);
            const on = ratio >= 1;
            const streak = habitStreak(loggedDays(h.id, checks), now);
            const row = (
              <button type="button" aria-pressed={on} onClick={hasTarget(h) ? undefined : () => toggleHabit(h, today)} className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-hover/60">
                <span
                  className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors", on ? "border-course-solid bg-course-solid text-white" : ratio > 0 ? "border-course-solid" : "border-line-strong")}
                  style={ratio > 0 && !on ? { background: `conic-gradient(var(--course-solid) ${ratio * 360}deg, transparent 0)` } : undefined}
                >
                  {on && <Check className="check-pop size-3.5" data-state="checked" strokeWidth={3} aria-hidden />}
                </span>
                <span className={cn("min-w-0 flex-1 truncate text-sm", on && "text-ink-muted line-through decoration-ink-subtle/50")}>{h.name}</span>
                {hasTarget(h) && <span className="tabular shrink-0 text-xs text-ink-muted">{fmtAmount(check ? (check.amount ?? h.target_amount!) : 0)}/{fmtAmount(h.target_amount!)} {h.unit}</span>}
                {streak > 0 && <span className="tabular flex shrink-0 items-center gap-0.5 text-xs text-ink-muted"><Flame className="size-3 text-[#F08A3C]" aria-hidden />{streak}</span>}
              </button>
            );
            return (
              <li key={h.id} data-course={h.color}>
                {hasTarget(h) ? <HabitDayPopover habit={h} date={today} check={check} align="start">{row}</HabitDayPopover> : row}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
