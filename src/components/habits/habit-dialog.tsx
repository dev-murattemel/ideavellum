"use client";

import * as React from "react";
import { Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ColorPicker } from "@/components/course/color-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { COURSE_COLOR_KEYS, type CourseColor } from "@/lib/course-colors";
import { useRow, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { removeWithUndo } from "@/lib/data/undo";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["2 litre su iç", "10 sayfa kitap oku", "Kuran oku", "Yürüyüş yap", "Şekersiz gün", "Erken uyu"];

/** Alışkanlık ekle / düzenle */
export function HabitDialog({ habitId, onClose }: { habitId?: string; onClose: () => void }) {
  const habit = useRow("habits", habitId);
  const all = useRows("habits");
  const free = COURSE_COLOR_KEYS.find((c) => !all.some((h) => h.color === c)) ?? "mint";
  const [name, setName] = React.useState(habit?.name ?? "");
  const [color, setColor] = React.useState<CourseColor>(habit?.color ?? free);
  const [target, setTarget] = React.useState(habit?.target_per_week ?? 7);
  const [error, setError] = React.useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Alışkanlığa bir ad ver.");
    const values = { name: name.trim(), color, target_per_week: target };
    if (habit) data().update("habits", habit.id, values);
    else data().insert("habits", { ...values, position: null, archived: false });
    toast.success(habit ? "Alışkanlık güncellendi" : "Alışkanlık eklendi");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{habit ? "Alışkanlığı düzenle" : "Yeni alışkanlık"}</DialogTitle>
          <DialogDescription>Her gün tek dokunuşla işaretlediğin küçük bir rutin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-5" noValidate>
          <Field label="Ad" htmlFor="h-name" error={error ?? undefined}>
            <Input id="h-name" autoFocus value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="10 sayfa kitap oku" />
          </Field>
          {!habit && (
            <div className="-mt-3 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => setName(s)} className="h-7 cursor-pointer rounded-full border border-line px-2.5 text-xs text-ink-muted hover:border-line-strong hover:text-foreground">
                  {s}
                </button>
              ))}
            </div>
          )}
          <Field label="Renk"><ColorPicker value={color} onChange={setColor} /></Field>
          <Field label="Haftalık hedef" hint={target === 7 ? "Her gün" : `Haftada ${target} gün`}>
            <div role="radiogroup" aria-label="Haftalık hedef" className="grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={target === n} onClick={() => setTarget(n)}
                  className={cn("tabular h-9 cursor-pointer rounded-md border text-sm font-medium transition-colors", target === n ? "border-foreground bg-foreground text-surface" : "border-line text-ink-muted hover:border-line-strong")}>
                  {n}
                </button>
              ))}
            </div>
          </Field>
          <DialogFooter className="sm:justify-between">
            {habit ? (
              <div className="flex gap-1">
                <Button type="button" variant="ghost" onClick={() => { data().update("habits", habit.id, { archived: true }); toast("Arşive kaldırıldı"); onClose(); }}><Archive /> Arşivle</Button>
                <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { removeWithUndo("habits", habit, `“${habit.name}” silindi`); onClose(); }}><Trash2 /> Sil</Button>
              </div>
            ) : <span />}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
              <Button type="submit">{habit ? "Değişiklikleri kaydet" : "Alışkanlığı ekle"}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
