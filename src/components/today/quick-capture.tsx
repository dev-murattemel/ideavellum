"use client";

import * as React from "react";
import { ListTodo, NotebookPen, Pin } from "lucide-react";
import { toast } from "sonner";

import { parseTags } from "@/components/stickies/capture-bar";
import { Button } from "@/components/ui/button";
import { positionAtEnd } from "@/lib/data/position";
import { data } from "@/lib/data/store";
import { createSticky } from "@/lib/domain/stickies";
import { goTo } from "@/lib/nav/nav-context";
import { ui } from "@/lib/ui-store";

/**
 * Hızlı yaz: aklına geleni tek yerden yakala. Enter → mantar panoya as;
 * istersen doğrudan görev ya da not olarak kaydet. #etiket desteklenir.
 */
export function QuickCapture() {
  const [value, setValue] = React.useState("");
  const { text, tags } = parseTags(value);
  const empty = !text;
  const [first = "", ...rest] = text.split("\n");

  const done = () => setValue("");
  const toBoard = () => {
    if (empty) return;
    createSticky(text, "butter", tags, 960);
    toast.success("Mantar panoya asıldı", { action: { label: "Panoyu aç", onClick: () => goTo("/mantar-pano") } });
    done();
  };
  const toTask = () => {
    if (empty) return;
    const todo = Object.values(data().tasks).filter((t) => t.status === "todo");
    const task = data().insert("tasks", {
      course_id: null, topic_id: null, title: first.slice(0, 120), description: rest.join("\n").trim() || null,
      status: "todo", priority: "medium", due_at: null, position: positionAtEnd(todo), completed_at: null,
    });
    toast.success("Görev eklendi", { action: { label: "Aç", onClick: () => ui().openTask(task.id) } });
    done();
  };
  const toNote = () => {
    if (empty) return;
    const body = rest.join("\n").trim();
    const note = data().insert("notes", {
      course_id: null, topic_id: null, title: first.slice(0, 120), is_pinned: false, tags,
      content: { type: "doc", content: body ? body.split("\n").map((l) => ({ type: "paragraph", content: l ? [{ type: "text", text: l }] : undefined })) : [] },
    });
    toast.success("Not kaydedildi", { action: { label: "Aç", onClick: () => ui().openNote(note.id) } });
    done();
  };

  return (
    <section aria-label="Hızlı yaz" className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); toBoard(); }
        }}
        rows={2}
        placeholder="Aklına ne geldi? Enter ile mantar panoya as. #etiket"
        aria-label="Hızlı yaz"
        className="field-sizing-content max-h-40 min-h-14 w-full resize-none rounded-md bg-sunken/50 px-2.5 py-2 text-sm outline-none placeholder:text-ink-subtle focus:bg-sunken/80"
      />
      <div className="flex items-center gap-1.5">
        <Button size="sm" disabled={empty} onClick={toBoard}><Pin /> Panoya as</Button>
        <Button size="sm" variant="ghost" disabled={empty} onClick={toTask} title="Görev olarak kaydet"><ListTodo /> Görev</Button>
        <Button size="sm" variant="ghost" disabled={empty} onClick={toNote} title="Not olarak kaydet"><NotebookPen /> Not</Button>
      </div>
    </section>
  );
}
