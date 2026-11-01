"use client";

import * as React from "react";
import { NotebookPen, Plus } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { useCourseMap, useRows } from "@/lib/data/hooks";
import { docToText } from "@/lib/data/tiptap";
import { createNote } from "./create-note";
import { NoteCard } from "./note-card";

/** Not ızgarası: sabitlenenler önce, sonra en son düzenlenenler */
export function NoteGrid({ courseId, query = "", newCourseId }: { courseId?: string | "none"; query?: string; newCourseId?: string }) {
  const notes = useRows("notes");
  const courses = useCourseMap();
  const list = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return notes
      .filter((n) => !courseId || (courseId === "none" ? !n.course_id : n.course_id === courseId))
      .filter((n) => !q || `${n.title} ${docToText(n.content, 5000)}`.toLocaleLowerCase("tr").includes(q))
      .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.updated_at.localeCompare(a.updated_at));
  }, [notes, courseId, query]);

  if (list.length === 0) {
    return (
      <EmptyState
        compact
        icon={NotebookPen}
        title={query ? "Eşleşen not yok" : "Henüz not yok"}
        description={query ? "Farklı bir kelimeyle ara." : "Aklına gelenleri buraya yaz; notlar alana ve konuya bağlanır."}
        action={!query && <Button onClick={() => createNote(newCourseId)}><Plus /> Not ekle</Button>}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {list.map((n) => <NoteCard key={n.id} note={n} course={n.course_id ? courses[n.course_id] : undefined} />)}
    </div>
  );
}
