"use client";

import type { StickyNote } from "@/lib/data/types";
import { StickyCard } from "./sticky-card";

/** Izgara görünümü: telefonda ve "Toparlananlar"da (sürükleme yok) */
export function StickyGrid({ stickies, editingId, setEditingId, actions }: {
  stickies: StickyNote[];
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  actions?: (s: StickyNote) => React.ReactNode;
}) {
  return (
    <div className="cork flex flex-wrap justify-center gap-x-5 gap-y-7 rounded-2xl p-5 pt-7 sm:justify-start">
      {stickies.map((s) => (
        <StickyCard
          key={s.id}
          s={s}
          editing={editingId === s.id}
          onEdit={() => setEditingId(s.id)}
          onDone={() => setEditingId(null)}
          actions={actions?.(s)}
          className="cursor-auto max-[480px]:w-full"
        />
      ))}
    </div>
  );
}
