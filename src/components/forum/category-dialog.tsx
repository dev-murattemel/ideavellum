"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ColorPicker } from "@/components/course/color-picker";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CourseColor } from "@/lib/course-colors";
import { useActiveCourses, useRow, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { forumPath } from "@/lib/domain/forum";
import { goTo } from "@/lib/nav/nav-context";

const NONE = "none";

/** Forum kategorisi ekle / düzenle: ad, kısa açıklama, renk, isteğe bağlı alan */
export function CategoryDialog({ categoryId, onClose }: { categoryId?: string; onClose: () => void }) {
  const cat = useRow("forum_categories", categoryId);
  const courses = useActiveCourses();
  const topics = useRows("forum_topics").filter((t) => t.category_id === categoryId).length;
  const [name, setName] = React.useState(cat?.name ?? "");
  const [description, setDescription] = React.useState(cat?.description ?? "");
  const [color, setColor] = React.useState<CourseColor>(cat?.color ?? "sky");
  const [courseId, setCourseId] = React.useState(cat?.course_id ?? NONE);
  const [error, setError] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Kategoriye bir ad ver.");
    const values = { name: name.trim(), description: description.trim() || null, color, course_id: courseId === NONE ? null : courseId };
    if (cat) {
      data().update("forum_categories", cat.id, values);
      toast.success("Kategori güncellendi");
    } else {
      const created = data().insert("forum_categories", { ...values, position: null });
      toast.success("Kategori açıldı", { description: "Şimdi ilk başlığını aç." });
      goTo(forumPath(created.id));
    }
    onClose();
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{cat ? "Kategoriyi düzenle" : "Yeni kategori"}</DialogTitle>
            <DialogDescription>Örneğin Spor, Mutfak, Okuma. İçinde istediğin kadar başlık açarsın.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="flex flex-col gap-5" noValidate>
            <Field label="Ad" htmlFor="fc-name" error={error ?? undefined}>
              <Input
                id="fc-name"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                  // Aynı adlı bir alan varsa kendiliğinden bağla
                  const match = courses.find((c) => c.name.toLocaleLowerCase("tr") === e.target.value.trim().toLocaleLowerCase("tr"));
                  if (match && courseId === NONE) { setCourseId(match.id); setColor(match.color); }
                }}
                placeholder="Spor"
              />
            </Field>
            <Field label="Kısa açıklama (isteğe bağlı)" htmlFor="fc-desc">
              <Textarea id="fc-desc" rows={2} className="min-h-16" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Antrenman programları, sakatlıklar, beslenme…" />
            </Field>
            <Field label="Renk"><ColorPicker value={color} onChange={setColor} /></Field>
            {courses.length > 0 && (
              <Field label="Bağlı alan (isteğe bağlı)" hint="Alan sayfasından bu kategoriye tek tıkla gelirsin.">
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger aria-label="Bağlı alan"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Bağlı değil</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />{c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            <DialogFooter className="sm:justify-between">
              {cat ? (
                <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirm(true)}><Trash2 /> Sil</Button>
              ) : <span />}
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
                <Button type="submit">{cat ? "Değişiklikleri kaydet" : "Kategoriyi aç"}</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`“${cat?.name}” silinsin mi?`}
        description={topics ? `İçindeki ${topics} başlık ve tüm yazıları da silinir.` : "Kategori boş; başka bir şey silinmez."}
        confirmLabel="Sil"
        onConfirm={() => {
          if (cat) data().remove("forum_categories", cat.id);
          toast("Kategori silindi");
          onClose();
          goTo("/forum");
        }}
      />
    </>
  );
}
