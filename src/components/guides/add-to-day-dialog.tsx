"use client";

import * as React from "react";
import { parseISO } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSelect } from "@/components/ui/time-select";
import { useActiveCourses, useProfile, useRows } from "@/lib/data/hooks";
import { addToDay, ensureCourse, type DayPayload } from "@/lib/domain/add-to-day";
import { occurrencesOn } from "@/lib/domain/schedule";
import { fmt, isoDate, minutesToTime, timeToMinutes, zonedNow } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const NEW = "new";

/**
 * Rehberden takvime ekleme: ders, gün ve saat seçilir. O gün o dersin bir saati varsa
 * ona eklenir; yoksa tek seferlik yeni bir saat açılır.
 */
export function AddToDayDialog({ payload: p, onClose }: { payload: DayPayload; onClose: () => void }) {
  const profile = useProfile();
  const courses = useActiveCourses().filter((c) => c.kind === p.kind);
  const sessions = useRows("class_sessions");
  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? NEW);
  const [date, setDate] = React.useState(isoDate(zonedNow(profile.timezone)));
  const [start, setStart] = React.useState(p.start);
  const [end, setEnd] = React.useState(p.end);
  const [choice, setChoice] = React.useState<string | null>(null);

  const course = courses.find((c) => c.id === courseId);
  const existing = course && date ? occurrencesOn(sessions.filter((s) => s.course_id === course.id), { [course.id]: course }, parseISO(date)) : [];
  // Seçim yapılmadıysa o günün ilk saati önerilir
  const target = choice ?? existing[0]?.session.id ?? NEW;
  const newName = p.kind === "cooking" ? "Mutfak" : "Spor";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    const c = course ?? ensureCourse(p.kind);
    const res = addToDay(p, { courseId: c.id, date, sessionId: target === NEW ? undefined : target, start, end });
    toast.success("Takvime eklendi", {
      description: `${p.name} · ${fmt(parseISO(date), "d MMMM EEEE")}`,
      action: { label: "Günü aç", onClick: () => ui().openOccurrence(res) },
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>“{p.name}” takvime ekle</DialogTitle>
          <DialogDescription>
            {p.kind === "cooking" ? "Malzemeler o günün listesine, yapılışı ayrıntılara yazılır." : "Hareket o günün antrenman listesine önerilen set ve tekrarla eklenir."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Alan">
              {courses.length ? (
                <Select value={courseId} onValueChange={(v) => { setCourseId(v); setChoice(null); }}>
                  <SelectTrigger aria-label="Alan"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />{c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="flex h-9 items-center rounded-md bg-sunken px-3 text-13 text-ink-muted">Yeni: {newName}</p>
              )}
            </Field>
            <Field label="Gün">
              <DatePicker value={date} onChange={(v) => { setDate(v); setChoice(null); }} clearable={false} aria-label="Gün" />
            </Field>
          </div>

          {existing.length > 0 && (
            <div role="radiogroup" aria-label="Hangi saate" className="flex flex-col gap-1.5">
              <span className="text-13 font-medium">Hangi saate?</span>
              {[...existing.map((o) => ({ id: o.session.id, label: `${minutesToTime(o.start)}–${minutesToTime(o.end)} saatine ekle` })), { id: NEW, label: "Yeni saat aç" }].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={target === o.id}
                  onClick={() => setChoice(o.id)}
                  className={cn(
                    "flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    target === o.id ? "border-primary bg-accent-soft/50" : "border-line hover:border-line-strong",
                  )}
                >
                  <span className={cn("size-3.5 rounded-full border-2", target === o.id ? "border-primary bg-primary shadow-[inset_0_0_0_2px_var(--surface-card)]" : "border-line-strong")} aria-hidden />
                  <span className="tabular">{o.label}</span>
                </button>
              ))}
            </div>
          )}

          {target === NEW && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Başlangıç">
                <TimeSelect label="Başlangıç" value={start} onChange={(v) => {
                  const len = timeToMinutes(end) - timeToMinutes(start);
                  setStart(v);
                  setEnd(minutesToTime(Math.min(24 * 60 - 1, timeToMinutes(v) + Math.max(15, len))));
                }} />
              </Field>
              <Field label="Bitiş">
                <TimeSelect label="Bitiş" value={end} onChange={setEnd} />
              </Field>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
            <Button type="submit">Takvime ekle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
