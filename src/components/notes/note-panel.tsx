"use client";

import * as React from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SuggestFromTextButton } from "@/components/ai/suggest-dialog";
import { CourseSelect, NONE, TopicSelect } from "@/components/board/task-fields";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useRow } from "@/lib/data/hooks";
import { docToText } from "@/lib/data/tiptap";
import { data } from "@/lib/data/store";
import { fmt, utcToWall } from "@/lib/time";
import { useUI } from "@/lib/ui-store";
import { NoteEditor } from "./note-editor";

/** Not açıldığında sağdan gelen geniş panel */
export function NotePanel() {
  const id = useUI((s) => s.noteEditorId);
  const openNote = useUI((s) => s.openNote);
  const note = useRow("notes", id);
  const [confirm, setConfirm] = React.useState(false);
  if (!note) return null;
  const set = (patch: Partial<typeof note>) => data().update("notes", note.id, patch);
  const isNew = !note.title && !note.content.content?.length;

  return (
    <Sheet open onOpenChange={(o) => !o && openNote(null)}>
      <SheetContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl" onOpenAutoFocus={(e) => !isNew && e.preventDefault()}>
        <SheetDescription className="sr-only">Not düzenleyici</SheetDescription>
        <div className="flex items-center gap-2 border-b border-line px-5 py-3 pr-14">
          <div className="w-44"><CourseSelect size="sm" value={note.course_id ?? NONE} onChange={(v) => set({ course_id: v === NONE ? null : v, topic_id: null })} /></div>
          <div className="w-44 max-sm:hidden"><TopicSelect size="sm" courseId={note.course_id ?? NONE} value={note.topic_id ?? NONE} onChange={(v) => set({ topic_id: v === NONE ? null : v })} /></div>
          <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label={note.is_pinned ? "Sabitlemeyi kaldır" : "Sabitle"} aria-pressed={note.is_pinned} onClick={() => set({ is_pinned: !note.is_pinned })}>
            {note.is_pinned ? <PinOff /> : <Pin />}
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Notu sil" onClick={() => setConfirm(true)} className="hover:text-destructive">
            <Trash2 />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10 sm:px-8">
          <SheetTitle asChild className="w-full bg-transparent text-2xl font-semibold tracking-[-0.015em] outline-none placeholder:text-ink-subtle">
            <input
              key={note.id}
              defaultValue={note.title}
              placeholder="Başlıksız not"
              aria-label="Not başlığı"
              autoFocus={isNew}
              onBlur={(e) => e.target.value !== note.title && set({ title: e.target.value.trim() })}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </SheetTitle>
          <div className="mt-1 mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-ink-muted">Son düzenleme {fmt(utcToWall(note.updated_at), "d MMMM, HH:mm")} · otomatik kaydedilir</p>
            <SuggestFromTextButton courseId={note.course_id} title={note.title} text={docToText(note.content, 12000, "\n")} />
          </div>
          <NoteEditor key={note.id} content={note.content} onChange={(content) => data().notes[note.id] && set({ content })} />
        </div>
      </SheetContent>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Not silinsin mi?"
        description={`“${note.title || "Başlıksız not"}” kalıcı olarak silinir.`}
        confirmLabel="Notu sil"
        onConfirm={() => { openNote(null); data().remove("notes", note.id); toast("Not silindi"); }}
      />
    </Sheet>
  );
}
