"use client";

import * as React from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { positionForIndex } from "@/lib/data/position";
import { data } from "@/lib/data/store";
import type { TaskStatus } from "@/lib/data/types";
import { STATUS_LABEL } from "@/lib/domain/tasks";
import { BoardColumn } from "./board-column";
import { TaskCardBody, type CardData } from "./task-card";

type Cols = Record<TaskStatus, CardData[]>;
const ORDER: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export function BoardKanban({ columns, now, hiddenDone, onShowHidden }: { columns: Cols; now: Date; hiddenDone: number; onShowHidden: () => void }) {
  // Sürükleme sırasında sütunları yerelde tutarız; bırakınca tek bir güncelleme yazılır (iyimser güncelleme).
  const [drag, setDrag] = React.useState<Cols | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const cols = drag ?? columns;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findCol = (c: Cols, id: string): TaskStatus | null =>
    (ORDER as string[]).includes(id) ? (id as TaskStatus) : (ORDER.find((s) => c[s].some((x) => x.task.id === id)) ?? null);

  const onDragStart = ({ active }: DragStartEvent) => {
    setDrag(columns);
    setActiveId(String(active.id));
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || !drag) return;
    const from = findCol(drag, String(active.id));
    const to = findCol(drag, String(over.id));
    if (!from || !to || from === to) return;
    setDrag((prev) => {
      if (!prev) return prev;
      const item = prev[from].find((x) => x.task.id === active.id)!;
      const overIndex = prev[to].findIndex((x) => x.task.id === over.id);
      const target = [...prev[to]];
      target.splice(overIndex === -1 ? target.length : overIndex, 0, item);
      return { ...prev, [from]: prev[from].filter((x) => x.task.id !== active.id), [to]: target };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const state = drag;
    setActiveId(null);
    setDrag(null);
    if (!over || !state) return;
    const id = String(active.id);
    const col = findCol(state, id);
    if (!col) return;
    let list = state[col];
    const oldIndex = list.findIndex((x) => x.task.id === id);
    const overIndex = list.findIndex((x) => x.task.id === over.id);
    if (overIndex !== -1 && overIndex !== oldIndex) list = arrayMove(list, oldIndex, overIndex);
    const index = list.findIndex((x) => x.task.id === id);
    const others = list.filter((x) => x.task.id !== id).map((x) => x.task);
    const task = data().tasks[id];
    if (!task) return;
    const position = positionForIndex(others, index);
    if (task.status === col && task.position === position) return;
    data().update("tasks", id, {
      status: col,
      position,
      completed_at: col === "done" ? (task.completed_at ?? new Date().toISOString()) : null,
    });
  };

  const active = activeId ? ORDER.flatMap((s) => cols[s]).find((x) => x.task.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => { setDrag(null); setActiveId(null); }}
      accessibility={{
        screenReaderInstructions: { draggable: "Kartı almak için boşluk tuşuna bas. Oklarla sütun ve sıra değiştir, bırakmak için tekrar boşluk, vazgeçmek için Escape." },
        announcements: {
          onDragStart: () => "Kart alındı.",
          onDragOver: ({ over }) => (over ? `${STATUS_LABEL[findCol(cols, String(over.id)) ?? "todo"]} sütunu üzerinde.` : ""),
          onDragEnd: ({ over }) => (over ? `${STATUS_LABEL[findCol(cols, String(over.id)) ?? "todo"]} sütununa bırakıldı.` : "Bırakıldı."),
          onDragCancel: () => "Taşıma iptal edildi.",
        },
      }}
    >
      <div className="relative -mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        <div className="grid min-w-[1000px] grid-cols-4 gap-4">
          {ORDER.map((s) => (
            <BoardColumn key={s} status={s} cards={cols[s]} now={now} hiddenCount={s === "done" ? hiddenDone : 0} onShowHidden={onShowHidden} />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
        {active ? <TaskCardBody {...active} now={now} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
