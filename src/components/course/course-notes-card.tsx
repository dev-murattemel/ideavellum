"use client";

import * as React from "react";
import { FileText, Pin, Plus } from "lucide-react";

import { createNote } from "@/components/notes/create-note";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data/hooks";
import { docToText } from "@/lib/data/tiptap";
import type { Course } from "@/lib/data/types";
import { timeAgo } from "@/lib/time";
import { ui } from "@/lib/ui-store";

/** Genel bakışta dersin son notları ve tek tıkla not ekleme */
export function CourseNotesCard({ course }: { course: Course }) {
  const notes = useRows("notes");
  const list = React.useMemo(
    () =>
      notes
        .filter((n) => n.course_id === course.id)
        .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.updated_at.localeCompare(a.updated_at))
        .slice(0, 4),
    [notes, course.id],
  );

  return (
    <section aria-labelledby="course-notes" className="flex h-full flex-col rounded-xl border border-line bg-surface">
      <header className="flex h-12 items-center justify-between gap-3 border-b border-line px-4">
        <h2 id="course-notes" className="text-sm font-semibold">Notlar</h2>
        <Button variant="secondary" size="sm" onClick={() => createNote(course.id)}><Plus /> Not ekle</Button>
      </header>
      {list.length === 0 ? (
        <div className="flex flex-1 flex-col items-start gap-1 p-4">
          <p className="text-sm font-medium">Bu derse henüz not eklenmedi.</p>
          <p className="text-13 text-ink-muted">Notlarına metin, bağlantı, görsel ve yapılacaklar listesi ekleyebilirsin.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {list.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => ui().openNote(n.id)}
                className="flex h-full w-full cursor-pointer gap-3 p-4 text-left transition-colors outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset last:rounded-b-xl"
              >
                <FileText className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{n.title || "Başlıksız not"}</span>
                    {n.is_pinned && <Pin className="size-3 shrink-0 fill-current text-accent-text" aria-label="Sabitlendi" />}
                  </span>
                  <span className="line-clamp-2 text-13 text-ink-muted">{docToText(n.content, 140) || "Boş not"}</span>
                  <span className="text-xs text-ink-subtle">{timeAgo(n.updated_at)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
