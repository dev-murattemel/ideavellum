"use client";

import * as React from "react";
import { ArrowLeft, CalendarDays, Check, LoaderCircle, Pin, PinOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SuggestFromTextButton } from "@/components/ai/suggest-dialog";
import { CourseSelect, NONE, TopicSelect } from "@/components/board/task-fields";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { data } from "@/lib/data/store";
import { docToText } from "@/lib/data/tiptap";
import type { Note } from "@/lib/data/types";
import { fmt, utcToWall } from "@/lib/time";
import { NoteEditor, type EditorStats } from "./note-editor";
import { TagInput } from "@/components/tags/tag-input";

/** Sağ bölme: başlık, özellikler ve tam ekran editör */
export function NoteWorkspace({ note, onBack, onDeleted }: { note: Note; onBack: () => void; onDeleted: () => void }) {
  const [stats, setStats] = React.useState<EditorStats>({ words: 0, characters: 0, saving: false });
  const [confirm, setConfirm] = React.useState(false);
  const set = (patch: Partial<Note>) => data().update("notes", note.id, patch);
  const isNew = !note.title && !note.content.content?.length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Üst çubuk */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3">
        <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Not listesine dön" onClick={onBack}><ArrowLeft /></Button>
        <span className="flex items-center gap-1.5 text-xs text-ink-muted" aria-live="polite">
          {stats.saving ? <><LoaderCircle className="size-3.5 animate-spin" aria-hidden /> Kaydediliyor</> : <><Check className="size-3.5" aria-hidden /> Kaydedildi</>}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <SuggestFromTextButton courseId={note.course_id} title={note.title} text={docToText(note.content, 12000, "\n")} />
          <Button variant="ghost" size="icon-sm" aria-label={note.is_pinned ? "Sabitlemeyi kaldır" : "Sabitle"} aria-pressed={note.is_pinned} title={note.is_pinned ? "Sabitlemeyi kaldır" : "Sabitle"} onClick={() => set({ is_pinned: !note.is_pinned })}>
            {note.is_pinned ? <PinOff /> : <Pin />}
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Notu sil" title="Notu sil" className="hover:text-destructive" onClick={() => setConfirm(true)}><Trash2 /></Button>
        </div>
      </div>

      <div data-note-root className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-5 pt-6 sm:px-10 sm:pt-8">
          <textarea
            key={note.id}
            rows={1}
            defaultValue={note.title}
            placeholder="Başlıksız not"
            aria-label="Not başlığı"
            autoFocus={isNew}
            onBlur={(e) => e.target.value.trim() !== note.title && set({ title: e.target.value.trim() })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.currentTarget.closest("[data-note-root]")?.querySelector(".tiptap-content") as HTMLElement | null)?.focus();
              }
            }}
            className="field-sizing-content w-full resize-none bg-transparent text-2xl leading-8 font-semibold tracking-[-0.02em] outline-none placeholder:text-ink-subtle sm:text-3xl sm:leading-10"
          />
          <dl className="mt-4 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-13 sm:grid-cols-[88px_minmax(0,16rem)_88px_minmax(0,16rem)]">
            <dt className="text-ink-muted">Alan</dt>
            <dd><CourseSelect size="sm" value={note.course_id ?? NONE} onChange={(v) => set({ course_id: v === NONE ? null : v, topic_id: null })} /></dd>
            <dt className="text-ink-muted">Konu</dt>
            <dd><TopicSelect size="sm" courseId={note.course_id ?? NONE} value={note.topic_id ?? NONE} onChange={(v) => set({ topic_id: v === NONE ? null : v })} /></dd>
            <dt className="text-ink-muted">Etiketler</dt>
            <dd className="sm:col-span-3"><TagInput value={note.tags ?? []} onChange={(tags) => set({ tags })} /></dd>
          </dl>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
            <span className="flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden /> Oluşturuldu {fmt(utcToWall(note.created_at), "d MMMM yyyy")}</span>
            <span>Düzenlendi {fmt(utcToWall(note.updated_at), "d MMM, HH:mm")}</span>
            <span className="tabular">{stats.words} kelime</span>
          </p>
        </div>
        <div className="mx-auto mt-4 w-full max-w-[760px] px-3 sm:px-8">
          <NoteEditor
            key={note.id}
            content={note.content}
            onChange={(content) => data().notes[note.id] && set({ content })}
            onStats={setStats}
            toolbarClassName="-mx-1 rounded-lg border border-line"
            contentClassName="px-2"
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Not silinsin mi?"
        description={`“${note.title || "Başlıksız not"}” kalıcı olarak silinir.`}
        confirmLabel="Notu sil"
        onConfirm={() => { onDeleted(); data().remove("notes", note.id); toast("Not silindi"); }}
      />
    </div>
  );
}
