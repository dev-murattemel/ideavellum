"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import { data } from "@/lib/data/store";
import type { Topic } from "@/lib/data/types";
import { fmt } from "@/lib/time";
import { cn } from "@/lib/utils";
import { TopicStatusButton } from "./topic-status";

export function TopicRow({ topic, index }: { topic: Topic; index: number }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });
  // Düzenlerken yerel taslak; odak dışındayken her zaman kayıttaki başlık
  const [draft, setDraft] = React.useState<string | null>(null);
  const title = draft ?? topic.title;
  const cancelled = React.useRef(false);

  const commit = () => {
    const t = title.trim();
    if (!cancelled.current && t && t !== topic.title) data().update("topics", topic.id, { title: t });
    cancelled.current = false;
    setDraft(null);
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-2 border-b border-line bg-surface px-2 py-1.5 last:border-b-0",
        isDragging && "relative z-10 rounded-lg border-transparent shadow-lift",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`${topic.title} konusunu taşı`}
        className="flex size-7 cursor-grab touch-none items-center justify-center rounded-md text-ink-subtle opacity-60 transition-opacity outline-none group-hover:opacity-100 hover:bg-hover focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="tabular w-5 text-right text-xs text-ink-subtle">{index + 1}</span>
      <TopicStatusButton
        status={topic.status}
        title={topic.title}
        onChange={(status) =>
          data().update("topics", topic.id, { status, done_at: status === "done" ? new Date().toISOString() : null })
        }
      />
      <input
        value={title}
        onFocus={() => setDraft(topic.title)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            cancelled.current = true;
            e.currentTarget.blur();
          }
        }}
        aria-label="Konu başlığı"
        className={cn(
          "h-8 min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm outline-none hover:bg-hover focus:bg-sunken",
          topic.status === "done" && "text-ink-muted line-through decoration-ink-subtle/60",
        )}
      />
      {topic.done_at && topic.status === "done" && (
        <span className="hidden text-xs text-ink-muted sm:block">{`${fmt(new Date(topic.done_at), "d MMM")} tarihinde bitti`}</span>
      )}
      <button
        type="button"
        onClick={() => data().remove("topics", topic.id)}
        aria-label={`${topic.title} konusunu sil`}
        className="flex size-7 cursor-pointer items-center justify-center rounded-md text-ink-subtle opacity-0 transition-opacity outline-none group-hover:opacity-100 hover:bg-hover hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring max-sm:opacity-60"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
