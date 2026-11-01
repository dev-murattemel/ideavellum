"use client";

import { NotebookPen, Plus } from "lucide-react";

import { createNote } from "@/components/notes/create-note";
import { Button } from "@/components/ui/button";
import { useRows } from "@/lib/data/hooks";
import type { Task } from "@/lib/data/types";
import { ui } from "@/lib/ui-store";

/** Görevin konusuna (yoksa dersine) ait notlar */
export function TaskLinkedNotes({ task }: { task: Task }) {
  const notes = useRows("notes")
    .filter((n) => (task.topic_id ? n.topic_id === task.topic_id : task.course_id && n.course_id === task.course_id))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 4);
  if (!task.course_id) return null;
  return (
    <div className="mt-6 flex flex-col gap-2">
      <h3 className="text-13 font-semibold">{task.topic_id ? "Konunun notları" : "Alanın notları"}</h3>
      {notes.length === 0 && <p className="text-13 text-ink-muted">Henüz not yok.</p>}
      <ul className="flex flex-col gap-1">
        {notes.map((n) => (
          <li key={n.id}>
            <button type="button" onClick={() => { ui().openTask(null); ui().openNote(n.id); }} className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-hover">
              <NotebookPen className="size-4 shrink-0 text-ink-subtle" aria-hidden />
              <span className="truncate">{n.title || "Başlıksız not"}</span>
            </button>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => { ui().openTask(null); createNote(task.course_id, task.topic_id); }}>
        <Plus /> Not ekle
      </Button>
    </div>
  );
}
