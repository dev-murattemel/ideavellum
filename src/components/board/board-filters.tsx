"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveCourses, useRows } from "@/lib/data/hooks";
import { sortByPosition } from "@/lib/data/position";
import { PRIORITIES } from "@/lib/domain/tasks";
import { DEFAULT_FILTERS, type BoardFilters as Filters } from "./use-board-data";

export function BoardFilters({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) {
  const courses = useActiveCourses();
  const topics = sortByPosition(useRows("topics").filter((t) => t.course_id === value.course));
  const dirty = JSON.stringify(value) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Süzgeçler">
      <Select value={value.course} onValueChange={(course) => onChange({ ...value, course, topic: "all" })}>
        <SelectTrigger size="sm" className="w-auto min-w-36" aria-label="Alan"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm alanlar</SelectItem>
          <SelectItem value="none">Alana bağlı olmayan</SelectItem>
          <SelectSeparator />
          {courses.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {topics.length > 0 && (
        <Select value={value.topic} onValueChange={(topic) => onChange({ ...value, topic })}>
          <SelectTrigger size="sm" className="w-auto min-w-32 max-w-56" aria-label="Konu"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm konular</SelectItem>
            {topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      <Select value={value.priority} onValueChange={(priority) => onChange({ ...value, priority: priority as Filters["priority"] })}>
        <SelectTrigger size="sm" className="w-auto min-w-32" aria-label="Öncelik"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm öncelikler</SelectItem>
          {PRIORITIES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={value.due} onValueChange={(due) => onChange({ ...value, due: due as Filters["due"] })}>
        <SelectTrigger size="sm" className="w-auto min-w-32" aria-label="Son tarih"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Her tarih</SelectItem>
          <SelectItem value="today">Bugün</SelectItem>
          <SelectItem value="week">Bu hafta</SelectItem>
          <SelectItem value="overdue">Geciken</SelectItem>
          <SelectItem value="none">Tarihsiz</SelectItem>
        </SelectContent>
      </Select>
      {dirty && (
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>
          <X /> Süzgeçleri temizle
        </Button>
      )}
    </div>
  );
}
