"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_COLOR_KEYS } from "@/lib/course-colors";
import { useActiveTerm, useRow, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { useNav } from "@/lib/nav/nav-context";
import { formatDuration } from "@/lib/time";
import { ColorPicker } from "./color-picker";

const schema = z
  .object({
    name: z.string().trim().min(2, "Ders adı en az 2 harf olmalı."),
    code: z.string().trim().max(12, "Kod en fazla 12 karakter."),
    color: z.enum(COURSE_COLOR_KEYS),
    term_id: z.string(),
    goal: z.string().trim(),
    description: z.string().trim(),
    target_weekly_minutes: z.string(),
    start_date: z.string(),
    target_end_date: z.string(),
    status: z.enum(["active", "paused", "dropped"]),
  })
  .refine((v) => !v.start_date || !v.target_end_date || v.start_date <= v.target_end_date, {
    message: "Hedef bitiş, başlangıçtan önce olamaz.",
    path: ["target_end_date"],
  });

type Values = z.infer<typeof schema>;
const WEEKLY = [0, 60, 90, 120, 150, 180, 240, 300, 360, 480];
const NO_TERM = "none";

export function CourseDialog({ courseId, onClose }: { courseId?: string; onClose: () => void }) {
  const course = useRow("courses", courseId);
  const terms = useRows("terms");
  const activeTerm = useActiveTerm();
  const nav = useNav();
  const usedColors = useRows("courses").map((c) => c.color);
  const freeColor = COURSE_COLOR_KEYS.find((c) => !usedColors.includes(c)) ?? "lavender";

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: course?.name ?? "",
      code: course?.code ?? "",
      color: course?.color ?? freeColor,
      term_id: course?.term_id ?? activeTerm?.id ?? NO_TERM,
      goal: course?.goal ?? "",
      description: course?.description ?? "",
      target_weekly_minutes: String(course?.target_weekly_minutes ?? 120),
      start_date: course?.start_date ?? activeTerm?.start_date ?? "",
      target_end_date: course?.target_end_date ?? activeTerm?.end_date ?? "",
      status: course && course.status !== "completed" ? course.status : "active",
    },
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit((v) => {
    const values = {
      name: v.name,
      code: v.code || null,
      color: v.color,
      term_id: v.term_id === NO_TERM ? null : v.term_id,
      goal: v.goal || null,
      description: v.description || null,
      target_weekly_minutes: Number(v.target_weekly_minutes) || null,
      start_date: v.start_date || null,
      target_end_date: v.target_end_date || null,
      status: v.status,
    };
    if (course) {
      data().update("courses", course.id, values);
      toast.success("Ders güncellendi");
      onClose();
    } else {
      const created = data().insert("courses", {
        ...values, completed_at: null, final_reflection: null, final_note: null, final_rating: null,
      });
      toast.success(`“${created.name}” eklendi`, { description: "Şimdi konularını ve ders saatlerini ekleyebilirsin." });
      onClose();
      nav.push(`/dersler/${created.id}`);
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? "Dersi düzenle" : "Yeni ders"}</DialogTitle>
          <DialogDescription>{"Örneğin “İngilizce B2” ya da “Lacan'a Giriş”."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <Field label="Ders adı" htmlFor="c-name" error={errors.name?.message}>
              <Input id="c-name" autoFocus placeholder="İngilizce B2" aria-invalid={!!errors.name} {...form.register("name")} />
            </Field>
            <Field label="Kod (isteğe bağlı)" htmlFor="c-code" error={errors.code?.message}>
              <Input id="c-code" placeholder="ENG-B2" {...form.register("code")} />
            </Field>
          </div>
          <Field label="Renk">
            <Controller control={form.control} name="color" render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} />} />
          </Field>
          <Field label="Hedef" htmlFor="c-goal" hint="Bu dersi bitirdiğinde ne yapabiliyor olacaksın?">
            <Textarea id="c-goal" rows={2} placeholder="Ocak sonunda B2 sınavına hazır olmak" {...form.register("goal")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Dönem">
              <Controller control={form.control} name="term_id" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Dönem"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    <SelectItem value={NO_TERM}>Dönemsiz</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </Field>
            <Field label="Haftalık hedef süre">
              <Controller control={form.control} name="target_weekly_minutes" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Haftalık hedef süre"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WEEKLY.map((m) => <SelectItem key={m} value={String(m)}>{m ? formatDuration(m) : "Hedef yok"}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </Field>
            <Field label="Başlangıç" htmlFor="c-start">
              <Input id="c-start" type="date" {...form.register("start_date")} />
            </Field>
            <Field label="Hedef bitiş" htmlFor="c-end" error={errors.target_end_date?.message}>
              <Input id="c-end" type="date" aria-invalid={!!errors.target_end_date} {...form.register("target_end_date")} />
            </Field>
          </div>
          {course && (
            <Field label="Durum">
              <Controller control={form.control} name="status" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label="Durum"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Devam ediyor</SelectItem>
                    <SelectItem value="paused">Ara verildi</SelectItem>
                    <SelectItem value="dropped">Bırakıldı</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </Field>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
            <Button type="submit">{course ? "Değişiklikleri kaydet" : "Dersi ekle"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
