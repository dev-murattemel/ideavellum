"use client";

import * as React from "react";
import { CopyPlus, Clipboard, NotebookPen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRow } from "@/lib/data/hooks";
import { eventCourse } from "@/lib/domain/schedule";
import { copyToWeekdays, entryId, saveEntryToNote } from "@/lib/domain/session-entries";
import { WEEKDAY_SHORT } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { WeekdayChips } from "./weekday-chips";

/** Gün panelinin alt çubuğu: saati düzenle, kopyala, diğer günlere çoğalt, notlara kaydet */
export function OccurrenceActions({ sessionId, date }: { sessionId: string; date: string }) {
  const session = useRow("class_sessions", sessionId)!;
  const area = useRow("courses", session.course_id);
  const course = session.course_id ? area : eventCourse(session);
  const entry = useRow("session_entries", entryId(sessionId, date));
  const note = useRow("notes", entry?.note_id);
  const [days, setDays] = React.useState<number[]>([session.weekday]);
  const [copyOpen, setCopyOpen] = React.useState(false);

  const close = () => ui().openOccurrence(null);

  const copy = () => {
    // Alttaki yapıştırma çubuğu ne yapılacağını anlatır
    ui().setClip({ sessionId, date });
    close();
  };

  const duplicate = () => {
    const made = copyToWeekdays(session, days, date);
    setCopyOpen(false);
    setDays([session.weekday]);
    if (made.length) toast.success(`${made.length} güne kopyalandı`, { description: days.filter((d) => d !== session.weekday).map((d) => WEEKDAY_SHORT[d - 1]).join(", ") });
  };

  const toNote = () => {
    if (!entry || !course) return;
    const id = saveEntryToNote(entry, session.course_id, session.title || course.name);
    toast.success(note ? "Not güncellendi" : "Notlara kaydedildi", {
      action: { label: "Notu aç", onClick: () => { close(); ui().openNote(id); } },
    });
  };

  return (
    <footer className="grid grid-cols-2 gap-2 border-t border-line bg-surface p-4 sm:flex sm:items-center sm:justify-end">
      <Button variant="secondary" size="sm" onClick={copy} title="Kopyala, sonra takvimde istediğin yere yapıştır">
        <Clipboard /> Kopyala
      </Button>
      <Popover open={copyOpen} onOpenChange={setCopyOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="sm"><CopyPlus /> Diğer günlere</Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="flex w-[300px] flex-col gap-3 p-3">
          <p className="text-13 text-ink-muted">Bu saat seçtiğin günlere de eklensin. Bugünün başlığı ve listesi de kopyalanır.</p>
          <WeekdayChips value={days} onChange={setDays} locked={session.weekday} label="Kopyalanacak günler" />
          <Button size="sm" onClick={duplicate} disabled={days.length < 2}>
            {days.length < 2 ? "Gün seç" : `${days.length - 1} güne kopyala`}
          </Button>
        </PopoverContent>
      </Popover>
      <Button size="sm" className="col-span-2" onClick={toNote} disabled={!entry} title={entry ? undefined : "Önce başlık, liste ya da ayrıntı yaz"}>
        <NotebookPen /> {note ? "Notu güncelle" : "Notlara kaydet"}
      </Button>
    </footer>
  );
}
