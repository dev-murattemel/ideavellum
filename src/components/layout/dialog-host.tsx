"use client";

import { TaskDialog } from "@/components/board/task-dialog";
import { CompleteCourseDialog } from "@/components/course/complete-course-dialog";
import { CourseDialog } from "@/components/course/course-dialog";
import { TermDialog } from "@/components/course/term-dialog";
import { HabitDialog } from "@/components/habits/habit-dialog";
import { QuoteDialog } from "@/components/quotes/quote-dialog";
import { ResourceDialog } from "@/components/resources/resource-dialog";
import { SessionDialog } from "@/components/schedule/session-dialog";
import { StudyLogDialog } from "@/components/study/study-log-dialog";
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
    case "resource":
      return <ResourceDialog key={dialog.resourceId ?? "new"} resourceId={dialog.resourceId} preset={dialog.preset} onClose={close} />;
    case "study-log":
      return <StudyLogDialog preset={dialog.preset} onClose={close} />;
    case "complete-course":
      return <CompleteCourseDialog courseId={dialog.courseId} onClose={close} />;
    case "habit":
      return <HabitDialog key={dialog.habitId ?? "new"} habitId={dialog.habitId} onClose={close} />;
    case "quote":
      return <QuoteDialog key={dialog.quoteId ?? "new"} quoteId={dialog.quoteId} onClose={close} />;
    default:
      return null;
  }
}
