"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StickyColors } from "@/components/stickies/sticky-colors";
import { TagInput } from "@/components/tags/tag-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CourseColor } from "@/lib/course-colors";
import { useRow } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { removeWithUndo } from "@/lib/data/undo";

/** Alıntı / vurgu ekle: kitaptaki cümle, sayfa, renk ve kendi notun */
export function HighlightDialog({ resourceId, highlightId, page: presetPage, onClose }: {
  resourceId: string;
  highlightId?: string;
  page?: number;
  onClose: () => void;
}) {
  const resource = useRow("resources", resourceId);
  const h = useRow("highlights", highlightId);
  const [text, setText] = React.useState(h?.text ?? "");
  const [note, setNote] = React.useState(h?.note ?? "");
  const [page, setPage] = React.useState(h?.page != null ? String(h.page) : presetPage ? String(presetPage) : "");
  const [color, setColor] = React.useState<CourseColor>(h?.color ?? "butter");
  const [tags, setTags] = React.useState<string[]>(h?.tags ?? []);
  const [error, setError] = React.useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !note.trim()) return setError("Bir alıntı ya da not yaz.");
    const n = parseInt(page, 10);
    const values = { text: text.trim(), note: note.trim() || null, page: Number.isFinite(n) && n >= 0 ? n : null, color, tags };
    if (h) data().update("highlights", h.id, values);
    else data().insert("highlights", { resource_id: resourceId, ...values });
    toast.success(h ? "Alıntı güncellendi" : "Alıntı eklendi", { description: resource?.title });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{h ? "Alıntıyı düzenle" : "Alıntı ekle"}</DialogTitle>
          <DialogDescription>{resource ? `${resource.title}${resource.author ? ` · ${resource.author}` : ""}` : "Kaynak"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-5" noValidate>
          <Field label="Alıntı" htmlFor="hl-text" hint="Kitaptan altını çizdiğin cümle ya da paragraf." error={error ?? undefined}>
            <Textarea id="hl-text" autoFocus rows={4} className="field-sizing-content min-h-24 font-[450]" value={text} onChange={(e) => { setText(e.target.value); setError(null); }} placeholder="“İnsan, alışkanlıklarının toplamıdır.”" />
          </Field>
          <Field label="Notum (isteğe bağlı)" htmlFor="hl-note">
            <Textarea id="hl-note" rows={2} className="field-sizing-content min-h-16" value={note} onChange={(e) => { setNote(e.target.value); setError(null); }} placeholder="Bu bana ne düşündürdü, nerede kullanırım?" />
          </Field>
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-end gap-4">
            <Field label="Sayfa" htmlFor="hl-page">
              <Input id="hl-page" inputMode="numeric" value={page} onChange={(e) => setPage(e.target.value.replace(/\D/g, ""))} placeholder="42" />
            </Field>
            <Field label="Vurgu rengi">
              <div className="flex h-9 items-center"><StickyColors value={color} onChange={setColor} /></div>
            </Field>
          </div>
          <Field label="Etiketler (isteğe bağlı)">
            <TagInput value={tags} onChange={setTags} placeholder="ör. alıntı, fikir, tekrar oku" />
          </Field>
          <DialogFooter className="sm:justify-between">
            {h ? (
              <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { removeWithUndo("highlights", h, "Alıntı silindi"); onClose(); }}>
                <Trash2 /> Sil
              </Button>
            ) : <span />}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
              <Button type="submit">{h ? "Değişiklikleri kaydet" : "Alıntıyı ekle"}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
