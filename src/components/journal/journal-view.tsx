"use client";

import * as React from "react";
import { subDays } from "date-fns";
import { BookMarked, Flame, Lightbulb } from "lucide-react";

import { NoteEditor } from "@/components/notes/note-editor";
import { TagInput } from "@/components/tags/tag-input";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useProfile, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { docToText } from "@/lib/data/tiptap";
import type { JournalEntry } from "@/lib/data/types";
import { fmt, isoDate, parseDay, zonedNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import { JournalCalendar } from "./journal-calendar";
import { MoodPicker } from "./mood-picker";
import { moodOf, promptFor } from "./moods";

/** Günlük: her güne bir sayfa. Yazmaya başlayınca kayıt oluşur, boş gün kayıt bırakmaz. */
export function JournalView() {
  const rows = useRows("journal_entries");
  const tz = useProfile().timezone;
  const today = isoDate(zonedNow(tz));
  const [date, setDate] = React.useState(today);
  const byDate = React.useMemo(() => new Map(rows.map((e) => [e.date, e])), [rows]);
  const entry = byDate.get(date);

  /** Kaydı yoksa oluşturur, varsa günceller */
  const save = (patch: Partial<Pick<JournalEntry, "content" | "mood" | "tags">>) => {
    const current = data().journal_entries;
    const existing = Object.values(current).find((e) => e.date === date);
    if (existing) data().update("journal_entries", existing.id, patch);
    else data().insert("journal_entries", { date, content: { type: "doc", content: [] }, mood: null, tags: [], ...patch });
  };

  let streak = 0;
  for (let d = byDate.has(today) ? parseDay(today) : subDays(parseDay(today), 1); byDate.has(isoDate(d)); d = subDays(d, 1)) streak++;
  const thisMonth = rows.filter((e) => e.date.slice(0, 7) === today.slice(0, 7)).length;
  const recent = [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Günlük"
        description="Her güne bir sayfa. Kısa da olsa yazmak, günü kapatmanın en iyi yolu."
        actions={date !== today && <Button variant="secondary" onClick={() => setDate(today)}>Bugüne dön</Button>}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[288px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-line bg-surface p-4">
            <JournalCalendar entries={byDate} selected={date} today={today} onSelect={setDate} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={Flame} label="Seri" value={`${streak} gün`} />
            <Stat icon={BookMarked} label="Bu ay" value={`${thisMonth} sayfa`} />
          </div>
          {recent.length > 0 && (
            <div className="rounded-xl border border-line bg-surface">
              <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">Son sayfalar</h2>
              <ul className="divide-y divide-line">
                {recent.map((e) => {
                  const mood = moodOf(e.mood);
                  const Icon = mood?.icon;
                  return (
                    <li key={e.id}>
                      <button type="button" onClick={() => setDate(e.date)} className={cn("flex w-full cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-hover", e.date === date && "bg-hover")}>
                        <span className="flex items-center gap-1.5 text-13 font-medium">
                          {fmt(parseDay(e.date), "d MMMM, EEEE")}
                          {Icon && <Icon data-course={mood.color} className="size-3.5 text-course-solid" aria-label={mood.label} />}
                        </span>
                        <span className="line-clamp-1 text-xs text-ink-muted">{docToText(e.content, 90) || "Sadece ruh hali"}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>

        <article className="flex min-w-0 flex-col rounded-xl border border-line bg-surface">
          <header className="flex flex-col gap-4 border-b border-line px-5 pt-5 pb-4 sm:px-8 sm:pt-7">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">{fmt(parseDay(date), "d MMMM yyyy")}</h2>
              <span className="text-sm text-ink-muted">{fmt(parseDay(date), "EEEE")}{date === today ? " · Bugün" : ""}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-ink-muted">Bugün nasılsın?</span>
              <MoodPicker value={entry?.mood ?? null} onChange={(mood) => save({ mood })} />
            </div>
            <TagInput value={entry?.tags ?? []} onChange={(tags) => save({ tags })} placeholder="Etiket ekle (ör. aile, iş, spor)" />
            <p className="flex items-start gap-2 rounded-lg bg-accent-soft/60 px-3 py-2 text-13 text-accent-text">
              <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden /> {promptFor(date)}
            </p>
          </header>
          <div className="px-3 pb-6 sm:px-6">
            <NoteEditor
              key={date}
              content={entry?.content ?? { type: "doc", content: [] }}
              onChange={(content) => save({ content })}
              placeholder="Yazmaya başla…"
              toolbarClassName="-mx-3 border-x-0 sm:-mx-6 px-2 sm:px-4"
              contentClassName="px-2 pt-4 min-h-80"
            />
          </div>
        </article>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs text-ink-muted"><Icon className="size-3.5" aria-hidden /> {label}</span>
      <span className="tabular text-lg font-semibold">{value}</span>
    </div>
  );
}
