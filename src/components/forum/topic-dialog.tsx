"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";

import { NoteEditor } from "@/components/notes/note-editor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRows } from "@/lib/data/hooks";
import type { TiptapDoc } from "@/lib/data/types";
import { byCategoryOrder, createTopic, forumPath } from "@/lib/domain/forum";
import { goTo } from "@/lib/nav/nav-context";

const EMPTY: TiptapDoc = { type: "doc", content: [] };

/** Yeni başlık: kategori, başlık adı ve ilk yazı */
export function TopicDialog({ categoryId, onClose }: { categoryId?: string; onClose: () => void }) {
  const categories = useRows("forum_categories").sort(byCategoryOrder);
  const [cat, setCat] = React.useState(categoryId ?? categories[0]?.id ?? "");
  const [title, setTitle] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const editor = React.useRef<Editor | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cat) return setError("Önce bir kategori seç.");
    if (title.trim().length < 2) return setError("Başlığa bir ad ver.");
    const topic = createTopic(cat, title, (editor.current?.getJSON() as TiptapDoc | undefined) ?? null);
    onClose();
    goTo(forumPath(cat, topic.id));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Yeni başlık</DialogTitle>
          <DialogDescription>Bir konu aç; ilk yazını şimdi ya da sonra yazarsın.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col gap-5" noValidate>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <Field label="Başlık" htmlFor="ft-title" error={error ?? undefined}>
              <Input id="ft-title" autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} placeholder="Ör. Üst vücut programım" />
            </Field>
            <Field label="Kategori">
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger aria-label="Kategori"><SelectValue placeholder="Seç" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            <span className="text-13 font-medium">İlk yazı</span>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-line">
              <NoteEditor
                content={EMPTY}
                onChange={() => {}}
                onReady={(e) => (editor.current = e)}
                placeholder="Ne yazmak istiyorsun? “# ” başlık, “- ” liste, “[] ” yapılacak"
                toolbarClassName="rounded-t-lg"
                contentClassName="tiptap-short px-4"
                minHeightClassName="min-h-48"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
            <Button type="submit">Başlığı aç</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
