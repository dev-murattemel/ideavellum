"use client";

import * as React from "react";
import { toast } from "sonner";

import { CourseSelect, NONE } from "@/components/board/task-fields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSelect } from "@/components/ui/time-select";
import { data } from "@/lib/data/store";
import { formatDuration, isoDate, minutesOfDay, minutesToTime, wallToUtc, zonedNow } from "@/lib/time";

const DURATIONS = [15, 20, 25, 30, 45, 60, 75, 90, 120, 150, 180];

/** Zamanlayıcı kullanmadan geçmişe çalışma süresi ekleme */
export function StudyLogDialog({ preset, onClose }: { preset?: { course_id?: string }; onClose: () => void }) {
  const now = zonedNow();
  const [courseId, setCourseId] = React.useState(preset?.course_id ?? NONE);
  const [date, setDate] = React.useState(isoDate(now));
  const [duration, setDuration] = React.useState("30");
  const [start, setStart] = React.useState(minutesToTime(Math.max(6 * 60, Math.floor((minutesOfDay(now) - 30) / 15) * 15)));
  const [error, setError] = React.useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseId === NONE) return setError("Süreyi hangi derse eklediğini seç.");
    const startedAt = wallToUtc(date, start);
    const minutes = Number(duration);
    data().insert("study_logs", {
      course_id: courseId, topic_id: null, started_at: startedAt.toISOString(),
      ended_at: new Date(startedAt.getTime() + minutes * 60000).toISOString(), duration_minutes: minutes, source: "manual",
    });
    toast.success(`${formatDuration(minutes)} çalışma eklendi`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Çalışma süresi ekle</DialogTitle>
          <DialogDescription>Zamanlayıcıyı açmayı unuttuğun bir çalışmayı elle kaydet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          <Field label="Ders" error={error ?? undefined}><CourseSelect value={courseId} onChange={(v) => { setCourseId(v); setError(null); }} /></Field>
          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <Field label="Tarih" htmlFor="sl-date"><Input id="sl-date" type="date" value={date} max={isoDate(now)} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Başlangıç"><TimeSelect label="Başlangıç" value={start} onChange={setStart} to={23 * 60 + 45} /></Field>
          </div>
          <Field label="Süre">
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger aria-label="Süre"><SelectValue /></SelectTrigger>
              <SelectContent>{DURATIONS.map((d) => <SelectItem key={d} value={String(d)}>{formatDuration(d)}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
            <Button type="submit">Süreyi ekle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
