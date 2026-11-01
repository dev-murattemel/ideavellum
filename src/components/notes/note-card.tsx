"use client";

import { Pin } from "lucide-react";

import { docToText } from "@/lib/data/tiptap";
import type { Course, Note } from "@/lib/data/types";
import { fmt, utcToWall } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { RowActions } from "@/components/ui/row-actions";
import { noteActions } from "@/lib/notes/actions";

export function NoteCard({ note, course }: { note: Note; course?: Course }) {
  const preview = docToText(note.content, 180);
  return (
    <div className="group relative">
    <button
      type="button"
      onClick={() => ui().openNote(note.id)}
      className="flex h-full w-full min-h-40 cursor-pointer flex-col gap-2 rounded-xl border border-line bg-surface p-4 text-left transition-[border-color,box-shadow] outline-none hover:border-line-strong hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold">{note.title || "Başlıksız not"}</h3>
        {note.is_pinned && <Pin className="size-3.5 shrink-0 fill-current text-accent-text" aria-label="Sabitlendi" />}
      </div>
      <p className="line-clamp-4 text-13 text-ink-muted">{preview || "Boş not"}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-ink-muted">
        {course ? (
          <span data-course={course.color} className="inline-flex max-w-[60%] items-center gap-1.5 truncate rounded-md bg-course px-2 py-0.5 font-medium text-course-fg">
            {course.name}
          </span>
        ) : (
          <span>Kişisel</span>
        )}
        <span className="tabular">{fmt(utcToWall(note.updated_at), "d MMM")}</span>
      </div>
    </button>
    <RowActions actions={noteActions(note)} className="absolute top-3 right-3" />
    </div>
  );
}
