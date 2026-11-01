"use client";

import { CalendarClock, ListTodo, NotebookPen, Sunrise } from "lucide-react";

import { QuickAddButton } from "@/components/layout/quick-add-button";
import { InlineEmpty } from "@/components/today/inline-empty";
import { SectionCard } from "@/components/today/section-card";
import { SummaryStrip } from "@/components/today/summary-strip";
import { formatLongDate, greeting } from "@/lib/dates";
import { useProfile } from "@/lib/data/hooks";

export function TodayView() {
  const now = new Date();
  const profile = useProfile();
  const firstName = profile.full_name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-13 font-medium text-ink-muted">
          <time dateTime={now.toISOString()}>{formatLongDate(now)}</time>
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.015em]">
          {greeting(now)}
          {firstName ? `, ${firstName}` : ""}
        </h1>
      </div>

      <SummaryStrip studiedMinutes={0} completedTasks={0} streakDays={0} />

      <section
        aria-label="Şu an ya da sıradaki ders"
        className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-line-strong bg-surface p-5 sm:flex-row sm:items-center"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sunken text-ink-muted">
          <Sunrise className="size-5" strokeWidth={1.7} aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-base font-semibold">Sırada bir ders yok</h2>
          <p className="text-sm text-ink-muted">
            Bir ders ekleyip haftalık saatini girdiğinde, şu anki ders ve geri sayım burada görünecek.
          </p>
        </div>
        <QuickAddButton action="course" label="İlk dersini ekle" />
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCard title="Bugünün programı" meta="0 ders saati">
          <InlineEmpty
            icon={CalendarClock}
            title="Bugün için ders saati yok"
            description="Ders programına eklediğin saatler burada zaman çizelgesi olarak sıralanır."
          />
        </SectionCard>

        <SectionCard title="Bugünün görevleri" meta="0 görev">
          <InlineEmpty
            icon={ListTodo}
            title="Bugün için görev yok"
            description="Son tarihi bugün olan ya da geciken görevler burada listelenir."
            action={<QuickAddButton action="task" variant="secondary" />}
          />
        </SectionCard>
      </div>

      <SectionCard title="Hızlı not">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sunken text-ink-muted">
            <NotebookPen className="size-[18px]" strokeWidth={1.7} aria-hidden />
          </span>
          <p className="text-13 text-ink-muted">
            Aklına geleni buraya yazacaksın; not seçtiğin dersin altına kaydedilecek.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
