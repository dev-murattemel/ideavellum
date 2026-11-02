"use client";

import * as React from "react";
import { Check, ChevronRight, X } from "lucide-react";

import { createNote } from "@/components/notes/create-note";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data/hooks";
import { goTo } from "@/lib/nav/nav-context";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const KEY = "ideavellum-onboarding-hidden";

/** Yeni başlayan için Bugün ekranında adım adım başlangıç listesi; hepsi bitince ya da gizlenince kaybolur */
export function OnboardingCard() {
  const courses = useRows("courses");
  const sessions = useRows("class_sessions");
  const tasks = useRows("tasks");
  const notes = useRows("notes");
  const habits = useRows("habits");
  const journal = useRows("journal_entries");
  const quotes = useRows("quotes");
  const [hidden, setHidden] = React.useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });

  const steps = [
    { label: "İlk dersini ekle", hint: "Dil, spor, okuma…", done: courses.length > 0, run: () => ui().open({ type: "course" }) },
    { label: "Takvime bir saat yerleştir", hint: "Her Salı 19:00 gibi", done: sessions.length > 0, run: () => goTo("/takvim") },
    { label: "Bir alışkanlık başlat", hint: "10 sayfa oku, su iç…", done: habits.length > 0, run: () => ui().open({ type: "habit" }) },
    { label: "Bir görev ekle", hint: "Son tarihiyle", done: tasks.length > 0, run: () => ui().open({ type: "task" }) },
    { label: "İlk notunu yaz", hint: "Etiket ve görsel ekleyebilirsin", done: notes.length > 0, run: () => createNote() },
    { label: "Günlüğe iki cümle yaz", hint: "Ruh halini işaretle", done: journal.length > 0, run: () => goTo("/gunluk") },
    { label: "Bir söz kaydet", hint: "Kendi aforizman ya da alıntı", done: quotes.length > 0, run: () => ui().open({ type: "quote" }) },
  ];
  const done = steps.filter((s) => s.done).length;
  if (hidden || done === steps.length) return null;

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <section aria-labelledby="onb-title" className="relative overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div>
          <h2 id="onb-title" className="text-sm font-semibold">ideavellum&apos;a hoş geldin</h2>
          <p className="text-13 text-ink-muted">Birkaç adımda düzenini kur. {done}/{steps.length} tamam.</p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Başlangıç listesini gizle" onClick={hide}><X /></Button>
      </div>
      <div className="mx-5 mt-3 h-1 overflow-hidden rounded-full bg-sunken">
        <div className="h-full rounded-full bg-foreground transition-[width] duration-500" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ol className="grid grid-cols-1 gap-px p-2 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.label}>
            <button
              type="button"
              disabled={s.done}
              onClick={s.run}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-hover disabled:cursor-default disabled:hover:bg-transparent"
            >
              <span className={cn("tabular flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium", s.done ? "border-transparent bg-foreground text-surface" : "border-line-strong text-ink-muted")}>
                {s.done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={cn("truncate text-13 font-medium", s.done && "text-ink-muted line-through")}>{s.label}</span>
                <span className="truncate text-xs text-ink-subtle">{s.hint}</span>
              </span>
              {!s.done && <ChevronRight className="size-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
