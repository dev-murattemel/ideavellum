"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveCourses, useCourseTopics } from "@/lib/data/hooks";
import type { TaskPriority, TaskStatus } from "@/lib/data/types";
import { PRIORITIES, STATUSES } from "@/lib/domain/tasks";
import { cn } from "@/lib/utils";

export const NONE = "none";

export function CourseSelect({ value, onChange, size }: { value: string; onChange: (v: string) => void; size?: "sm" | "default" }) {
  const courses = useActiveCourses();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size={size} aria-label="Ders"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Derse bağlı değil</SelectItem>
        {courses.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TopicSelect({ courseId, value, onChange, size }: { courseId: string; value: string; onChange: (v: string) => void; size?: "sm" | "default" }) {
  const topics = useCourseTopics(courseId);
  return (
    <Select value={value} onValueChange={onChange} disabled={courseId === NONE || topics.length === 0}>
      <SelectTrigger size={size} aria-label="Konu"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Konu yok</SelectItem>
        {topics.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function PrioritySelect({ value, onChange, size }: { value: TaskPriority; onChange: (v: TaskPriority) => void; size?: "sm" | "default" }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TaskPriority)}>
      <SelectTrigger size={size} aria-label="Öncelik"><SelectValue /></SelectTrigger>
      <SelectContent>
        {PRIORITIES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function StatusSelect({ value, onChange, size }: { value: TaskStatus; onChange: (v: TaskStatus) => void; size?: "sm" | "default" }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TaskStatus)}>
      <SelectTrigger size={size} aria-label="Durum"><SelectValue /></SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            <span className={cn("size-2 rounded-full", s.dot)} aria-hidden />
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
