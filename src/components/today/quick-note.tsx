"use client";

import * as React from "react";
import { toast } from "sonner";

import { CourseSelect, NONE } from "@/components/board/task-fields";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { data } from "@/lib/data/store";
import { doc, p } from "@/lib/data/tiptap";
import { ui } from "@/lib/ui-store";

/** Yazılan not seçili derse kaydedilir. */
export function QuickNote({ defaultCourseId }: { defaultCourseId?: string }) {
  const [text, setText] = React.useState("");
  const [courseId, setCourseId] = React.useState(defaultCourseId ?? NONE);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = text.trim().split("\n").filter(Boolean);
    if (!lines.length) return;
    const note = data().insert("notes", {
      course_id: courseId === NONE ? null : courseId,
      topic_id: null,
      title: lines[0].slice(0, 80),
      content: doc(...lines.slice(lines[0].length > 80 ? 0 : 1).map(p)),
      is_pinned: false,
    });
    setText("");
    toast.success("Not kaydedildi", { description: note.title, action: { label: "Aç", onClick: () => ui().openNote(note.id) } });
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === "Enter" && save(e)}
        placeholder="Aklına geleni yaz… İlk satır başlık olur."
        aria-label="Hızlı not"
        className="min-h-24"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="w-full sm:w-60"><CourseSelect size="sm" value={courseId} onChange={setCourseId} /></div>
        <Button type="submit" size="sm" disabled={!text.trim()}>Notu kaydet</Button>
      </div>
    </form>
  );
}
