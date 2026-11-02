"use client";

import * as React from "react";
import { ClipboardPaste, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRow } from "@/lib/data/hooks";
import { useUI } from "@/lib/ui-store";

/** Yapıştırma modu açıkken altta görünen ince çubuk */
export function ClipBar() {
  const clip = useUI((s) => s.clip);
  const setClip = useUI((s) => s.setClip);
  const session = useRow("class_sessions", clip?.sessionId);
  const course = useRow("courses", session?.course_id);

  React.useEffect(() => {
    if (!clip) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setClip(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clip, setClip]);

  if (!clip || !session) return null;
  return (
    <div role="status" className="page-in fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 md:bottom-6">
      <div data-course={course?.color} className="flex items-center gap-3 rounded-xl border border-line bg-surface py-2 pr-2 pl-3 shadow-panel">
        <span className="flex size-7 items-center justify-center rounded-md bg-course text-course-fg"><ClipboardPaste className="size-4" aria-hidden /></span>
        <p className="text-13">
          <span className="font-medium">{course?.name} · {session.start_time}–{session.end_time}</span>
          <span className="text-ink-muted"> kopyalandı<span className="hidden sm:inline">. Takvimde boş bir yere tıklayarak yapıştır</span>.</span>
        </p>
        <Button size="sm" variant="secondary" onClick={() => setClip(null)}><X /> Bitir</Button>
      </div>
    </div>
  );
}
