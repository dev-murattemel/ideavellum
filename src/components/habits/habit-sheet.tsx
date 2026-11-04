"use client";

import { parseISO, subDays } from "date-fns";
import { BookOpen, Check, MessageSquareText, Pencil, X } from "lucide-react";

import { useNow } from "@/components/schedule/use-now";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useRow, useRows } from "@/lib/data/hooks";
import type { Habit } from "@/lib/data/types";
import { doneDays, fmtAmount, habitHistory, habitStreak, hasTarget, loggedDays, targetLabel, weekCount } from "@/lib/domain/habits";
import { fmt, isoDate } from "@/lib/time";
import { ui, useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { HabitHeatmap } from "./habit-heatmap";

/** Alışkanlığın geçmişi: her günün miktarı ve notu tek listede */
export function HabitSheetHost() {
  const id = useUI((s) => s.habitSheet);
  const open = useUI((s) => s.openHabit);
  const habit = useRow("habits", id ?? undefined);
  return (
    <Sheet open={!!habit} onOpenChange={(o) => !o && open(null)}>
      <SheetContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
        {habit && <Body key={habit.id} habit={habit} />}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string | null }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg bg-sunken px-3 py-2">
      <span className="truncate text-xs text-ink-muted">{label}</span>
      <span className="tabular truncate text-base font-semibold">
        {value}{unit && <span className="ml-1 text-xs font-normal text-ink-muted">{unit}</span>}
      </span>
    </div>
  );
}

function Body({ habit }: { habit: Habit }) {
  const now = useNow();
  const checks = useRows("habit_checks");
  const resource = useRow("resources", habit.resource_id ?? undefined);
  const done = doneDays(habit, checks);
  const history = habitHistory(habit, checks);
  const since = isoDate(subDays(now, 29));
  const last30 = history.filter((h) => h.check.date >= since && h.amount > 0);
  const avg = last30.length ? last30.reduce((n, h) => n + h.amount, 0) / last30.length : 0;
  const notes = history.filter((h) => h.check.note).length;
  const target = targetLabel(habit);

  return (
    <>
      <SheetDescription className="sr-only">{habit.name}: geçmiş ve notlar</SheetDescription>
      <div className="flex-1 overflow-y-auto">
        <header data-course={habit.color} className="flex flex-col gap-1 bg-course px-6 pt-6 pb-5 text-course-fg">
          <SheetTitle className="pr-8 text-xl leading-7 font-semibold">{habit.name}</SheetTitle>
          <p className="text-13 opacity-85">
            {[target ? `Günlük hedef ${target}` : null, habit.target_per_week === 7 ? "Her gün" : `Haftada ${habit.target_per_week} gün`].filter(Boolean).join(" · ")}
          </p>
          {resource && (
            <button type="button" onClick={() => { ui().openHabit(null); ui().openResource(resource.id); }} className="mt-1 flex w-fit cursor-pointer items-center gap-1.5 text-13 font-medium hover:underline">
              <BookOpen className="size-4" aria-hidden /> {resource.title}
            </button>
          )}
        </header>

        <div className="flex flex-col gap-6 p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Seri" value={String(habitStreak(loggedDays(habit.id, checks), now))} unit="gün" />
            <Stat label="Bu hafta" value={String(weekCount(done, now))} unit={`/ ${habit.target_per_week}`} />
            <Stat label="Son 30 gün" value={String(last30.length)} unit="gün" />
            {hasTarget(habit)
              ? <Stat label="Günlük ort." value={fmtAmount(Math.round(avg * 10) / 10)} unit={habit.unit} />
              : <Stat label="Not" value={String(notes)} />}
          </div>

          <section data-course={habit.color} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Son 12 hafta</h3>
            <HabitHeatmap days={done} today={now} />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Günler ve notlar</h3>
            {history.length === 0 ? (
              <p className="text-13 text-ink-muted">Henüz kayıt yok. Alışkanlıklar sayfasında bir güne dokunup işaretle ya da not yaz.</p>
            ) : (
              <ul data-course={habit.color} className="flex flex-col">
                {history.slice(0, 60).map(({ check, ratio, amount }) => (
                  <li key={check.id} className="flex gap-3 border-b border-line py-2.5 last:border-b-0">
                    <span className="w-24 shrink-0 text-13 text-ink-muted first-letter:uppercase">{fmt(parseISO(check.date), "d MMM EEE")}</span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {hasTarget(habit) ? (
                          <>
                            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-sunken" aria-hidden>
                              <span className="block h-full rounded-full bg-course-solid" style={{ width: `${ratio * 100}%` }} />
                            </span>
                            <span className="tabular text-13 font-medium">{fmtAmount(amount)} / {fmtAmount(habit.target_amount!)} {habit.unit}</span>
                          </>
                        ) : (
                          <span className={cn("flex items-center gap-1 text-13 font-medium", ratio < 1 && "text-ink-muted")}>
                            {ratio >= 1 ? <Check className="size-3.5 text-course-fg" aria-hidden /> : <X className="size-3.5" aria-hidden />}
                            {ratio >= 1 ? "Yapıldı" : "Yapılmadı"}
                          </span>
                        )}
                      </div>
                      {check.note && (
                        <p className="flex gap-1.5 text-13 leading-5 whitespace-pre-line">
                          <MessageSquareText className="mt-0.5 size-3.5 shrink-0 text-ink-subtle" aria-hidden />{check.note}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface p-4">
        <Button variant="secondary" onClick={() => ui().open({ type: "habit", habitId: habit.id })}><Pencil /> Düzenle</Button>
      </footer>
    </>
  );
}
