"use client";

import { toast } from "sonner";

import { data } from "./store";
import type { NewRow, TableName, Tables } from "./types";

/** Siler ve "Geri al" düğmeli bildirim gösterir; geri alınca kayıt aynı kimlikle döner. */
export function removeWithUndo<K extends TableName>(table: K, row: Tables[K], message: string) {
  data().remove(table, row.id);
  toast(message, {
    action: {
      label: "Geri al",
      onClick: () => {
        const { user_id: _u, created_at: _c, updated_at: _up, ...rest } = row as Tables[K] & Record<string, unknown>;
        void _u; void _c; void _up;
        data().insert(table, rest as unknown as NewRow<K>);
      },
    },
  });
}
