import { Repeat, BookMarked, LayoutGrid, Library, ListTodo, MessagesSquare, NotebookPen, Quote, StickyNote, Timer, type LucideIcon } from "lucide-react";

import { createNote } from "@/components/notes/create-note";
import { data } from "@/lib/data/store";
import { goTo } from "@/lib/nav/nav-context";
import { ui } from "@/lib/ui-store";

export type QuickAddAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
};

/** Hızlı ekle menüsü ve komut paletinin paylaştığı eylemler. */
export const QUICK_ADD_ACTIONS: QuickAddAction[] = [
  { id: "sticky", label: "Yapışkan not as", icon: StickyNote, run: () => { ui().setStickyFocus(true); goTo("/mantar-pano"); } },
  { id: "task", label: "Görev ekle", icon: ListTodo, run: () => ui().open({ type: "task" }) },
  { id: "note", label: "Not ekle", icon: NotebookPen, run: () => createNote() },
  {
    id: "forum",
    label: "Forumda başlık aç",
    icon: MessagesSquare,
    run: () => ui().open(Object.keys(data().forum_categories).length ? { type: "forum-topic" } : { type: "forum-category" }),
  },
  { id: "habit", label: "Alışkanlık ekle", icon: Repeat, run: () => ui().open({ type: "habit" }) },
  { id: "journal", label: "Günlüğe yaz", icon: BookMarked, run: () => goTo("/gunluk") },
  { id: "quote", label: "Söz ekle", icon: Quote, run: () => ui().open({ type: "quote" }) },
  { id: "resource", label: "Kaynak ekle", icon: Library, run: () => ui().open({ type: "resource" }) },
  { id: "study", label: "Süre ekle", icon: Timer, run: () => ui().open({ type: "study-log" }) },
];

export const ADD_COURSE_ACTION: QuickAddAction = {
  id: "course",
  label: "Alan ekle",
  icon: LayoutGrid,
  run: () => ui().open({ type: "course" }),
};
