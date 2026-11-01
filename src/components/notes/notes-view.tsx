"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CourseFilterChips } from "@/components/resources/course-filter-chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createNote } from "./create-note";
import { NoteGrid } from "./note-grid";

export function NotesView() {
  const [course, setCourse] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Notlar"
        description="Tüm derslerin notları tek yerde."
        actions={<Button onClick={() => createNote(course === "all" || course === "none" ? null : course)}><Plus /> Not ekle</Button>}
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CourseFilterChips value={course} onChange={setCourse} />
        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Notlarda ara" aria-label="Notlarda ara" className="h-9 pl-9" />
        </div>
      </div>
      <NoteGrid courseId={course === "all" ? undefined : course} query={query} newCourseId={course === "all" || course === "none" ? undefined : course} />
    </div>
  );
}
