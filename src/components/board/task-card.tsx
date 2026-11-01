"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CircleCheck } from "lucide-react";

import type { ChecklistItem, Course, Task } from "@/lib/data/types";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { DueChip } from "./due-chip";
import { PriorityFlag } from "./priority-flag";
import { RowActions } from "@/components/ui/row-actions";
import { taskActions } from "@/lib/domain/task-actions";

export type CardData = { task: Task; course?: Course; checklist: ChecklistItem[] };

/** Pano kartı: ders renginde pastel zemin (ilham 01). */
export function TaskCardBody({ task, course, checklist, now, overlay }: CardData & { now: Date; overlay?: boolean }) {
  const done = checklist.filter((c) => c.is_done).length;
  return (
    <div
      data-course={course?.color}
      className={cn(
        "flex flex-col gap-2.5 rounded-xl p-3 text-left",
        course ? "bg-course text-course-fg" : "border border-line bg-surface text-foreground",
        overlay && "rotate-[2deg] shadow-lift",
        task.status === "done" && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium opacity-80">{course ? course.name : "Genel"}</span>
        <PriorityFlag priority={task.priority} />
      </div>
      <p className={cn("text-sm leading-5 font-semibold", task.status === "done" && "line-through decoration-current/40")}>{task.title}</p>
      {checklist.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="flex flex-1 flex-wrap gap-1" aria-hidden>
            {checklist.map((c) => (
              <span key={c.id} className={cn("h-1.5 min-w-3 flex-1 rounded-full", c.is_done ? "bg-current opacity-70" : "bg-current opacity-15")} />
            ))}
          </span>
          <span className="tabular text-xs font-medium opacity-80">
            {done}/{checklist.length}
            <span className="sr-only"> kontrol maddesi tamam</span>
          </span>
        </div>
      )}
      {(task.due_at || task.status === "done") && (
        <div className="flex items-center gap-2">
          {task.status === "done" ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium opacity-80">
              <CircleCheck className="size-3.5" aria-hidden /> Tamamlandı
            </span>
          ) : (
            <DueChip task={task} now={now} />
          )}
        </div>
      )}
    </div>
  );
}

export function SortableTaskCard(props: CardData & { now: Date }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.task.id,
    data: { status: props.task.status },
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("group relative list-none", isDragging && "opacity-40")}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-roledescription="Taşınabilir görev kartı"
        onClick={() => ui().openTask(props.task.id)}
        className="block w-full cursor-grab rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:cursor-grabbing"
      >
        <TaskCardBody {...props} />
      </button>
      {!isDragging && <RowActions actions={taskActions(props.task)} className="absolute top-2 right-2" />}
    </li>
  );
}
