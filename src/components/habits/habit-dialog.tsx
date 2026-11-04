"use client";

import * as React from "react";
import { Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ColorPicker } from "@/components/course/color-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtAmount, HABIT_UNITS, parseTarget } from "@/lib/domain/habits";
import { COURSE_COLOR_KEYS, type CourseColor } from "@/lib/course-colors";
import { useRow, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { removeWithUndo } from "@/lib/data/undo";
import { cn } from "@/lib/utils";

/** Öneriler: ad + varsa günlük miktar hedefi */
const SUGGESTIONS: { name: string; amount?: number; unit?: string }[] = [
  { name: "Su iç", amount: 2, unit: "litre" },
  { name: "Kitap oku", amount: 20, unit: "sayfa" },
  { name: "Yürüyüş yap", amount: 30, unit: "dakika" },
  { name: "Kuran oku", amount: 2, unit: "sayfa" },
  { name: "Şekersiz gün" },
  { name: "Erken uyu" },
];
const NONE = "none";
const parse = (s: string) => {
  const n = Number(s.replace(",", "."));
  return s.trim() && Number.isFinite(n) && n > 0 ? n : null;
};

/** Alışkanlık ekle / düzenle */
export function HabitDialog({ habitId, onClose }: { habitId?: string; onClose: () => void }) {
  const habit = useRow("habits", habitId);
  const all = useRows("habits");
  const free = COURSE_COLOR_KEYS.find((c) => !all.some((h) => h.color === c)) ?? "mint";
  const [name, setName] = React.useState(habit?.name ?? "");
  const [color, setColor] = React.useState<CourseColor>(habit?.color ?? free);
  const [target, setTarget] = React.useState(habit?.target_per_week ?? 7);
  // Günlük miktar hedefi (isteğe bağlı): 2 litre, 20 sayfa
  // Hedefi olmayan eski alışkanlıkta addaki miktar önerilir ("20 Sayfa Kitap Oku" → 20 sayfa)
  const guess = habit && !habit.target_amount ? parseTarget(habit.name) : null;
  const [amount, setAmount] = React.useState(habit?.target_amount ? fmtAmount(habit.target_amount) : guess ? fmtAmount(guess.amount) : "");
  const [unit, setUnit] = React.useState(habit?.unit ?? guess?.unit ?? "sayfa");
  const resources = useRows("resources").filter((r) => r.status !== "done" || r.id === habit?.resource_id);
  const [resourceId, setResourceId] = React.useState(habit?.resource_id ?? NONE);
  const [error, setError] = React.useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Alışkanlığa bir ad ver.");
    if (amount.trim() && !parse(amount)) return setError("Günlük hedef bir sayı olmalı (ör. 2 ya da 1,5).");
    const target_amount = parse(amount);
    const values = {
      name: name.trim(), color, target_per_week: target,
      target_amount, unit: target_amount ? unit : null,
      resource_id: resourceId === NONE ? null : resourceId,
    };
    if (habit) data().update("habits", habit.id, values);
    else data().insert("habits", { ...values, position: null, archived: false });
    toast.success(habit ? "Alışkanlık güncellendi" : "Alışkanlık eklendi");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{habit ? "Alışkanlığı düzenle" : "Yeni alışkanlık"}</DialogTitle>
          <DialogDescription>Her gün işaretlediğin küçük bir rutin; istersen miktarını ve o güne notunu da yazarsın.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-5" noValidate>
          <Field label="Ad" htmlFor="h-name" error={error ?? undefined}>
            <Input
              id="h-name"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
                // "20 sayfa kitap oku" yazınca hedef kendiliğinden dolar (hedef boşsa)
                const t = parseTarget(e.target.value);
                if (t && !amount.trim()) { setAmount(fmtAmount(t.amount)); setUnit(t.unit); }
              }}
              placeholder="Kitap oku"
            />
          </Field>
          {!habit && (
            <div className="-mt-3 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => { setName(s.name); setAmount(s.amount ? fmtAmount(s.amount) : ""); if (s.unit) setUnit(s.unit); }}
                  className="h-7 cursor-pointer rounded-full border border-line px-2.5 text-xs text-ink-muted hover:border-line-strong hover:text-foreground"
                >
                  {s.name}{s.amount ? ` · ${fmtAmount(s.amount)} ${s.unit}` : ""}
                </button>
              ))}
            </div>
          )}
          <Field label="Günlük hedef (isteğe bağlı)" hint={parse(amount) ? `Her gün ne kadar yaptığını yazarsın; ör. ${fmtAmount(parse(amount)! * 0.75)}/${fmtAmount(parse(amount)!)} ${unit} kısmi gün olur.` : "Boş bırakırsan tek dokunuşla işaretlenir."}>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <Input inputMode="decimal" aria-label="Günlük miktar" value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }} placeholder="ör. 2" />
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger aria-label="Birim"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HABIT_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </Field>
          {resources.length > 0 && (
            <Field label="Bağlı kitap / kaynak (isteğe bağlı)" hint={resourceId !== NONE && parse(amount) && unit === "sayfa" ? "Her gün yazdığın sayfa kitabın ilerlemesine eklenir." : "Alıntılarını ve okuma günlüğünü kaynağın defterinde görürsün."}>
              <Select value={resourceId} onValueChange={setResourceId}>
                <SelectTrigger aria-label="Bağlı kaynak"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Bağlı değil</SelectItem>
                  {resources.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
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
