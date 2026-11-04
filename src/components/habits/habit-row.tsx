"use client";

import * as React from "react";
import { BookOpen, Check, Flame, MessageSquareText, Pencil } from "lucide-react";

import { RowActions } from "@/components/ui/row-actions";
import { useRow } from "@/lib/data/hooks";
import type { Habit, HabitCheck } from "@/lib/data/types";
import { checksOf, dayRatio, doneDays, fmtAmount, habitStreak, hasTarget, loggedDays, targetLabel, toggleHabit, weekCount } from "@/lib/domain/habits";
import { fmt, isoDate, weekDays, WEEKDAY_SHORT } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { HabitDayPopover } from "./habit-day-popover";
import { HabitHeatmap } from "./habit-heatmap";

/**
 * Alışkanlık satırı: bu haftanın 7 günü, seri, hedef ve ısı haritası.
 * Miktarlı alışkanlıkta güne dokununca miktar + not penceresi açılır; kısmi gün yarım dolu görünür.
 */
export function HabitRow({ habit, checks, today }: { habit: Habit; checks: HabitCheck[]; today: Date }) {
  const byDate = checksOf(habit.id, checks);
  const done = doneDays(habit, checks);
  const streak = habitStreak(loggedDays(habit.id, checks), today);
  const week = weekCount(done, today);
  const todayKey = isoDate(today);
  const reached = week >= habit.target_per_week;
  const target = targetLabel(habit);
  const resource = useRow("resources", habit.resource_id ?? undefined);
  const todayCheck = byDate.get(todayKey);
  // Miktarsız alışkanlıkta dokunuş işaretler; bugünün notu menüden açılır
  const [noteOpen, setNoteOpen] = React.useState(false);

  return (
    <li data-course={habit.color} className="group relative flex flex-col gap-4 border-b border-line px-4 py-4 transition-colors last:border-b-0 hover:bg-hover/40 lg:flex-row lg:items-center lg:gap-6">
      <div className="flex min-w-0 items-center gap-3 pr-8 lg:w-72 lg:pr-0">
        <span className="size-2.5 shrink-0 rounded-full bg-course-solid" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{habit.name}</p>
          <p className="tabular flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
            <span className={cn(reached && "font-medium text-course-fg")}>Bu hafta {week}/{habit.target_per_week}</span>
            {target && <span>· Bugün {fmtAmount(todayCheck ? (todayCheck.amount ?? habit.target_amount!) : 0)}/{target}</span>}
            {streak > 0 && <span className="flex items-center gap-0.5"><Flame className="size-3 text-[#F08A3C]" aria-hidden /> {streak} gün</span>}
          </p>
          {resource && (
            <button type="button" onClick={() => ui().openResource(resource.id)} className="mt-0.5 flex max-w-full cursor-pointer items-center gap-1 text-xs text-ink-muted outline-none hover:text-foreground focus-visible:underline">
              <BookOpen className="size-3 shrink-0" aria-hidden /><span className="truncate">{resource.title}</span>
              {resource.progress_total ? <span className="tabular shrink-0">· {resource.progress_current ?? 0}/{resource.progress_total}</span> : null}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1.5" role="group" aria-label={`${habit.name}, bu hafta`}>
        {weekDays(today).map((d, i) => {
          const key = isoDate(d);
          const check = byDate.get(key);
          const ratio = dayRatio(habit, check);
          const future = key > todayKey;
          const label = `${fmt(d, "d MMMM EEEE")}${check ? (hasTarget(habit) ? `, ${fmtAmount(check.amount ?? habit.target_amount!)} ${habit.unit ?? ""}` : ", yapıldı") : ""}${check?.note ? ", not var" : ""}`;
          const cell = (
            <button
              type="button"
              disabled={future}
              aria-pressed={ratio >= 1}
              aria-label={label}
              title={check?.note ?? undefined}
              onClick={hasTarget(habit) ? undefined : () => toggleHabit(habit, key)}
              className={cn(
                "relative flex size-10 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border text-[11px] font-medium transition-[background-color,border-color,transform] active:scale-95 disabled:cursor-default disabled:opacity-35",
                ratio >= 1 ? "border-transparent bg-course-solid text-white" : ratio > 0 ? "border-course-solid/40 text-course-fg" : "border-line text-ink-muted hover:border-line-strong",
                key === todayKey && !check && "border-foreground/40",
              )}
            >
              {ratio > 0 && ratio < 1 && <span className="absolute inset-x-0 bottom-0 bg-course-solid/25" style={{ height: `${ratio * 100}%` }} aria-hidden />}
              {ratio >= 1 ? (
                <Check className="check-pop size-4" data-state="checked" strokeWidth={3} aria-hidden />
              ) : ratio > 0 ? (
                <span className="tabular relative text-xs font-semibold">{fmtAmount(check!.amount ?? 0)}</span>
              ) : (
                WEEKDAY_SHORT[i].slice(0, 2)
              )}
              {check?.note && <span className={cn("absolute top-1 right-1 size-1.5 rounded-full", ratio >= 1 ? "bg-white" : "bg-course-solid")} aria-hidden />}
            </button>
          );
          if (hasTarget(habit) && !future) return <HabitDayPopover key={key} habit={habit} date={key} check={check}>{cell}</HabitDayPopover>;
          return key === todayKey ? (
            <HabitDayPopover key={key} habit={habit} date={key} check={check} open={noteOpen} onOpenChange={setNoteOpen}>{cell}</HabitDayPopover>
          ) : (
            <span key={key} className="contents">{cell}</span>
          );
        })}
      </div>

      <div className="hidden lg:ml-auto lg:block">
        <HabitHeatmap days={done} today={today} />
      </div>

      <RowActions
        actions={[
          ...(hasTarget(habit) ? [] : [{ label: "Bugüne not yaz", icon: MessageSquareText, onClick: () => setNoteOpen(true) }]),
          { label: "Düzenle", icon: Pencil, onClick: () => ui().open({ type: "habit", habitId: habit.id }) },
        ]}
        className="absolute top-3 right-3"
      />
    </li>
  );
}
