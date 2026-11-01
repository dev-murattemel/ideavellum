"use client";

import * as React from "react";
import { NotebookPen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data/hooks";
import { docToText } from "@/lib/data/tiptap";
import { useUI } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { createNote } from "./create-note";
import { NoteList, PERSONAL } from "./note-list";
import { NoteWorkspace } from "./note-workspace";

/**
 * Notlar: solda başlık + kısa özet listesi, sağda editör.
 * Mobilde önce liste görünür; not seçilince editör tam ekran açılır.
 */
export function NotesView() {
  const notes = useRows("notes");
  const explicitId = useUI((s) => s.noteEditorId);
  const openNote = useUI((s) => s.openNote);
  const [filter, setFilter] = React.useState("all");
  const [query, setQuery] = React.useState("");

  // Sayfadan çıkınca seçim temizlensin (yoksa başka sayfada not paneli açılır)
  React.useEffect(() => () => openNote(null), [openNote]);

  const list = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return notes
      .filter((n) => filter === "all" || (filter === PERSONAL ? !n.course_id : n.course_id === filter))
      .filter((n) => !q || `${n.title} ${docToText(n.content, 20000)}`.toLocaleLowerCase("tr").includes(q))
      .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.updated_at.localeCompare(a.updated_at));
  }, [notes, filter, query]);

  // Masaüstünde seçim yoksa ilk not gösterilir
  const shownId = explicitId && notes.some((n) => n.id === explicitId) ? explicitId : (list[0]?.id ?? null);
  const shown = notes.find((n) => n.id === shownId) ?? null;
  const create = () => createNote(filter !== "all" && filter !== PERSONAL ? filter : null);

  return (
    <div className="-mx-4 -mt-2 flex h-[calc(100dvh-11rem)] min-h-[520px] overflow-hidden border-y border-line bg-surface md:mx-0 md:h-[calc(100dvh-9rem)] md:rounded-xl md:border">
      <aside
        aria-label="Not listesi"
        className={cn("w-full min-w-0 shrink-0 overflow-hidden border-line bg-page/60 lg:flex lg:w-[320px] lg:border-r", explicitId ? "hidden" : "flex")}
      >
        <NoteList
          notes={list}
          selectedId={shownId}
          explicit={!!explicitId}
          onSelect={openNote}
          onCreate={create}
          filter={filter}
          onFilter={setFilter}
          query={query}
          onQuery={setQuery}
        />
      </aside>
      <section aria-label="Not" className={cn("min-w-0 flex-1 lg:flex", explicitId ? "flex" : "hidden")}>
        {shown ? (
          <div className="w-full min-w-0">
            <NoteWorkspace key={shown.id} note={shown} onBack={() => openNote(null)} onDeleted={() => openNote(null)} />
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-sunken text-ink-muted"><NotebookPen className="size-6" strokeWidth={1.7} aria-hidden /></span>
            <p className="text-base font-semibold">Henüz not yok</p>
            <p className="max-w-xs text-sm text-ink-muted">Kişisel düşüncelerini ya da ders notlarını burada yaz; derse ve konuya bağlayabilirsin.</p>
            <Button onClick={create}><Plus /> İlk notunu yaz</Button>
          </div>
        )}
      </section>
    </div>
  );
}
