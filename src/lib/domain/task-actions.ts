import { CircleCheck, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { RowAction } from "@/components/ui/row-actions";
import { data } from "@/lib/data/store";
import type { Task } from "@/lib/data/types";
import { ui } from "@/lib/ui-store";
import { setTaskDone } from "./tasks";

/** Görevi kontrol listesiyle birlikte siler; "Geri al" ikisini de geri getirir. */
export function deleteTaskWithUndo(task: Task) {
  const items = Object.values(data().task_checklist_items).filter((c) => c.task_id === task.id);
  if (ui().taskSheetId === task.id) ui().openTask(null);
  data().remove("tasks", task.id);
  toast(`“${task.title}” silindi`, {
    action: {
      label: "Geri al",
      onClick: () => {
        const { user_id: _u, created_at: _c, updated_at: _up, ...t } = task;
        void _u; void _c; void _up;
        data().insert("tasks", t);
        items.forEach(({ user_id: _iu, created_at: _ic, updated_at: _iup, ...c }) => {
          void _iu; void _ic; void _iup;
          data().insert("task_checklist_items", c);
        });
      },
    },
  });
}

/** Görev satırı/kartı üstüne gelince çıkan eylemler */
export function taskActions(task: Task): RowAction[] {
  const done = task.status === "done";
  return [
    { label: done ? "Geri al" : "Tamamla", icon: done ? RotateCcw : CircleCheck, onClick: () => setTaskDone(task, !done, Object.values(data().tasks)) },
    { label: "Aç", icon: Pencil, onClick: () => ui().openTask(task.id) },
    { label: "Sil", icon: Trash2, danger: true, onClick: () => deleteTaskWithUndo(task) },
  ];
}
