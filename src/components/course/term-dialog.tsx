"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRow, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";

const schema = z
  .object({
    name: z.string().trim().min(2, "Dönem adı en az 2 harf olmalı."),
    start_date: z.string().min(1, "Başlangıç tarihi seç."),
    end_date: z.string().min(1, "Bitiş tarihi seç."),
    is_active: z.boolean(),
  })
  .refine((v) => v.start_date <= v.end_date, { message: "Bitiş, başlangıçtan önce olamaz.", path: ["end_date"] });

type Values = z.infer<typeof schema>;

export function TermDialog({ termId, onClose }: { termId?: string; onClose: () => void }) {
  const term = useRow("terms", termId);
  const terms = useRows("terms");
  const today = new Date();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: term?.name ?? `${today.getFullYear()} ${today.getMonth() >= 8 ? "Güz" : "Bahar"}`,
      start_date: term?.start_date ?? format(today, "yyyy-MM-dd"),
      end_date: term?.end_date ?? format(addMonths(today, 4), "yyyy-MM-dd"),
      is_active: term?.is_active ?? true,
    },
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit((v) => {
    // Aynı anda tek aktif dönem olur
    if (v.is_active) terms.filter((t) => t.is_active && t.id !== termId).forEach((t) => data().update("terms", t.id, { is_active: false }));
    if (term) data().update("terms", term.id, v);
    else data().insert("terms", v);
    toast.success(term ? "Dönem güncellendi" : `“${v.name}” dönemi açıldı`);
    onClose();
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{term ? "Dönemi düzenle" : "Yeni dönem"}</DialogTitle>
          <DialogDescription>Belirli bir tarih aralığındaki ders paketi, örneğin “2026 Güz”.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <Field label="Dönem adı" htmlFor="t-name" error={errors.name?.message}>
            <Input id="t-name" autoFocus {...form.register("name")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Başlangıç" htmlFor="t-start" error={errors.start_date?.message}>
              <Input id="t-start" type="date" {...form.register("start_date")} />
            </Field>
            <Field label="Bitiş" htmlFor="t-end" error={errors.end_date?.message}>
              <Input id="t-end" type="date" {...form.register("end_date")} />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-sunken px-3 py-3">
            <span className="flex flex-col">
              <span className="text-sm font-medium">Aktif dönem</span>
              <span className="text-xs text-ink-muted">Kenar çubuğunda ve programda bu dönemin dersleri görünür.</span>
            </span>
            <Controller control={form.control} name="is_active" render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Aktif dönem" />
            )} />
          </label>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
            <Button type="submit">{term ? "Değişiklikleri kaydet" : "Dönemi aç"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
