"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSelect } from "@/components/ui/time-select";
import { useActiveCourses, useActiveTerm, useProfile, useRow } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { minutesToTime, timeToMinutes, WEEKDAY_NAMES } from "@/lib/time";
import type { SessionPreset } from "@/lib/ui-store";
import { BellFields, type BellValue } from "./bell-fields";

export function SessionDialog({ sessionId, preset, onClose }: { sessionId?: string; preset?: SessionPreset; onClose: () => void }) {
  const session = useRow("class_sessions", sessionId);
  const courses = useActiveCourses();
  const term = useActiveTerm();
  const profile = useProfile();
  const [confirm, setConfirm] = React.useState(false);

  const [courseId, setCourseId] = React.useState(session?.course_id ?? preset?.course_id ?? courses[0]?.id ?? "");
  const [weekday, setWeekday] = React.useState(String(session?.weekday ?? preset?.weekday ?? 1));
  const [start, setStart] = React.useState(session?.start_time ?? preset?.start_time ?? "19:00");
  const [end, setEnd] = React.useState(session?.end_time ?? preset?.end_time ?? minutesToTime(timeToMinutes(start) + 90));
  const [location, setLocation] = React.useState(session?.location ?? "");
  const [bell, setBell] = React.useState<BellValue>(session?.bell_overrides ?? {});
  const [error, setError] = React.useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return setError("Önce bir ders seç.");
    if (timeToMinutes(end) <= timeToMinutes(start)) return setError("Bitiş saati başlangıçtan sonra olmalı.");
    const values = {
      course_id: courseId, weekday: Number(weekday), start_time: start, end_time: end,
      location: location.trim() || null, bell_overrides: bell,
    };
    if (session) data().update("class_sessions", session.id, values);
    else data().insert("class_sessions", { ...values, valid_from: term?.start_date ?? null, valid_until: term?.end_date ?? null });
    const name = courses.find((c) => c.id === courseId)?.name;
    toast.success(session ? "Ders saati güncellendi" : "Ders saati eklendi", {
      description: `${name} · ${WEEKDAY_NAMES[Number(weekday) - 1]} ${start}–${end}`,
    });
    onClose();
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{session ? "Ders saatini düzenle" : "Ders saati ekle"}</DialogTitle>
            <DialogDescription>Her hafta tekrar eden program saati, örneğin Salı 19:00–20:30.</DialogDescription>
          </DialogHeader>
          {courses.length === 0 ? (
            <p className="rounded-lg bg-sunken p-4 text-sm text-ink-muted">Ders saati eklemek için önce bir ders oluştur.</p>
          ) : (
            <form onSubmit={save} className="flex flex-col gap-5" noValidate>
              <Field label="Ders">
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger aria-label="Ders"><SelectValue placeholder="Ders seç" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-3">
                <Field label="Gün">
                  <Select value={weekday} onValueChange={setWeekday}>
                    <SelectTrigger aria-label="Gün"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEEKDAY_NAMES.map((n, i) => <SelectItem key={n} value={String(i + 1)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Başlangıç">
                  <TimeSelect label="Başlangıç" value={start} to={23 * 60 + 45} onChange={(v) => {
                    const dur = timeToMinutes(end) - timeToMinutes(start);
                    setStart(v);
                    setEnd(minutesToTime(Math.min(24 * 60, timeToMinutes(v) + Math.max(15, dur))));
                  }} />
                </Field>
                <Field label="Bitiş">
                  <TimeSelect label="Bitiş" value={end} onChange={setEnd} />
                </Field>
              </div>
              <Field label="Yer (isteğe bağlı)" htmlFor="s-loc">
                <Input id="s-loc" placeholder="Kütüphane, online, çalışma odası…" value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
              <BellFields value={bell} onChange={setBell} defaults={profile.bell_settings} />
              {error && <p role="alert" className="text-13 text-destructive">{error}</p>}
              <DialogFooter className="sm:justify-between">
                {session ? (
                  <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirm(true)}>
                    <Trash2 /> Ders saatini sil
                  </Button>
                ) : <span />}
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
                  <Button type="submit">{session ? "Değişiklikleri kaydet" : "Ders saati ekle"}</Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Ders saati silinsin mi?"
        description="Bu saatin geçmiş yoklama kayıtları da silinir. Ders ve konuları etkilenmez."
        confirmLabel="Ders saatini sil"
        onConfirm={() => {
          if (session) data().remove("class_sessions", session.id);
          toast("Ders saati silindi");
          onClose();
        }}
      />
    </>
  );
}
