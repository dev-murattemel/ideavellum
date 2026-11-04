"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, type SortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Course } from "@/lib/data/types";
import { reorderAreas } from "@/lib/domain/reorder";
import { cn } from "@/lib/utils";

const ANNOUNCE = {
  screenReaderInstructions: { draggable: "Taşımak için boşluk tuşuna bas, oklarla yer değiştir, bırakmak için tekrar boşluk." },
};

/**
 * Alanları sürükleyerek sıralama. Kısa bir hareketten sonra sürükleme başlar,
 * böylece tıklama derse gitmeye devam eder. Bırakılınca sıra kaydedilir.
 */
export function SortableAreas({
  items,
  strategy,
  modifiers,
  renderItem,
  renderOverlay,
  itemAs = "div",
  children,
}: {
  itemAs?: "div" | "li";
  items: Course[];
  strategy: SortingStrategy;
  modifiers?: Modifier[];
  renderItem: (c: Course, dragging: boolean) => React.ReactNode;
  renderOverlay?: (c: Course) => React.ReactNode;
  children: (nodes: React.ReactNode) => React.ReactNode;
}) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const active = items.find((c) => c.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={modifiers}
      accessibility={ANNOUNCE}
      onDragStart={({ active: a }: DragStartEvent) => setActiveId(String(a.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={({ active: a, over }: DragEndEvent) => {
        setActiveId(null);
        if (over) reorderAreas(items, String(a.id), String(over.id));
      }}
    >
      <SortableContext items={items.map((c) => c.id)} strategy={strategy}>
        {children(items.map((c) => <SortableItem key={c.id} id={c.id} as={itemAs}>{renderItem(c, c.id === activeId)}</SortableItem>))}
      </SortableContext>
      {renderOverlay && <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }}>{active ? renderOverlay(active) : null}</DragOverlay>}
    </DndContext>
  );
}

function SortableItem({ id, as: Tag = "div", children }: { id: string; as?: "div" | "li"; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const dragged = React.useRef(false);
  React.useEffect(() => {
    if (isDragging) dragged.current = true;
  }, [isDragging]);

  return (
    <Tag
      ref={setNodeRef as React.Ref<HTMLDivElement & HTMLLIElement>}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-roledescription="Taşınabilir alan"
      // Sürükleme bitince oluşan tıklama, derse gitmesin
      onClickCapture={(e) => {
        if (dragged.current) {
          e.preventDefault();
          e.stopPropagation();
          dragged.current = false;
        }
      }}
      className={cn("touch-manipulation outline-none", isDragging && "relative z-10 opacity-40")}
    >
      {children}
    </Tag>
  );
}
