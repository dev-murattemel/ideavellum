import { addDays, parseISO } from "date-fns";

import { newId } from "@/lib/data/ids";
import { data } from "@/lib/data/store";
import type { ClassSession, EntryCheck, SessionEntry, TiptapDoc } from "@/lib/data/types";
import { checkText } from "@/lib/catalog/format";
import { fmt, isoDate, isoWeekday, minutesToTime, timeToMinutes } from "@/lib/time";

/**
 * Aynı ders saati + gün için her cihazda aynı kimlik üretilir; böylece iki tarayıcıda
 * aynı güne ayrıntı yazılırsa çakışmaz, birleşir.
 */
export function entryId(sessionId: string, date: string) {
  const key = `${sessionId}|${date}`;
  const h = (seed: number) => {
    let x = seed ^ key.length;
    for (let i = 0; i < key.length; i++) x = Math.imul(x ^ key.charCodeAt(i), 0x5bd1e995) ^ (x >>> 15);
    return (x >>> 0).toString(16).padStart(8, "0");
  };
  const hex = h(0x9e3779b1) + h(0x85ebca6b) + h(0xc2b2ae35) + h(0x27d4eb2f);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export const entryKey = (sessionId: string, date: string) => `${sessionId}|${date}`;

export const getEntry = (sessionId: string, date: string): SessionEntry | undefined =>
  data().session_entries[entryId(sessionId, date)];

/** O günün ayrıntısını yazar; yoksa oluşturur */
export function saveEntry(sessionId: string, date: string, patch: Partial<Pick<SessionEntry, "title" | "details" | "checklist" | "note_id">>) {
  const current = getEntry(sessionId, date);
  if (current) return data().update("session_entries", current.id, patch);
  data().insert("session_entries", {
    id: entryId(sessionId, date),
    class_session_id: sessionId,
    date,
    title: null,
    details: null,
    checklist: [],
    note_id: null,
    ...patch,
  });
}

export const newCheck = (label: string, extra: Partial<EntryCheck> = {}): EntryCheck => ({ ...extra, id: newId(), label, done: false });

/**
 * Daha önce kullanılan maddeler, en son girilen ölçüleriyle ("Bench press" → 4×10 · 60 kg).
 * Yalnızca verilen ders saatlerinin kayıtlarına bakılır (ör. aynı türdeki dersler).
 */
export function usedChecks(entries: SessionEntry[], sessionIds: Set<string>) {
  const latest = new Map<string, { check: EntryCheck; date: string }>();
  for (const e of entries) {
    if (!sessionIds.has(e.class_session_id)) continue;
    for (const c of e.checklist) {
      const key = c.label.toLocaleLowerCase("tr");
      const prev = latest.get(key);
      if (!prev || prev.date < e.date) latest.set(key, { check: c, date: e.date });
    }
  }
  return [...latest.values()].sort((a, b) => b.date.localeCompare(a.date)).map((x) => x.check);
}

/** Aynı saatin bu tarihten önceki en son dolu günü ("Geçen seferden al" için) */
export function previousEntry(sessionId: string, date: string, entries: SessionEntry[]) {
  return entries
    .filter((e) => e.class_session_id === sessionId && e.date < date && (e.checklist.length || e.title || e.details))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

/** Ayrıntı boş mu (takvimde göstermeye değer bir şey var mı) */
export const entryIsEmpty = (e?: SessionEntry) => !e || (!e.title && !e.details && e.checklist.length === 0);

/** Günün ayrıntısını Tiptap notu biçimine çevirir: ayrıntı paragrafları + işaretlenebilir liste */
function entryToDoc(e: Pick<SessionEntry, "details" | "checklist">): TiptapDoc {
  const text = (t: string) => (t ? [{ type: "text", text: t }] : undefined);
  const paragraphs = (e.details ?? "").split("\n").map((line) => ({ type: "paragraph", content: text(line) }));
  const list = e.checklist.length
    ? [{
        type: "taskList",
        content: e.checklist.map((c) => ({ type: "taskItem", attrs: { checked: c.done }, content: [{ type: "paragraph", content: text(checkText(c)) }] })),
      }]
    : [];
  return { type: "doc", content: [...(e.details ? paragraphs : []), ...list] };
}

/**
 * "Notlara kaydet": günün ayrıntısını dersin notlarına ekler. Daha önce kaydedildiyse
 * aynı not güncellenir; böylece not ile takvim aynı kalır.
 */
export function saveEntryToNote(entry: SessionEntry, courseId: string | null, courseName: string) {
  const title = [courseName, fmt(parseISO(entry.date), "d MMMM"), entry.title].filter(Boolean).join(" · ");
  const content = entryToDoc(entry);
  const existing = entry.note_id ? data().notes[entry.note_id] : undefined;
  if (existing) {
    data().update("notes", existing.id, { title, content });
    return existing.id;
  }
  const note = data().insert("notes", { course_id: courseId, topic_id: null, title, content, is_pinned: false, tags: [] });
  data().update("session_entries", entry.id, { note_id: note.id });
  return note.id;
}

type CopyTarget = { date: Date; startMin?: number };

/**
 * Bir ders saatini başka bir güne (ve istenirse saate) kopyalar. Haftalık saatler o günün
 * haftalık saati olur; tek seferlik / 2 haftalık / aylık saatler o tarihi çapa alır.
 * Kaynak günün ayrıntısı (başlık, liste, metin) varsa yeni güne de taşınır.
 */
export function copySession(source: ClassSession, target: CopyTarget, fromDate?: string) {
  const len = timeToMinutes(source.end_time) - timeToMinutes(source.start_time);
  const start = target.startMin ?? timeToMinutes(source.start_time);
  const end = Math.min(24 * 60 - 1, start + len);
  const repeat = source.repeat ?? "weekly";
  const created = data().insert("class_sessions", {
    course_id: source.course_id,
    title: source.title ?? null,
    color: source.color ?? null,
    weekday: isoWeekday(target.date),
    repeat,
    anchor_date: repeat === "weekly" ? null : isoDate(target.date),
    start_time: minutesToTime(start),
    end_time: minutesToTime(end),
    location: source.location,
    valid_from: source.valid_from,
    valid_until: source.valid_until,
    bell_overrides: source.bell_overrides ?? {},
  });
  const from = fromDate ? getEntry(source.id, fromDate) : undefined;
  if (from && !entryIsEmpty(from)) {
    saveEntry(created.id, isoDate(target.date), {
      title: from.title,
      details: from.details,
      checklist: from.checklist.map((c) => ({ ...c, id: newId(), done: false })),
    });
  }
  return created;
}

/** Haftanın seçilen günlerine kopyalar (kaynağın kendi günü atlanır) */
export function copyToWeekdays(source: ClassSession, weekdays: number[], fromDate: string) {
  const base = parseISO(fromDate);
  const monday = addDays(base, 1 - isoWeekday(base));
  return weekdays
    .filter((w) => w !== source.weekday)
    .map((w) => copySession(source, { date: addDays(monday, w - 1) }, fromDate));
}
