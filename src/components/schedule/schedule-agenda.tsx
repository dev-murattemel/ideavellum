"use client";

import * as React from "react";
import { addDays } from "date-fns";
import { CalendarCheck2, Search } from "lucide-react";

import { useRows } from "@/lib/data/hooks";
import { occurrencesOn, type Occurrence } from "@/lib/domain/schedule";
import { entryKey } from "@/lib/domain/session-entries";
import { searchKey } from "@/lib/catalog";
import { isoDate, minutesOfDay } from "@/lib/time";
import { cn } from "@/lib/utils";
import { AgendaCard } from "./agenda-card";
import { useNow } from "./use-now";

type Tab = "today" | "upcoming" | "pending";
const TABS: { id: Tab; label: string; empty: string }[] = [
  { id: "today", label: "Bugün", empty: "Bugün takvimde bir şey yok." },
  { id: "upcoming", label: "Yaklaşan", empty: "Önümüzdeki 7 günde plan yok." },
  { id: "pending", label: "Yoklama", empty: "Yoklaması bekleyen saat yok. Harika!" },
];

/**
 * Takvimin sağındaki gündem paneli: bugünün saatleri, önümüzdeki 7 gün ve
 * son 14 günde yoklaması girilmemiş saatler.
 */
export function ScheduleAgenda({ filter }: { filter: string | null }) {
  const sessions = useRows("class_sessions");
  const courses = useRows("courses");
  const attendance = useRows("attendance");
  const entryRows = useRows("session_entries");
  const now = useNow(60_000);
  const [tab, setTab] = React.useState<Tab>("today");
  const [query, setQuery] = React.useState("");

  const lists = React.useMemo(() => {
    const map = Object.fromEntries(courses.map((c) => [c.id, c]));
    const shown = filter ? sessions.filter((s) => s.course_id === filter) : sessions;
    const on = (d: Date) => occurrencesOn(shown, map, d);
    const marked = new Set(attendance.map((a) => `${a.class_session_id}|${a.date}`));
    const nowMin = minutesOfDay(now);
    const past: Occurrence[] = [
      ...on(now).filter((o) => o.end <= nowMin),
      ...Array.from({ length: 14 }, (_, i) => on(addDays(now, -(i + 1)))).flat(),
    ];
    return {
      today: on(now),
      upcoming: Array.from({ length: 7 }, (_, i) => on(addDays(now, i + 1))).flat(),
      pending: past.filter((o) => !marked.has(`${o.session.id}|${isoDate(o.date)}`)),
    };
  }, [sessions, courses, attendance, now, filter]);

  const entries = React.useMemo(() => new Map(entryRows.map((e) => [entryKey(e.class_session_id, e.date), e])), [entryRows]);
  const attMap = React.useMemo(() => new Map(attendance.map((a) => [`${a.class_session_id}|${a.date}`, a.status])), [attendance]);
  const q = searchKey(query);
  const items = lists[tab].filter((o) => {
    if (!q) return true;
    const e = entries.get(entryKey(o.session.id, isoDate(o.date)));
    return searchKey(`${o.course.name} ${e?.title ?? ""} ${o.session.location ?? ""}`).includes(q);
  });

  return (
    <aside aria-label="Gündem" className="flex min-h-0 flex-col gap-4">
      <div className="flex h-9 items-center justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-[-0.01em]">Gündem</h2>
      </div>
      <label className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 focus-within:border-ring">
        <Search className="size-4 text-ink-subtle" aria-hidden />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ders ya da başlık ara" aria-label="Gündemde ara" className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-ink-subtle" />
      </label>
      <div role="tablist" aria-label="Gündem" className="flex gap-4 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px flex cursor-pointer items-center gap-1.5 border-b-2 pb-2.5 text-13 font-medium transition-colors outline-none focus-visible:text-foreground",
              tab === t.id ? "border-foreground text-foreground" : "border-transparent text-ink-muted hover:text-foreground",
            )}
          >
            {t.label}
            <span className={cn("tabular rounded-md px-1.5 text-xs", tab === t.id ? "bg-primary text-primary-foreground" : "bg-sunken text-ink-muted")}>
              {lists[t.id].length}
            </span>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="-mr-1 flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-8 text-center">
            <CalendarCheck2 className="size-5 text-ink-subtle" aria-hidden />
            <p className="text-13 text-ink-muted">{query ? "Aramaya uyan kayıt yok." : TABS.find((t) => t.id === tab)!.empty}</p>
          </div>
        ) : (
          items.map((o) => (
            <AgendaCard
              key={`${o.session.id}|${isoDate(o.date)}`}
              o={o}
              today={now}
              entry={entries.get(entryKey(o.session.id, isoDate(o.date)))}
              attendance={attMap.get(`${o.session.id}|${isoDate(o.date)}`)}
              askAttendance={tab === "pending" || (tab === "today" && o.end <= minutesOfDay(now))}
            />
          ))
        )}
      </div>
    </aside>
  );
}
