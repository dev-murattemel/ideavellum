"use client";

import * as React from "react";
import { Repeat } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { data } from "@/lib/data/store";
import type { ClassSession, EntryCheck } from "@/lib/data/types";
import { sameAsTemplate } from "@/lib/domain/session-entries";
import { useAutosave } from "./use-autosave";

/** Etkinliğin açıklaması: her günde aynı görünür, buradan da düzenlenir */
export function SeriesNotes({ session }: { session: ClassSession }) {
  const [notes, setNotes] = React.useState(session.notes ?? "");
  const mark = useAutosave(notes, (v) => v.trim() !== (session.notes ?? "") && data().update("class_sessions", session.id, { notes: v.trim() || null }));

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-13 font-semibold">Açıklama</span>
      <Textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); mark(); }}
        placeholder="Bu etkinlik ne için? Ör. Güne sakin başla: cilt bakımı, yürüyüş, haberler"
        className="field-sizing-content min-h-16"
      />
      <span className="text-xs text-ink-subtle">Her günde aynı görünür; kartta başlığın altında yazar.</span>
    </label>
  );
}

/**
 * Bu günün listesini her sefere uygular: sonraki günler aynı maddelerle, işaretsiz başlar.
 * Liste zaten her seferki listeyse yalnızca bunu belirtir.
 */
export function RepeatListButton({ session, items }: { session: ClassSession; items: EntryCheck[] }) {
  if (!items.length) return null;
  if (sameAsTemplate(items, session)) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-ink-subtle">
        <Repeat className="size-3.5" aria-hidden /> Her seferki liste: her gün işaretsiz başlar.
      </p>
    );
  }
  const apply = () => {
    data().update("class_sessions", session.id, { checklist: items.map((c) => ({ ...c, done: false })) });
    toast.success("Liste her sefere eklendi", { description: `${items.length} madde her gün işaretsiz gelecek.` });
  };
  return (
    <button
      type="button"
      onClick={apply}
      className="flex w-fit cursor-pointer items-center gap-1.5 rounded-md text-13 font-medium text-ink-muted transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Repeat className="size-4" aria-hidden /> Bu listeyi her seferde tekrarla
    </button>
  );
}
