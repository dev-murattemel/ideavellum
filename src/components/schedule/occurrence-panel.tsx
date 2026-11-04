"use client";

import * as React from "react";
import { parseISO } from "date-fns";
import { ChefHat, History, MapPin, Pencil } from "lucide-react";

import { AttendanceButtons } from "@/components/today/attendance-buttons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { kindOf } from "@/lib/area-kinds";
import { useProfile, useRow, useRows } from "@/lib/data/hooks";
import type { EntryCheck } from "@/lib/data/types";
import { eventCourse, repeatLabel } from "@/lib/domain/schedule";
import { newId } from "@/lib/data/ids";
import { dayChecks, entryId, previousEntry, saveEntry, usedChecks } from "@/lib/domain/session-entries";
import { fmt, isoDate, WEEKDAY_NAMES, zonedNow } from "@/lib/time";
import { ui, useUI, type OccurrenceRef } from "@/lib/ui-store";
import { EntryChecklist } from "./entry-checklist";
import { entryHints } from "./entry-hints";
import { OccurrenceActions } from "./occurrence-actions";

/** Takvimde bir karta tıklayınca sağdan açılan gün paneli */
export function OccurrencePanel() {
  const ref = useUI((s) => s.occurrence);
  const open = useUI((s) => s.openOccurrence);
  const session = useRow("class_sessions", ref?.sessionId);

  return (
    <Sheet open={!!(ref && session)} onOpenChange={(o) => !o && open(null)}>
      <SheetContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
        {ref && session && <PanelBody key={`${ref.sessionId}|${ref.date}`} ref_={ref} />}
      </SheetContent>
    </Sheet>
  );
}

/** Yazdıkça kısa gecikmeyle kaydeder; panel kapanırken bekleyeni hemen yazar */
function useAutosave<T>(value: T, save: (v: T) => void) {
  const latest = React.useRef({ value, save, dirty: false });
  React.useEffect(() => {
    latest.current = { value, save, dirty: latest.current.dirty };
  });
  React.useEffect(() => () => {
    if (latest.current.dirty) latest.current.save(latest.current.value);
  }, []);
  React.useEffect(() => {
    if (!latest.current.dirty) return;
    const t = setTimeout(() => {
      latest.current.dirty = false;
      latest.current.save(latest.current.value);
    }, 500);
    return () => clearTimeout(t);
  }, [value]);
  return () => {
    latest.current.dirty = true;
  };
}

function PanelBody({ ref_ }: { ref_: OccurrenceRef }) {
  const { sessionId, date } = ref_;
  const session = useRow("class_sessions", sessionId)!;
  const area = useRow("courses", session.course_id);
  // Serbest etkinlikte alan yerine sanal kayıt; alan saatinin kendi başlığı varsa adı o olur
  const course = session.course_id ? (area && session.title ? { ...area, name: session.title } : area) : eventCourse(session);
  const entry = useRow("session_entries", entryId(sessionId, date));
  const entries = useRows("session_entries");
  const allSessions = useRows("class_sessions");
  const allCourses = useRows("courses");
  const attendance = useRows("attendance").find((a) => a.class_session_id === sessionId && a.date === date);
  const profile = useProfile();
  const vocab = kindOf(course);
  const hints = entryHints(course?.kind);

  const [title, setTitle] = React.useState(entry?.title ?? "");
  const [details, setDetails] = React.useState(entry?.details ?? "");
  const markTitle = useAutosave(title, (v) => v.trim() !== (entry?.title ?? "") && saveEntry(sessionId, date, { title: v.trim() || null }));
  const markDetails = useAutosave(details, (v) => v !== (entry?.details ?? "") && saveEntry(sessionId, date, { details: v || null }));

  // Gün kaydı yoksa saatin her seferki listesi işaretsiz gelir; ilk işarette o güne yazılır
  const checklist = dayChecks(entry, session);
  const setChecklist = (v: EntryCheck[]) => saveEntry(sessionId, date, { checklist: v });
  const prev = !checklist.length && !entry?.title ? previousEntry(sessionId, date, entries) : undefined;
  const isPastOrToday = date <= isoDate(zonedNow(profile.timezone));
  const day = parseISO(date);

  // Aynı türdeki derslerin (ör. tüm spor dersleri) daha önce kullanılan maddeleri
  const used = React.useMemo(() => {
    const kinds = new Set(allCourses.filter((c) => (c.kind ?? "course") === (course?.kind ?? "course")).map((c) => c.id));
    return usedChecks(entries, new Set(allSessions.filter((s) => s.course_id && kinds.has(s.course_id)).map((s) => s.id)));
  }, [entries, allSessions, allCourses, course?.kind]);

  const takePrevious = () => {
    if (!prev) return;
    if (prev.title && !title) {
      setTitle(prev.title);
      markTitle();
    }
    // Ölçüler (set, kg, miktar) korunur; işaretler sıfırlanır
    setChecklist(prev.checklist.map((c) => ({ ...c, id: newId(), done: false })));
  };

  return (
    <>
      <SheetDescription className="sr-only">{vocab.session} ayrıntıları</SheetDescription>
      <div className="flex-1 overflow-y-auto">
        <header data-course={course?.color} className="relative flex flex-col gap-3 bg-course px-5 pt-5 pb-4 text-course-fg">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${vocab.session} saatini düzenle`}
            title="Gün, saat, tekrar ve zil ayarları"
            onClick={() => { ui().openOccurrence(null); ui().open({ type: "session", sessionId }); }}
            className="absolute top-4 right-14 text-course-fg hover:bg-surface/50 hover:text-course-fg"
          >
            <Pencil />
          </Button>
          <p className="flex items-center gap-2 pr-20 text-13 font-medium">
            <vocab.icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{course?.name ?? vocab.label}</span>
          </p>
          <div className="flex flex-col gap-0.5">
            <SheetTitle className="text-xl leading-7 font-semibold first-letter:uppercase">{fmt(day, "d MMMM, EEEE")}</SheetTitle>
            <p className="tabular flex flex-wrap items-center gap-x-2 text-13 opacity-85">
              <span>{session.start_time}–{session.end_time}</span>
              <span aria-hidden>·</span>
              <span>{repeatLabel(session, WEEKDAY_NAMES)}</span>
              {session.location && (
                <span className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{session.location}</span>
              )}
            </p>
            {session.notes && <p className="mt-1 text-13 leading-5 whitespace-pre-line opacity-90">{session.notes}</p>}
          </div>
          {isPastOrToday && <div><AttendanceButtons sessionId={sessionId} date={date} value={attendance?.status} /></div>}
        </header>

        <div className="flex flex-col gap-6 p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-13 font-semibold">Bu günün başlığı</span>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); markTitle(); }}
              placeholder={hints.title}
              className="h-10 rounded-lg border border-line bg-surface px-3 text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-ink-subtle focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <span className="text-xs text-ink-subtle">Takvimdeki kartta adın altında görünür.</span>
          </label>

          {prev && (
            <button
              type="button"
              onClick={takePrevious}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-left transition-colors hover:bg-hover"
            >
              <History className="size-4 shrink-0 text-ink-muted" aria-hidden />
              <span className="min-w-0 flex-1 text-13">
                <span className="font-medium">Geçen seferden al</span>
                <span className="block truncate text-ink-muted">
                  {fmt(parseISO(prev.date), "d MMMM")}{prev.title ? ` · ${prev.title}` : ""}{prev.checklist.length ? ` · ${prev.checklist.length} madde` : ""}
                </span>
              </span>
            </button>
          )}

          <EntryChecklist items={checklist} onChange={setChecklist} placeholder={hints.list} title={hints.listTitle} kind={course?.kind} used={used} />
          {course?.kind === "cooking" && (
            <button
              type="button"
              onClick={() => ui().open({ type: "recipe-picker", sessionId, date })}
              className="-mt-3 flex w-fit cursor-pointer items-center gap-1.5 rounded-md text-13 font-medium text-ink-muted transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChefHat className="size-4" aria-hidden /> Rehberden tarif seç
            </button>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-13 font-semibold">Ayrıntılar</span>
            <Textarea
              value={details}
              onChange={(e) => { setDetails(e.target.value); markDetails(); }}
              placeholder={hints.details}
              className="field-sizing-content min-h-28"
            />
          </label>
        </div>
      </div>
      <OccurrenceActions sessionId={sessionId} date={date} />
    </>
  );
}
