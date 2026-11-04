"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_COLOR_KEYS } from "@/lib/course-colors";
import { useActiveTerm, useRow, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { useNav } from "@/lib/nav/nav-context";
import { formatDuration } from "@/lib/time";
import { AREA_KIND_KEYS, kindOf } from "@/lib/area-kinds";
import { ColorPicker } from "./color-picker";
import { KindPicker } from "./kind-picker";
import { SlotFields, slotError, type Slot } from "./slot-fields";

const schema = z
  .object({
    kind: z.enum(AREA_KIND_KEYS),
    name: z.string().trim().min(2, "Ad en az 2 harf olmalı."),
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
  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [slotErr, setSlotErr] = React.useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      kind: course?.kind ?? "course",
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
  const kind = useWatch({ control: form.control, name: "kind" });

  const submit = form.handleSubmit((v) => {
    const sErr = course ? null : slotError(slots);
    setSlotErr(sErr);
    if (sErr) return;
    const values = {
      kind: v.kind,
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
      toast.success("Alan güncellendi");
      onClose();
    } else {
      const created = data().insert("courses", {
        ...values, position: null, completed_at: null, final_reflection: null, final_note: null, final_rating: null,
      });
      const term = terms.find((t) => t.id === values.term_id);
      slots.forEach((x) =>
        data().insert("class_sessions", {
          course_id: created.id, weekday: x.weekday, start_time: x.start, end_time: x.end, location: null,
          bell_overrides: {}, valid_from: term?.start_date ?? null, valid_until: term?.end_date ?? null, repeat: "weekly", anchor_date: null,
        }),
      );
      toast.success(`“${created.name}” eklendi`, {
        description: slots.length ? `${slots.length} haftalık saat takvime eklendi.` : "Şimdi konularını ve takvim saatlerini ekleyebilirsin.",
      });
      onClose();
      nav.push(`/alanlar/${created.id}`);
    }
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? "Alanı düzenle" : "Yeni alan"}</DialogTitle>
          <DialogDescription>Düzenli zaman ayırdığın her şey bir alan: dil, spor, mutfak, Kuran okuma, yan proje…</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <Field label="Tür">
            <Controller control={form.control} name="kind" render={({ field }) => <KindPicker value={field.value} onChange={field.onChange} />} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
            <Field label="Ad" htmlFor="c-name" error={errors.name?.message}>
              <Input id="c-name" autoFocus placeholder={kindOf({ kind: kind }).example} aria-invalid={!!errors.name} {...form.register("name")} />
            </Field>
            <Field label="Kod (isteğe bağlı)" htmlFor="c-code" error={errors.code?.message}>
              <Input id="c-code" placeholder="ENG-B2" {...form.register("code")} />
            </Field>
          </div>
          <Field label="Renk">
            <Controller control={form.control} name="color" render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} />} />
          </Field>
          <Field label="Hedef" htmlFor="c-goal" hint="Bu alanda neye ulaşmak istiyorsun?">
            <Textarea id="c-goal" rows={2} placeholder="Ocak sonunda B2 sınavına hazır olmak" {...form.register("goal")} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <Controller control={form.control} name="start_date" render={({ field }) => <DatePicker id="c-start" value={field.value} onChange={field.onChange} placeholder="Başlangıç yok" />} />
            </Field>
            <Field label="Hedef bitiş" htmlFor="c-end" error={errors.target_end_date?.message}>
              <Controller control={form.control} name="target_end_date" render={({ field }) => <DatePicker id="c-end" value={field.value} onChange={field.onChange} invalid={!!errors.target_end_date} placeholder="Hedef tarih yok" />} />
            </Field>
          </div>
          {!course && <SlotFields label={`Haftalık program (${kindOf({ kind }).session.toLocaleLowerCase("tr")})`} value={slots} onChange={(v) => { setSlots(v); setSlotErr(null); }} error={slotErr} />}
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
            <Button type="submit">{course ? "Değişiklikleri kaydet" : "Alanı ekle"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
