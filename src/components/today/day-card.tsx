"use client";

import { ArrowRight, Plus, Quote as QuoteIcon } from "lucide-react";

import { MoodPicker } from "@/components/journal/mood-picker";
import { promptFor } from "@/components/journal/moods";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { docToText } from "@/lib/data/tiptap";
import { quoteOfDay } from "@/lib/quotes";
import { AppLink } from "@/lib/nav/nav-context";
import { ui } from "@/lib/ui-store";

/** Bugün ekranının yan kartı: günün sözü + ruh hali + günlük girişi */
export function DayCard({ today }: { today: string }) {
  const quotes = useRows("quotes");
  const journal = useRows("journal_entries");
  const quote = quoteOfDay(quotes, today);
  const entry = journal.find((e) => e.date === today);
  const snippet = entry ? docToText(entry.content, 140) : "";

  const setMood = (mood: number | null) => {
    if (entry) data().update("journal_entries", entry.id, { mood });
    else data().insert("journal_entries", { date: today, content: { type: "doc", content: [] }, mood, tags: [] });
  };

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Günün sözü" className="relative overflow-hidden rounded-xl bg-[#1D1D21] p-5 text-white dark:bg-surface dark:text-foreground dark:ring-1 dark:ring-line">
        <QuoteIcon className="absolute top-4 right-4 size-5 text-white/20 dark:text-line-strong" aria-hidden />
        <p className="text-xs font-medium text-white/60 dark:text-ink-muted">Günün sözü</p>
        {quote ? (
          <>
            <blockquote className="mt-2 line-clamp-5 text-[15px] leading-6 font-medium">{quote.text}</blockquote>
            <p className="mt-2 text-13 text-white/60 dark:text-ink-muted">— {quote.author ?? "Ben"}</p>
          </>
        ) : (
          <div className="mt-2 flex flex-col items-start gap-3">
            <p className="text-sm text-white/80 dark:text-ink-muted">Kendi aforizmalarını ya da sevdiğin alıntıları kaydet; her gün biri burada görünsün.</p>
            <Button size="sm" onClick={() => ui().open({ type: "quote" })} className="bg-white text-[#1D1D21] shadow-none hover:bg-white/90 hover:shadow-none dark:bg-primary dark:text-primary-foreground">
              <Plus /> İlk sözünü ekle
            </Button>
          </div>
        )}
      </section>

      <section aria-labelledby="day-journal" className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 id="day-journal" className="text-sm font-semibold">Bugün nasılsın?</h2>
          <AppLink href="/gunluk" className="flex items-center gap-1 text-13 font-medium text-accent-text hover:underline">
            Günlük <ArrowRight className="size-3.5" aria-hidden />
          </AppLink>
        </div>
        <MoodPicker value={entry?.mood ?? null} onChange={setMood} />
        <AppLink href="/gunluk" className="rounded-lg bg-sunken/70 px-3 py-2.5 text-13 text-ink-muted transition-colors hover:bg-hover hover:text-foreground">
          {snippet || promptFor(today)}
        </AppLink>
      </section>
    </div>
  );
}
