"use client";

import * as React from "react";
import { toast } from "sonner";

import { TagInput } from "@/components/tags/tag-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRow } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";

/** Aforizma / alıntı ekleme ve düzenleme. Söyleyen boş kalırsa söz senindir. */
export function QuoteDialog({ quoteId, onClose }: { quoteId?: string; onClose: () => void }) {
  const quote = useRow("quotes", quoteId);
  const [text, setText] = React.useState(quote?.text ?? "");
  const [author, setAuthor] = React.useState(quote?.author ?? "");
  const [source, setSource] = React.useState(quote?.source ?? "");
  const [tags, setTags] = React.useState<string[]>(quote?.tags ?? []);
  const [error, setError] = React.useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (t.length < 2) return setError("Sözü yaz.");
    const values = { text: t, author: author.trim() || null, source: source.trim() || null, tags };
    if (quote) {
      data().update("quotes", quote.id, values);
      toast.success("Söz güncellendi");
    } else {
      data().insert("quotes", { ...values, is_favorite: false });
      toast.success(values.author ? "Alıntı eklendi" : "Aforizman eklendi");
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{quote ? "Sözü düzenle" : "Söz ekle"}</DialogTitle>
          <DialogDescription>Kendi aforizman ya da bir yerde okuyup sevdiğin bir cümle.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          <Field label="Söz" htmlFor="q-text" error={error ?? undefined}>
            <Textarea
              id="q-text"
              autoFocus
              rows={4}
              value={text}
              onChange={(e) => { setText(e.target.value); setError(null); }}
              placeholder="İnsan, alışkanlıklarının toplamıdır."
              className="text-base leading-6"
              aria-invalid={!!error}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Söyleyen" htmlFor="q-author" hint="Boş bırakırsan senin sözün olur.">
              <Input id="q-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Ben" />
            </Field>
            <Field label="Kaynak" htmlFor="q-source">
              <Input id="q-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Kitap, film, sohbet…" />
            </Field>
          </div>
          <Field label="Etiketler">
            <TagInput value={tags} onChange={setTags} className="rounded-md border border-line px-2 py-1" />
          </Field>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
            <Button type="submit">{quote ? "Değişiklikleri kaydet" : "Sözü kaydet"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
