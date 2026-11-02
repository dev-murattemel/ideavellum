import * as React from "react";
import { toast } from "sonner";

import { data } from "@/lib/data/store";
import { copySession } from "@/lib/domain/session-entries";
import { fmt, minutesToTime } from "@/lib/time";
import { ui } from "@/lib/ui-store";

/** Kopyalanan saati verilen güne ve saate yapıştırır. Yapıştırma modu açık kalır; Esc ile biter. */
export function pasteClip(date: Date, startMin: number) {
  const clip = ui().clip;
  const source = clip && data().class_sessions[clip.sessionId];
  if (!clip || !source) {
    ui().setClip(null);
    return false;
  }
  const made = copySession(source, { date, startMin }, clip.date);
  toast.success("Yapıştırıldı", { description: `${fmt(date, "EEEE")} ${minutesToTime(startMin)}–${made.end_time}` });
  return true;
}

/** Yapıştırma modunda imleç boş bir yerdeyken Ctrl/Cmd + V de yapıştırır */
export function usePasteShortcut(active: boolean, slot: { date: Date; min: number } | null) {
  const date = slot?.date;
  const min = slot?.min;
  React.useEffect(() => {
    if (!active || !date || min === undefined) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteClip(date, min);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, date, min]);
}
