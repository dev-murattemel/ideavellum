import { BookPlus, Library, ListTodo, NotebookPen, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

export type QuickAddAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  run: () => void;
};

const comingSoon = (what: string, phase: string) => () =>
  toast(`${what} ${phase}'de açılacak`, {
    description: "Şimdilik iskelet hazır; bu eylem ilgili aşamada bağlanacak.",
  });

/** Hızlı ekle menüsü ve komut paletinin paylaştığı eylemler. */
export const QUICK_ADD_ACTIONS: QuickAddAction[] = [
  { id: "task", label: "Görev ekle", icon: ListTodo, run: comingSoon("Görev ekleme", "Faz 2") },
  { id: "note", label: "Not ekle", icon: NotebookPen, run: comingSoon("Not ekleme", "Faz 3") },
  { id: "resource", label: "Kaynak ekle", icon: Library, run: comingSoon("Kaynak ekleme", "Faz 3") },
];

export const ADD_COURSE_ACTION: QuickAddAction = {
  id: "course",
  label: "Ders ekle",
  icon: BookPlus,
  run: comingSoon("Ders ekleme", "Faz 1"),
};
