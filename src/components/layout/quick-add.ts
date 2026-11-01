import { BookPlus, Library, ListTodo, NotebookPen, Timer, type LucideIcon } from "lucide-react";

import { createNote } from "@/components/notes/create-note";
import { ui } from "@/lib/ui-store";

export type QuickAddAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
};

/** Hızlı ekle menüsü ve komut paletinin paylaştığı eylemler. */
export const QUICK_ADD_ACTIONS: QuickAddAction[] = [
  { id: "task", label: "Görev ekle", icon: ListTodo, run: () => ui().open({ type: "task" }) },
  { id: "note", label: "Not ekle", icon: NotebookPen, run: () => createNote() },
  { id: "resource", label: "Kaynak ekle", icon: Library, run: () => ui().open({ type: "resource" }) },
  { id: "study", label: "Çalışma süresi ekle", icon: Timer, run: () => ui().open({ type: "study-log" }) },
];

export const ADD_COURSE_ACTION: QuickAddAction = {
  id: "course",
  label: "Ders ekle",
  icon: BookPlus,
  run: () => ui().open({ type: "course" }),
};
