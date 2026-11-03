import { positionAtEnd } from "@/lib/data/position";
import { data } from "@/lib/data/store";
import type { StickyNote, TiptapDoc } from "@/lib/data/types";
import type { CourseColor } from "@/lib/course-colors";

export const STICKY_W = 208;
export const STICKY_GAP = 20;
const ROW_H = 196;
const PAD = 24;

/** Notun hafif eğikliği: kimlikten türetilir, her açılışta aynı kalır (-2.5° … +2.5°) */
export function tilt(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 50) - 25) / 10;
}

const live = () => Object.values(data().sticky_notes).filter((s) => !s.archived_at);
export const topZ = () => live().reduce((m, s) => Math.max(m, s.z), 0);

/** Panoda boş bir yer: soldan sağa, yukarıdan aşağıya ızgara hücreleri */
export function nextSpot(boardWidth: number) {
  const cols = Math.max(1, Math.floor((boardWidth - PAD * 2 + STICKY_GAP) / (STICKY_W + STICKY_GAP)));
  const taken = live();
  for (let i = 0; i < 400; i++) {
    const x = PAD + (i % cols) * (STICKY_W + STICKY_GAP);
    const y = PAD + Math.floor(i / cols) * ROW_H;
    if (!taken.some((s) => Math.abs(s.x - x) < STICKY_W * 0.6 && Math.abs(s.y - y) < ROW_H * 0.6)) return { x, y };
  }
  return { x: PAD, y: PAD };
}

export function createSticky(text: string, color: CourseColor, tags: string[], boardWidth: number) {
  const spot = nextSpot(boardWidth);
  return data().insert("sticky_notes", {
    text, color, tags, ...spot, z: topZ() + 1, archived_at: null, converted_to: null, task_id: null, note_id: null, journal_date: null,
  });
}

/** "Hizala": tüm notları oluşturulma sırasıyla düzgün bir ızgaraya dizer */
export function arrangeStickies(boardWidth: number) {
  const cols = Math.max(1, Math.floor((boardWidth - PAD * 2 + STICKY_GAP) / (STICKY_W + STICKY_GAP)));
  live()
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .forEach((s, i) => data().update("sticky_notes", s.id, { x: PAD + (i % cols) * (STICKY_W + STICKY_GAP), y: PAD + Math.floor(i / cols) * ROW_H }));
}

/** İlk satır başlık, kalanı ayrıntı */
const split = (text: string) => {
  const [first = "", ...rest] = text.trim().split("\n");
  return { title: first.trim().slice(0, 120) || "Yapışkan not", body: rest.join("\n").trim() };
};

const paragraphs = (text: string) =>
  text.split("\n").map((l) => ({ type: "paragraph", content: l ? [{ type: "text", text: l }] : undefined }));

/**
 * Göreve aktarır (Pano'da "Yapılacak" sütununa). Not panoda kalır, göreve bağlanır;
 * daha önce aktarıldıysa yeni görev açılmaz, var olan döner.
 */
export function stickyToTask(s: StickyNote) {
  const existing = s.task_id ? data().tasks[s.task_id] : undefined;
  if (existing) return { task: existing, created: false };
  const { title, body } = split(s.text);
  const todo = Object.values(data().tasks).filter((t) => t.status === "todo");
  const task = data().insert("tasks", {
    course_id: null, topic_id: null, title, description: body || null, status: "todo", priority: "medium",
    due_at: null, position: positionAtEnd(todo), completed_at: null,
  });
  data().update("sticky_notes", s.id, { task_id: task.id });
  return { task, created: true };
}

/** Nota aktarır (etiketler korunur). Not panoda kalır, nota bağlanır. */
export function stickyToNote(s: StickyNote) {
  const existing = s.note_id ? data().notes[s.note_id] : undefined;
  if (existing) return { note: existing, created: false };
  const { title, body } = split(s.text);
  const content: TiptapDoc = { type: "doc", content: body ? paragraphs(body) : [] };
  const note = data().insert("notes", { course_id: null, topic_id: null, title, content, is_pinned: false, tags: s.tags });
  data().update("sticky_notes", s.id, { note_id: note.id });
  return { note, created: true };
}

/** Bugünün günlük sayfasının sonuna ekler. Not panoda kalır. */
export function stickyToJournal(s: StickyNote, today: string) {
  const entry = Object.values(data().journal_entries).find((j) => j.date === today);
  const add = paragraphs(s.text.trim());
  if (entry) {
    data().update("journal_entries", entry.id, {
      content: { type: "doc", content: [...(entry.content.content ?? []), ...add] },
      tags: [...new Set([...entry.tags, ...s.tags])],
    });
  } else {
    data().insert("journal_entries", { date: today, content: { type: "doc", content: add }, mood: null, tags: s.tags });
  }
  data().update("sticky_notes", s.id, { journal_date: today });
}

/** Arşiv yalnızca kullanıcı isteyince: notu panodan kaldırır ama silmez */
export const archiveSticky = (s: StickyNote) => data().update("sticky_notes", s.id, { archived_at: new Date().toISOString() });
export const restoreSticky = (s: StickyNote) =>
  data().update("sticky_notes", s.id, { archived_at: null, z: topZ() + 1 });
