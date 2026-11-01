"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRows } from "@/lib/data/hooks";
import { positionAtEnd } from "@/lib/data/position";
import { data } from "@/lib/data/store";
import type { TaskPriority, TaskStatus } from "@/lib/data/types";
import { isoDate, zonedNow } from "@/lib/time";
import { ui, type DialogState } from "@/lib/ui-store";
import { DueFields, joinDue } from "./due-fields";
import { CourseSelect, NONE, PrioritySelect, StatusSelect, TopicSelect } from "./task-fields";

type Preset = Extract<DialogState, { type: "task" }>["preset"];

export function TaskDialog({ preset, onClose }: { preset?: Preset; onClose: () => void }) {
  const tasks = useRows("tasks");
  const [title, setTitle] = React.useState("");
  const [courseId, setCourseId] = React.useState(preset?.course_id ?? NONE);
  const [topicId, setTopicId] = React.useState(preset?.topic_id ?? NONE);
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [status, setStatus] = React.useState<TaskStatus>(preset?.status ?? "todo");
  const [due, setDue] = React.useState({ date: preset?.due_today ? isoDate(zonedNow()) : "", time: "23:59" });
  const [error, setError] = React.useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) return setError("Görev başlığı en az 2 harf olmalı.");
    const task = data().insert("tasks", {
      title: title.trim(),
      description: null,
      course_id: courseId === NONE ? null : courseId,
      topic_id: topicId === NONE ? null : topicId,
      priority,
      status,
      due_at: joinDue(due.date, due.time),
      position: positionAtEnd(tasks.filter((t) => t.status === status)),
      completed_at: status === "done" ? new Date().toISOString() : null,
    });
    toast.success("Görev eklendi", { description: task.title, action: { label: "Aç", onClick: () => ui().openTask(task.id) } });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni görev</DialogTitle>
          <DialogDescription>Örneğin “Unit 7 alıştırmalarını bitir”.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          <Field label="Başlık" htmlFor="t-title" error={error ?? undefined}>
            <Input id="t-title" autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} placeholder="Ne yapılacak?" aria-invalid={!!error} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Alan"><CourseSelect value={courseId} onChange={(v) => { setCourseId(v); setTopicId(NONE); }} /></Field>
            <Field label="Konu"><TopicSelect courseId={courseId} value={topicId} onChange={setTopicId} /></Field>
            <Field label="Öncelik"><PrioritySelect value={priority} onChange={setPriority} /></Field>
            <Field label="Durum"><StatusSelect value={status} onChange={setStatus} /></Field>
          </div>
          <Field label="Son tarih">
            <DueFields date={due.date} time={due.time} onChange={(date, time) => setDue({ date, time })} idPrefix="nt" />
          </Field>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
            <Button type="submit">Görevi ekle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
