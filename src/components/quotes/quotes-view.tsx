"use client";

import * as React from "react";
import { Plus, Quote as QuoteIcon, Search, Shuffle } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { TagChip } from "@/components/tags/tag-chip";
import { Button } from "@/components/ui/button";
import { useProfile, useRows } from "@/lib/data/hooks";
import { quoteOfDay } from "@/lib/quotes";
import { tagCounts } from "@/lib/tags";
import { isoDate, zonedNow } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { QuoteCard } from "./quote-card";

const FILTERS = [
  { id: "all", label: "Tümü" },
  { id: "mine", label: "Benim sözlerim" },
  { id: "others", label: "Alıntılar" },
  { id: "fav", label: "Favoriler" },
] as const;

/** Aforizmalar: kendi sözlerin ve sevdiğin alıntılar; günün sözü üstte */
export function QuotesView() {
  const quotes = useRows("quotes");
  const tz = useProfile().timezone;
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]["id"]>("all");
  const [tag, setTag] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [shuffle, setShuffle] = React.useState(0);

  const today = isoDate(zonedNow(tz));
  const daily = quoteOfDay(quotes, shuffle ? `${today}-${shuffle}` : today);
  const tags = tagCounts(quotes).slice(0, 16);
  const q = query.trim().toLocaleLowerCase("tr");
  const list = quotes
    .filter((x) => (filter === "mine" ? !x.author : filter === "others" ? !!x.author : filter === "fav" ? x.is_favorite : true))
    .filter((x) => !tag || x.tags.includes(tag))
    .filter((x) => !q || `${x.text} ${x.author ?? ""} ${x.source ?? ""}`.toLocaleLowerCase("tr").includes(q))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const add = <Button onClick={() => ui().open({ type: "quote" })}><Plus /> Söz ekle</Button>;

  if (!quotes.length) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Aforizmalar" description="Kendi sözlerin ve okuduğun, duyduğun güzel cümleler." />
        <EmptyState icon={QuoteIcon} title="Henüz söz yok" description="Aklına gelen bir cümleyi ya da sevdiğin bir alıntıyı kaydet. Her sabah Bugün ekranında biri karşına çıkar." action={add} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Aforizmalar" description={`${quotes.length} söz · ${quotes.filter((x) => !x.author).length} tanesi senin`} actions={add} />

      {daily && (
        <section aria-label="Günün sözü" className="relative overflow-hidden rounded-2xl bg-[#1D1D21] px-6 py-8 text-white sm:px-10 sm:py-10 dark:bg-surface dark:text-foreground dark:ring-1 dark:ring-line">
          <span aria-hidden className="pointer-events-none absolute -top-6 left-4 font-serif text-[160px] leading-none text-white/10 select-none">“</span>
          <p className="relative text-xs font-medium tracking-wide text-white/60 dark:text-ink-muted">Günün sözü</p>
          <blockquote className="relative mt-3 max-w-3xl text-xl leading-8 font-medium tracking-[-0.01em] sm:text-2xl sm:leading-9">{daily.text}</blockquote>
          <div className="relative mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-white/70 dark:text-ink-muted">— {daily.author ?? "Ben"}{daily.source ? `, ${daily.source}` : ""}</p>
            <Button variant="ghost" size="sm" onClick={() => setShuffle((n) => n + 1)} className="text-white/70 hover:bg-white/10 hover:text-white dark:text-ink-muted">
              <Shuffle /> Başka bir söz
            </Button>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div role="tablist" aria-label="Süzgeç" className="flex gap-1 rounded-lg bg-sunken p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn("h-8 cursor-pointer rounded-md px-3 text-13 font-medium whitespace-nowrap transition-colors", filter === f.id ? "bg-surface text-foreground shadow-sm" : "text-ink-muted hover:text-foreground")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sözlerde ara" aria-label="Sözlerde ara" className="h-9 w-full rounded-md border border-line bg-surface pr-3 pl-8 text-sm outline-none placeholder:text-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15" />
        </div>
      </div>

      {tags.length > 0 && (
        <div role="group" aria-label="Etikete göre süz" className="flex flex-wrap gap-1.5">
          {tags.map(([t]) => <TagChip key={t} tag={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)} className={tag && tag !== t ? "opacity-50" : ""} />)}
        </div>
      )}

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">Bu süzgeçle eşleşen söz yok.</p>
      ) : (
        <div className="stagger columns-1 gap-4 sm:columns-2 lg:columns-3 2xl:columns-4">
          {list.map((x) => <QuoteCard key={x.id} quote={x} onTag={setTag} />)}
        </div>
      )}
    </div>
  );
}
