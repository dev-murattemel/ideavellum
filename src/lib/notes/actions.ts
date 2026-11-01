import { Pin, PinOff, Trash2 } from "lucide-react";

import type { RowAction } from "@/components/ui/row-actions";
import { data } from "@/lib/data/store";
import type { Note } from "@/lib/data/types";
import { removeWithUndo } from "@/lib/data/undo";
import { ui } from "@/lib/ui-store";

/** Not satırlarında hover ile çıkan eylemler: sabitle / sil (geri alınabilir) */
export function noteActions(n: Note): RowAction[] {
  return [
    { label: n.is_pinned ? "Sabitlemeyi kaldır" : "Sabitle", icon: n.is_pinned ? PinOff : Pin, active: n.is_pinned, onClick: () => data().update("notes", n.id, { is_pinned: !n.is_pinned }) },
    {
      label: "Notu sil",
      icon: Trash2,
      danger: true,
      onClick: () => {
        if (ui().noteEditorId === n.id) ui().openNote(null);
        removeWithUndo("notes", n, `“${n.title || "Başlıksız not"}” silindi`);
      },
    },
  ];
}
