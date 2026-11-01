"use client";

import { Check, Flame, Pencil } from "lucide-react";

import { RowActions } from "@/components/ui/row-actions";
import type { Habit, HabitCheck } from "@/lib/data/types";
import { checkedDays, habitStreak, toggleHabit, weekCount } from "@/lib/domain/habits";
import { fmt, isoDate, weekDays, WEEKDAY_SHORT } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { HabitHeatmap } from "./habit-heatmap";

/** Alışkanlık satırı: bu haftanın 7 günü, seri, hedef ve ısı haritası */
export function HabitRow({ habit, checks, today }: { habit: Habit; checks: HabitCheck[]; today: Date }) {
  const days = checkedDays(habit.id, checks);
  const streak = habitStreak(days, today);
  const week = weekCount(days, today);
  const todayKey = isoDate(today);
  const reached = week >= habit.target_per_week;

  return (
    <li data-course={habit.color} className="group relative flex flex-col gap-4 border-b border-line px-4 py-4 transition-colors last:border-b-0 hover:bg-hover/40 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex min-w-0 items-center gap-3 lg:w-64">
        <span className="size-2.5 shrink-0 rounded-full bg-course-solid" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{habit.name}</p>
          <p className="tabular flex items-center gap-2 text-xs text-ink-muted">
            <span className={cn(reached && "font-medium text-course-fg")}>Bu hafta {week}/{habit.target_per_week}</span>
            {streak > 0 && <span className="flex items-center gap-0.5"><Flame className="size-3 text-[#F08A3C]" aria-hidden /> {streak} gün</span>}
          </p>
        </div>
      </div>

      <div className="flex gap-1.5" role="group" aria-label={`${habit.name}, bu hafta`}>
        {weekDays(today).map((d, i) => {
          const key = isoDate(d);
          const on = days.has(key);
          const future = key > todayKey;
          return (
            <button
              key={key}
              type="button"
              disabled={future}
              aria-pressed={on}
              aria-label={`${fmt(d, "d MMMM EEEE")}${on ? ", yapıldı" : ""}`}
              onClick={() => toggleHabit(habit, key)}
              className={cn(
                "flex size-10 cursor-pointer flex-col items-center justify-center rounded-lg border text-[11px] font-medium transition-[background-color,border-color,transform] active:scale-95 disabled:cursor-default disabled:opacity-35",
                on ? "border-transparent bg-course-solid text-white" : "border-line text-ink-muted hover:border-line-strong",
                key === todayKey && !on && "border-foreground/40",
              )}
            >
              {on ? <Check className="check-pop size-4" data-state="checked" strokeWidth={3} aria-hidden /> : WEEKDAY_SHORT[i].slice(0, 2)}
            </button>
          );
        })}
      </div>

      <div className="hidden lg:ml-auto lg:block">
        <HabitHeatmap days={days} today={today} />
      </div>

      <RowActions actions={[{ label: "Düzenle", icon: Pencil, onClick: () => ui().open({ type: "habit", habitId: habit.id }) }]} className="absolute top-3 right-3" />
    </li>
  );
}
