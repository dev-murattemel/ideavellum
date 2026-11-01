"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ListTree, Plus } from "lucide-react";

import { InlineEmpty } from "@/components/today/inline-empty";
import { Input } from "@/components/ui/input";
import { useCourseTopics } from "@/lib/data/hooks";
import { positionAtEnd, positionForIndex } from "@/lib/data/position";
import { data } from "@/lib/data/store";
import type { Course } from "@/lib/data/types";
import { TopicRow } from "./topic-row";

export function TopicList({ course }: { course: Course }) {
  const topics = useCourseTopics(course.id);
  const [draft, setDraft] = React.useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const others = topics.filter((t) => t.id !== active.id);
    const newIndex = topics.findIndex((t) => t.id === over.id);
    data().update("topics", String(active.id), { position: positionForIndex(others, newIndex) });
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    data().insert("topics", { course_id: course.id, title, status: "not_started", position: positionAtEnd(topics), done_at: null });
    setDraft("");
  };

  return (
    <div data-course={course.color} className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
      {topics.length === 0 ? (
        <InlineEmpty icon={ListTree} title="Henüz konu yok" description="Dersin ünitelerini sırayla ekle; sürükleyerek yeniden sıralayabilirsin." />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}
          accessibility={{
            screenReaderInstructions: { draggable: "Taşımak için boşluk tuşuna bas, oklarla yer değiştir, bırakmak için tekrar boşluk." },
          }}
        >
          <SortableContext items={topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ol aria-label="Konular">
              {topics.map((t, i) => <TopicRow key={t.id} topic={t} index={i} />)}
            </ol>
          </SortableContext>
        </DndContext>
      )}
      <form onSubmit={add} className="flex items-center gap-2 border-t border-line bg-sunken/40 p-2">
        <Plus className="ml-2 size-4 shrink-0 text-ink-subtle" aria-hidden />
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Konu ekle ve Enter'a bas"
          aria-label="Yeni konu"
          className="h-9 border-transparent bg-transparent focus-visible:bg-surface"
        />
      </form>
    </div>
  );
}
