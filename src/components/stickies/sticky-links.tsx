"use client";

import { BookMarked, ListTodo, NotebookPen } from "lucide-react";
import { parseISO } from "date-fns";

import { useRow } from "@/lib/data/hooks";
import type { StickyNote } from "@/lib/data/types";
import { goTo } from "@/lib/nav/nav-context";
import { fmt } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const chip = "flex h-6 cursor-pointer items-center gap-1 rounded-full bg-surface/60 px-2 text-xs font-medium transition-colors outline-none hover:bg-surface/90 focus-visible:ring-2 focus-visible:ring-ring";

/** Notun aktarıldığı yerler: tıklayınca görev / not / günlük açılır */
export function StickyLinks({ s }: { s: StickyNote }) {
  const task = useRow("tasks", s.task_id);
  const note = useRow("notes", s.note_id);
  if (!task && !note && !s.journal_date) return null;
  return (
    <div data-no-drag className="flex flex-wrap gap-1">
      {task && (
        <button type="button" onClick={() => ui().openTask(task.id)} className={cn(chip, task.status === "done" && "opacity-70")} title={task.title}>
          <ListTodo className="size-3" aria-hidden /> {task.status === "done" ? "Görev bitti" : "Görev"}
        </button>
      )}
      {note && (
        <button type="button" onClick={() => ui().openNote(note.id)} className={chip} title={note.title}>
          <NotebookPen className="size-3" aria-hidden /> Not
        </button>
      )}
      {s.journal_date && (
        <button type="button" onClick={() => goTo("/gunluk")} className={chip}>
          <BookMarked className="size-3" aria-hidden /> Günlük · {fmt(parseISO(s.journal_date), "d MMM")}
        </button>
      )}
    </div>
  );
}
