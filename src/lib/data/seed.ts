import { addDays, addWeeks, subDays } from "date-fns";

import { DEFAULT_TIMEZONE } from "@/lib/dates";
import { entryId } from "@/lib/domain/session-entries";
import { isoDate, isoWeekday, wallToUtc, zonedNow } from "@/lib/time";
import { positionAtEnd } from "./position";
import { createBuilder } from "./seed-builder";
import { seedContent, seedHabits, seedJournalAndQuotes, seedStickies } from "./seed-content";
import { seedHistory } from "./seed-history";
import type { ClassSession, EntryCheck, Course, DataSnapshot, NewRow, TopicStatus } from "./types";

type CourseSeed = Omit<NewRow<"courses">, "term_id" | "completed_at" | "final_reflection" | "final_note" | "final_rating" | "status" | "position"> & {
  key: string;
  topics: [string, TopicStatus][];
};

const COURSES: CourseSeed[] = [
  {
    key: "eng", kind: "course", name: "İngilizce B2", code: "ENG-B2", color: "sky",
    description: "Konuşma ve yazma ağırlıklı orta-üst seviye İngilizce.",
    goal: "Ocak sonunda B2 sınavına hazır olmak ve 20 dakikalık bir sunumu rahatça yapabilmek.",
    target_weekly_minutes: 240, start_date: null, target_end_date: null,
    topics: [["Present perfect continuous", "done"], ["Conditionals (2. ve 3. tip)", "done"], ["Reported speech", "in_progress"], ["Passive voice", "not_started"], ["Essay yazımı: görüş yazısı", "not_started"], ["Sunum dili ve geçiş ifadeleri", "not_started"]],
  },
  {
    key: "lacan", kind: "reading", name: "Lacan'a Giriş", code: "PSY-101", color: "lavender",
    description: "Ayna evresinden üç düzene: Lacan psikanalizinin temel kavramları.",
    goal: "Temel kavramları kendi cümlelerimle anlatabilmek ve Écrits'ten iki metni okumak.",
    target_weekly_minutes: 180, start_date: null, target_end_date: null,
    topics: [["Freud'a dönüş", "done"], ["Ayna evresi", "done"], ["Hayali, Simgesel, Gerçek", "in_progress"], ["Büyük Öteki", "not_started"], ["Arzu ve eksiklik", "not_started"], ["Dört söylem", "not_started"]],
  },
  {
    key: "ux", kind: "course", name: "UX Yazarlığı", code: "UXW-201", color: "peach",
    description: "Arayüz metinleri, ses tonu ve mikro metin yazımı.",
    goal: "Kendi ürünüm için ses tonu rehberi ve 30 ekranlık metin seti hazırlamak.",
    target_weekly_minutes: 150, start_date: null, target_end_date: null,
    topics: [["Ses ve ton", "done"], ["Buton ve eylem metinleri", "in_progress"], ["Hata mesajları", "not_started"], ["Boş durumlar", "not_started"], ["Erişilebilir metin", "not_started"]],
  },
  {
    key: "piano", kind: "hobby", name: "Piyano Temelleri", code: "MUS-110", color: "mint",
    description: "Nota okuma, temel akorlar ve iki elle çalma.",
    goal: "Satie – Gymnopédie No.1'i baştan sona çalabilmek.",
    target_weekly_minutes: 120, start_date: null, target_end_date: null,
    topics: [["Nota okuma (sol ve fa anahtarı)", "done"], ["Majör gamlar", "in_progress"], ["Temel akorlar", "in_progress"], ["İki elle bağımsız çalma", "not_started"], ["Gymnopédie No.1", "not_started"]],
  },
  {
    key: "dataviz", kind: "course", name: "Veri Görselleştirme", code: "DAT-210", color: "rose",
    description: "Doğru grafik seçimi, renk ve hikâye anlatımı.",
    goal: "Kendi çalışma verimle aylık bir rapor tasarlamak.",
    target_weekly_minutes: 120, start_date: null, target_end_date: null,
    topics: [["Grafik türleri ve seçim", "done"], ["Renk ve erişilebilirlik", "in_progress"], ["Gösterge panosu düzeni", "not_started"], ["Veriyle hikâye anlatımı", "not_started"]],
  },
  {
    key: "run", kind: "fitness", name: "Koşu ve mobilite", code: "", color: "slate",
    description: "Haftada üç sabah koşusu ve kısa mobilite rutini.",
    goal: "Mart sonunda 10 km'yi durmadan koşabilmek.",
    target_weekly_minutes: 150, start_date: null, target_end_date: null,
    topics: [["5 km tempo koşusu", "done"], ["Kalça mobilitesi rutini", "in_progress"], ["Interval antrenmanı", "not_started"], ["8 km uzun koşu", "not_started"]],
  },
  {
    key: "quran", kind: "spiritual", name: "Kuran okuma", code: "", color: "sage",
    description: "Her sabah kısa okuma ve meal üzerine düşünme.",
    goal: "Ramazan'a kadar bir hatim.",
    target_weekly_minutes: 140, start_date: null, target_end_date: null,
    topics: [["Bakara (1–100)", "done"], ["Bakara (101–200)", "in_progress"], ["Bakara (201–286)", "not_started"], ["Âl-i İmrân", "not_started"]],
  },
];

/** Bugünün haftanın hangi günü olduğuna göre dağıtılmış haftalık program (bugünden itibaren gün farkı). */
const SCHEDULE: [number, string, string, string, string | null][] = [
  [0, "eng", "09:00", "10:30", "Çalışma odası"],
  [0, "dataviz", "13:30", "14:30", null],
  [0, "lacan", "19:00", "20:30", "Kütüphane"],
  [1, "ux", "10:00", "11:30", null],
  [1, "piano", "18:00", "19:00", "Salon"],
  [2, "eng", "09:00", "10:30", "Çalışma odası"],
  [2, "lacan", "20:00", "21:00", null],
  [3, "dataviz", "11:00", "12:30", null],
  [3, "piano", "18:00", "19:00", "Salon"],
  [4, "ux", "10:00", "12:00", null],
  [4, "eng", "17:00", "18:00", "Online konuşma kulübü"],
  [5, "piano", "11:00", "12:00", "Salon"],
  [0, "run", "07:00", "07:45", "Sahil yolu"],
  [2, "run", "07:00", "07:45", "Sahil yolu"],
  [4, "run", "07:00", "08:00", "Sahil yolu"],
  [1, "quran", "06:30", "07:00", null],
  [3, "quran", "06:30", "07:00", null],
  [5, "quran", "08:00", "08:30", null],
];

function seasonName(d: Date) {
  const m = d.getMonth() + 1;
  if (m >= 9) return `${d.getFullYear()} Güz`;
  if (m <= 1) return `${d.getFullYear() - 1} Güz`;
  if (m <= 6) return `${d.getFullYear()} Bahar`;
  return `${d.getFullYear()} Yaz`;
}

export function buildDemoData(userId: string, now: Date = new Date()): DataSnapshot {
  const tz = DEFAULT_TIMEZONE;
  const today = zonedNow(tz, now);
  const { snap, add } = createBuilder(userId, now);

  const termStart = subDays(today, 49);
  const term = add("terms", {
    name: seasonName(today), start_date: isoDate(termStart), end_date: isoDate(addWeeks(today, 12)), is_active: true,
  });
  const prevTerm = add("terms", {
    name: seasonName(subDays(termStart, 60)), start_date: isoDate(subDays(termStart, 150)), end_date: isoDate(subDays(termStart, 14)), is_active: false,
  });

  const courses: Record<string, Course> = {};
  COURSES.forEach(({ key, topics, ...c }) => {
    const course = add("courses", {
      ...c, position: null, term_id: term.id, status: "active", start_date: isoDate(termStart),
      target_end_date: term.end_date, completed_at: null, final_reflection: null, final_note: null, final_rating: null,
    });
    courses[key] = course;
    topics.forEach(([title, status], i) => {
      const existing = Object.values(snap.topics).filter((t) => t.course_id === course.id);
      add("topics", {
        course_id: course.id, title, status, position: positionAtEnd(existing),
        done_at: status === "done" ? wallToUtc(isoDate(subDays(today, 40 - i * 9)), "20:00", tz).toISOString() : null,
      });
    });
  });

  const sessions: ClassSession[] = SCHEDULE.map(([offset, key, start, end, location]) =>
    add("class_sessions", {
      course_id: courses[key].id, weekday: isoWeekday(addDays(today, offset)), start_time: start, end_time: end,
      location, valid_from: term.start_date, valid_until: term.end_date, bell_overrides: {}, repeat: "weekly", anchor_date: null,
    }),
  );

  // Alana bağlı olmayan günlük rutin: açıklama + her seferki liste
  [1, 2, 3, 4, 5].forEach((weekday) =>
    add("class_sessions", {
      course_id: null, title: "Sabah rutini", color: "butter", notes: "Güne sakin başla: telefonsuz ilk yarım saat.",
      checklist: ["Yüz yıkama", "Cilt bakımı", "15 dk yürüyüş", "Haber okuma"].map((label, n) => ({ id: `routine-${n}`, label, done: false })),
      weekday, start_time: "07:00", end_time: "07:45", location: null, valid_from: term.start_date, valid_until: term.end_date,
      bell_overrides: {}, repeat: "weekly", anchor_date: null,
    }),
  );

  // Takvimdeki birkaç günün ayrıntısı: başlık, kontrol listesi, not
  const entry = (i: number, dayOffset: number, title: string, checks: [string, boolean, Partial<EntryCheck>?][], details: string | null) => {
    const sessionId = sessions[i].id;
    const date = isoDate(addDays(today, dayOffset));
    add("session_entries", {
      id: entryId(sessionId, date), class_session_id: sessionId, date, title, details, note_id: null,
      checklist: checks.map(([label, done, m], n) => ({ id: `${sessionId.slice(0, 8)}-${n}`, label, done, ...m })),
    });
  };
  const cardio = (minutes: number | null, km: number | null = null) => ({ metric: "cardio" as const, minutes, km });
  const lift = (sets: number, reps: number, weight: number | null) => ({ metric: "strength" as const, sets, reps, weight });
  entry(12, 0, "Tempo koşusu + güç", [["Isınma", true, cardio(10)], ["Tempolu koşu", true, cardio(24, 4.5)], ["Goblet squat", false, lift(3, 12, 16)], ["Lunge", false, lift(3, 10, 8)], ["Esneme", false, cardio(5)]], "Nabız 150 civarında kalsın. Sağ diz hafif hassas, yokuşa dikkat.");
  entry(13, 2, "Uzun koşu", [["Isınma", false, cardio(10)], ["Koşu", false, cardio(40, 6)], ["Esneme", false, cardio(5)]], null);
  entry(0, 0, "Present perfect + sunum provası", [["20 kelime tekrar", true], ["Sunumu sesli prova et", false]], null);

  seedContent(add, snap, { courses, today, tz });
  seedJournalAndQuotes(add, today);
  seedHabits(add, today, snap);
  seedStickies(add);
  seedHistory(add, { courses, sessions, today, tz, termStart, prevTerm });
  return snap;
}
