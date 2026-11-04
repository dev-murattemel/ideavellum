"use client";

import { Plus, Repeat } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { useNow } from "@/components/schedule/use-now";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data/hooks";
import { byHabitOrder, doneDays } from "@/lib/domain/habits";
import { isoDate } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { HabitRow } from "./habit-row";

/** Alışkanlıklar: her gün tek dokunuşla işaretlenen küçük rutinler */
export function HabitsView() {
  const habits = useRows("habits").filter((h) => !h.archived).sort(byHabitOrder);
  const checks = useRows("habit_checks");
  const now = useNow();
  const today = isoDate(now);
  const doneToday = habits.filter((h) => doneDays(h, checks).has(today)).length;
  const add = <Button onClick={() => ui().open({ type: "habit" })}><Plus /> Alışkanlık ekle</Button>;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alışkanlıklar"
        description={habits.length ? `Bugün ${doneToday}/${habits.length} tamam · küçük adımlar, her gün` : "Küçük adımlar, her gün."}
        actions={habits.length > 0 && add}
      />
      {habits.length === 0 ? (
        <EmptyState icon={Repeat} title="Henüz alışkanlık yok" description="“2 litre su iç” ya da “10 sayfa oku” gibi her gün işaretleyeceğin bir rutin ekle; serin ve ısı haritan burada büyür." action={add} />
      ) : (
        <ul className="stagger overflow-hidden rounded-xl border border-line bg-surface">
          {habits.map((h) => <HabitRow key={h.id} habit={h} checks={checks} today={now} />)}
        </ul>
      )}
    </div>
  );
}
