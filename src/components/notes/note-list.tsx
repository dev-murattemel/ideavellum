"use client";

import * as React from "react";
import { Pin, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveCourses, useCourseMap } from "@/lib/data/hooks";
import { docToText } from "@/lib/data/tiptap";
import type { Note } from "@/lib/data/types";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";
import { TagChip } from "@/components/tags/tag-chip";
import { tagCounts } from "@/lib/tags";
import { RowActions } from "@/components/ui/row-actions";
import { noteActions } from "@/lib/notes/actions";

export const PERSONAL = "personal";

/** Sol bölme: arama, süzgeç ve başlık + kısa özetli not listesi */
export function NoteList({
  notes,
  selectedId,
  explicit,
  onSelect,
  onCreate,
  filter,
  onFilter,
  query,
  onQuery,
  allNotes,
  tag,
  onTag,
}: {
  notes: Note[];
  selectedId: string | null;
  /** Kullanıcı bir not seçti mi? Seçmediyse ilk not sadece masaüstünde vurgulanır. */
  explicit: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  filter: string;
  onFilter: (v: string) => void;
  query: string;
  onQuery: (v: string) => void;
  /** Etiket süzgeci (tüm notlardaki etiketler) */
  allNotes: Note[];
  tag: string | null;
  onTag: (v: string | null) => void;
}) {
  const courses = useActiveCourses();
  const pinned = notes.filter((n) => n.is_pinned);
  const rest = notes.filter((n) => !n.is_pinned);
  const tags = React.useMemo(() => tagCounts(allNotes).slice(0, 12), [allNotes]);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
      <div className="flex flex-col gap-2 border-b border-line p-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <h1 className="text-base font-semibold">Notlar</h1>
          <span className="tabular text-xs text-ink-muted">{notes.length} not</span>
          <Button size="icon-sm" className="ml-auto" aria-label="Yeni not" title="Yeni not" onClick={onCreate}><Plus /></Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Notlarda ara"
            aria-label="Notlarda ara"
            className="h-9 w-full rounded-md border border-line bg-page pr-3 pl-8 text-sm outline-none placeholder:text-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
        </div>
        <Select value={filter} onValueChange={onFilter}>
          <SelectTrigger size="sm" aria-label="Süzgeç"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm notlar</SelectItem>
            <SelectItem value={PERSONAL}>Derse bağlı olmayan notlar</SelectItem>
            <SelectSeparator />
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {tags.length > 0 && (
          <div role="group" aria-label="Etikete göre süz" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
            {tags.map(([t, n]) => (
              <span key={t} title={`${n} not`} className="shrink-0">
                <TagChip tag={t} active={tag === t} onClick={() => onTag(tag === t ? null : t)} className={tag && tag !== t ? "opacity-50" : ""} />
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {notes.length === 0 && (
          <p className="px-3 py-8 text-center text-13 text-ink-muted">{query || tag ? "Eşleşen not yok." : "Henüz not yok. Sağ üstteki + ile ilk notunu yaz."}</p>
        )}
        {pinned.length > 0 && <Group label="Sabitlenenler" notes={pinned} selectedId={selectedId} explicit={explicit} onSelect={onSelect} />}
        {rest.length > 0 && <Group label={pinned.length ? "Diğer notlar" : null} notes={rest} selectedId={selectedId} explicit={explicit} onSelect={onSelect} />}
      </div>
    </div>
  );
}

function Group({ label, notes, selectedId, explicit, onSelect }: { label: string | null; notes: Note[]; selectedId: string | null; explicit: boolean; onSelect: (id: string) => void }) {
  const courses = useCourseMap();
  return (
    <section className="mb-2">
      {label && <h2 className="px-3 pt-2 pb-1.5 text-xs font-medium text-ink-subtle">{label}</h2>}
      <ul role="listbox" aria-label={label ?? "Notlar"} className="stagger flex flex-col gap-0.5">
        {notes.map((n) => {
          const course = n.course_id ? courses[n.course_id] : undefined;
          const active = n.id === selectedId;
          const preview = docToText(n.content, 110);
          return (
            <li key={n.id} role="option" aria-selected={active} className="group relative">
              <button
                type="button"
                onClick={() => onSelect(n.id)}
                className={cn(
                  "flex w-full cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && explicit && "border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04)]",
                  active && !explicit && "border-transparent hover:bg-hover/70 lg:border-line lg:bg-surface lg:shadow-[0_1px_2px_rgb(0_0_0/0.04)]",
                  !active && "border-transparent hover:bg-hover/70",
                )}
              >
                <span className="flex items-center gap-2">
                  <span data-course={course?.color} className={cn("size-2 shrink-0 rounded-full", course ? "bg-course-solid" : "border border-line-strong")} aria-hidden />
                  <span className={cn("min-w-0 flex-1 truncate text-sm font-semibold", !n.title && "text-ink-muted")}>{n.title || "Başlıksız not"}</span>
                  {n.is_pinned && <Pin className="size-3 shrink-0 fill-current text-ink-subtle transition-opacity group-hover:opacity-0" aria-label="Sabitlendi" />}
                </span>
                <span className="line-clamp-2 pl-4 text-13 leading-[18px] text-ink-muted">{preview || "Boş not"}</span>
                <span className="flex min-w-0 items-center gap-1.5 pl-4 text-xs text-ink-subtle">
                  <span className="truncate">{course?.name ?? "Genel"}</span>
                  <span aria-hidden>·</span>
                  <span className="shrink-0">{timeAgo(n.updated_at)}</span>
                  {(n.tags ?? []).slice(0, 2).map((t) => <TagChip key={t} tag={t} className="h-5 px-1.5 text-[11px]" />)}
                </span>
              </button>
              <RowActions actions={noteActions(n)} className="absolute top-2 right-2" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
