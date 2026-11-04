"use client";

import { parseISO } from "date-fns";
import { Plus } from "lucide-react";

import type { Habit, HabitCheck } from "@/lib/data/types";
import { fmtAmount } from "@/lib/domain/habits";
import { fmt } from "@/lib/time";
import { ui } from "@/lib/ui-store";

type Row = { check: HabitCheck; habit: Habit; amount: number };

/** Kitaba bağlı alışkanlığın günlük kayıtları: ne kadar okundu, o güne not */
export function ReadingLog({ rows, linked }: { rows: Row[]; linked: Habit[] }) {
  if (!linked.length) {
    return (
      <button
        type="button"
        onClick={() => ui().open({ type: "habit" })}
        className="flex cursor-pointer flex-col items-start gap-1 rounded-xl border border-dashed border-line-strong px-4 py-5 text-left transition-colors hover:bg-hover/60"
      >
        <span className="flex items-center gap-2 text-sm font-medium"><Plus className="size-4" aria-hidden /> Bir okuma alışkanlığı bağla</span>
        <span className="text-13 text-ink-muted">Ör. “Günde 20 sayfa” alışkanlığını bu kitaba bağla; her gün yazdığın sayfa kitabın ilerlemesine eklenir.</span>
      </button>
    );
  }
  if (!rows.length) return <p className="text-13 text-ink-muted">Henüz kayıt yok. Alışkanlıklar sayfasında bir güne dokunup okuduğun sayfayı yaz.</p>;

  return (
    <ul className="flex flex-col">
      {rows.slice(0, 30).map(({ check, habit, amount }) => {
        const ratio = habit.target_amount ? Math.min(1, amount / habit.target_amount) : 1;
        return (
          <li key={check.id} data-course={habit.color} className="flex gap-3 border-b border-line py-2.5 last:border-b-0">
            <span className="w-24 shrink-0 text-13 text-ink-muted first-letter:uppercase">{fmt(parseISO(check.date), "d MMM EEE")}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-sunken" aria-hidden>
                  <span className="block h-full rounded-full bg-course-solid" style={{ width: `${ratio * 100}%` }} />
                </span>
                <span className="tabular text-13 font-medium">{fmtAmount(amount)}{habit.target_amount ? ` / ${fmtAmount(habit.target_amount)}` : ""} {habit.unit}</span>
              </div>
              {check.note && <p className="text-13 leading-5 whitespace-pre-line text-ink-muted">{check.note}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
