"use client";

import { TaskDialog } from "@/components/board/task-dialog";
import { CourseDialog } from "@/components/course/course-dialog";
import { TermDialog } from "@/components/course/term-dialog";
import { SessionDialog } from "@/components/schedule/session-dialog";
import { useUI } from "@/lib/ui-store";

/** Uygulama genelindeki diyaloglar tek yerden açılır (hızlı ekle, komut paleti, sayfalar). */
export function DialogHost() {
  const dialog = useUI((s) => s.dialog);
  const close = useUI((s) => s.close);
  if (!dialog) return null;

  switch (dialog.type) {
    case "course":
      return <CourseDialog key={dialog.courseId ?? "new"} courseId={dialog.courseId} onClose={close} />;
    case "term":
      return <TermDialog key={dialog.termId ?? "new"} termId={dialog.termId} onClose={close} />;
    case "session":
      return <SessionDialog key={dialog.sessionId ?? "new"} sessionId={dialog.sessionId} preset={dialog.preset} onClose={close} />;
    case "task":
      return <TaskDialog preset={dialog.preset} onClose={close} />;
    default:
      return null;
  }
}
