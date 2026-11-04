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
import { minutesToTime, timeToMinutes, WEEKDAY_NAMES, WEEKDAY_SHORT } from "@/lib/time";
import { repeatLabel } from "@/lib/domain/schedule";
import type { SessionPreset } from "@/lib/ui-store";
import { BellFields, type BellValue } from "./bell-fields";
import { RepeatFields } from "./repeat-fields";
import { StickyColors } from "@/components/stickies/sticky-colors";
import type { CourseColor } from "@/lib/course-colors";

const NONE = "none";
import { WeekdayChips } from "./weekday-chips";
import { kindOf } from "@/lib/area-kinds";
import type { SessionRepeat } from "@/lib/data/types";
import { isoDate, zonedNow } from "@/lib/time";

export function SessionDialog({ sessionId, preset, onClose }: { sessionId?: string; preset?: SessionPreset; onClose: () => void }) {
  const session = useRow("class_sessions", sessionId);
  const courses = useActiveCourses();
  const term = useActiveTerm();
  const profile = useProfile();
  const [confirm, setConfirm] = React.useState(false);

  // Varsayılan serbest etkinlik: takvime istediğin her şey eklenebilir; bir alana bağlamak isteğe bağlı
  const [courseId, setCourseId] = React.useState<string>(session ? (session.course_id ?? NONE) : (preset?.course_id ?? NONE));
  const [title, setTitle] = React.useState(session?.title ?? "");
  const [color, setColor] = React.useState<CourseColor>(session?.color ?? "sky");
  const [weekday, setWeekday] = React.useState(String(session?.weekday ?? preset?.weekday ?? 1));
  // Yeni haftalık saat birden çok güne aynı anda eklenebilir (ör. hafta içi her gün 07:00)
  const [days, setDays] = React.useState<number[]>([session?.weekday ?? preset?.weekday ?? 1]);
  const [start, setStart] = React.useState(session?.start_time ?? preset?.start_time ?? "19:00");
  const [end, setEnd] = React.useState(session?.end_time ?? preset?.end_time ?? minutesToTime(timeToMinutes(start) + 90));
  const [location, setLocation] = React.useState(session?.location ?? "");
  const [bell, setBell] = React.useState<BellValue>(session?.bell_overrides ?? {});
  const [error, setError] = React.useState<string | null>(null);
  const [repeat, setRepeat] = React.useState<SessionRepeat>(session?.repeat ?? "weekly");
  const [anchor, setAnchor] = React.useState(session?.anchor_date ?? isoDate(zonedNow(profile.timezone)));
  const area = courses.find((c) => c.id === courseId);
  const label = area ? kindOf(area).session : "Etkinlik";
  const multi = !session && repeat === "weekly";

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area && !title.trim()) return setError("Bir başlık yaz ya da bir alan seç.");
    if (timeToMinutes(end) <= timeToMinutes(start)) return setError("Bitiş saati başlangıçtan sonra olmalı.");
    const values = {
      course_id: area ? area.id : null,
      title: title.trim() || null,
      color: area ? null : color, weekday: Number(weekday), start_time: start, end_time: end,
      location: location.trim() || null, bell_overrides: bell,
      repeat, anchor_date: repeat === "weekly" ? null : anchor,
    };
    const name = title.trim() || area?.name;
    if (session) data().update("class_sessions", session.id, values);
    else if (multi) {
      days.forEach((d) => data().insert("class_sessions", { ...values, weekday: d, valid_from: term?.start_date ?? null, valid_until: term?.end_date ?? null }));
    } else data().insert("class_sessions", { ...values, valid_from: term?.start_date ?? null, valid_until: term?.end_date ?? null });
    toast.success(session ? `${label} güncellendi` : `${label} eklendi`, {
      description: multi && days.length > 1
        ? `${name} · ${days.length} gün (${days.map((d) => WEEKDAY_SHORT[d - 1]).join(", ")}) ${start}–${end}`
        : `${name} · ${repeatLabel({ repeat, anchor_date: anchor, weekday: multi ? days[0] : Number(weekday) }, WEEKDAY_NAMES)} ${start}–${end}`,
    });
    onClose();
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{session ? `${label} düzenle` : `${label} ekle`}</DialogTitle>
            <DialogDescription>Takvime istediğin her şeyi ekle: tek seferlik bir randevu ya da her Salı 19:00 gibi tekrar eden bir saat.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="flex flex-col gap-5" noValidate>
              <Field label="Başlık" htmlFor="s-title" hint={area ? "Boş bırakırsan alanın adı görünür." : undefined}>
                <Input id="s-title" autoFocus={!session} placeholder="Ör. Diş hekimi, Annemle kahvaltı, Koşu" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <Field label="Alan (isteğe bağlı)">
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger aria-label="Alan"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Alan yok · serbest etkinlik</SelectItem>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {!area && (
                  <div className="flex h-9 items-center sm:pb-0">
                    <StickyColors size="sm" value={color} onChange={setColor} />
                  </div>
                )}
              </div>
              {multi && (
                <Field label="Günler">
                  <WeekdayChips value={days} onChange={setDays} />
                </Field>
              )}
              <div className={multi ? "grid grid-cols-2 gap-3" : "grid grid-cols-[1.3fr_1fr_1fr] gap-3"}>
                {!multi && <Field label="Gün">
                  <Select value={weekday} onValueChange={setWeekday} disabled={repeat !== "weekly"}>
                    <SelectTrigger aria-label="Gün"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEEKDAY_NAMES.map((n, i) => <SelectItem key={n} value={String(i + 1)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>}
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
              <RepeatFields
                repeat={repeat}
                anchor={anchor}
                onChange={(v) => {
                  setRepeat(v.repeat);
                  setAnchor(v.anchor);
                  if (v.weekday) setWeekday(String(v.weekday));
                }}
              />
              <Field label="Yer (isteğe bağlı)" htmlFor="s-loc">
                <Input id="s-loc" placeholder="Kütüphane, online, çalışma odası…" value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
              <BellFields value={bell} onChange={setBell} defaults={profile.bell_settings} />
              {error && <p role="alert" className="text-13 text-destructive">{error}</p>}
              <DialogFooter className="sm:justify-between">
                {session ? (
                  <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirm(true)}>
                    <Trash2 /> Sil
                  </Button>
                ) : <span />}
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
                  <Button type="submit">{session ? "Değişiklikleri kaydet" : multi && days.length > 1 ? `${days.length} güne ekle` : `${label} ekle`}</Button>
                </div>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`${label} silinsin mi?`}
        description="Bu saatin geçmiş katılım kayıtları da silinir. Bağlı olduğu alan ve içeriği etkilenmez."
        confirmLabel="Sil"
        onConfirm={() => {
          if (session) data().remove("class_sessions", session.id);
          toast(`${label} silindi`);
          onClose();
        }}
      />
    </>
  );
}
