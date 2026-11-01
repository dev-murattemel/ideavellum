import { addMinutes, subDays } from "date-fns";

import { isoDate, isoWeekday, timeToMinutes, wallToUtc } from "@/lib/time";
import { positionAtEnd } from "./position";
import { prng, type createBuilder } from "./seed-builder";
import type { ClassSession, Course, Term } from "./types";

type Add = ReturnType<typeof createBuilder>["add"];
type Ctx = {
  courses: Record<string, Course>;
  sessions: ClassSession[];
  today: Date;
  tz: string;
  termStart: Date;
  prevTerm: Term;
};

export function seedHistory(add: Add, { courses, sessions, today, tz, termStart, prevTerm }: Ctx) {
  const rand = prng(42);
  const keys = Object.keys(courses);

  // Çalışma geçmişi: son 70 gün; son 9 gün kesintisiz (seri)
  for (let back = 70; back >= 0; back--) {
    const day = subDays(today, back);
    if (back > 9 && rand() < 0.25) continue;
    const count = back === 0 ? 1 : 1 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      const key = keys[Math.floor(rand() * keys.length)];
      const startMin = back === 0 ? 7 * 60 + 40 : 8 * 60 + Math.floor(rand() * 13) * 60;
      const duration = back === 0 ? 35 : 20 + Math.floor(rand() * 7) * 10;
      const start = wallToUtc(isoDate(day), `${String(Math.floor(startMin / 60)).padStart(2, "0")}:${String(startMin % 60).padStart(2, "0")}`, tz);
      add("study_logs", {
        course_id: courses[key].id, topic_id: null, started_at: start.toISOString(),
        ended_at: addMinutes(start, duration).toISOString(), duration_minutes: duration, source: rand() < 0.7 ? "timer" : "manual",
      });
    }
  }

  // Yoklama: dönem başından dünün sonuna kadar geçmiş ders saatleri
  for (let back = 1; subDays(today, back) >= termStart; back++) {
    const day = subDays(today, back);
    sessions
      .filter((s) => s.weekday === isoWeekday(day))
      .forEach((s) => {
        const r = rand();
        add("attendance", {
          class_session_id: s.id, date: isoDate(day), note: null,
          status: r < 0.82 ? "attended" : r < 0.93 ? "missed" : "postponed",
        });
      });
  }
  // Bugün: biten ders saatleri için yoklama
  const nowMin = today.getHours() * 60 + today.getMinutes();
  sessions
    .filter((s) => s.weekday === isoWeekday(today) && timeToMinutes(s.end_time) <= nowMin)
    .forEach((s) => add("attendance", { class_session_id: s.id, date: isoDate(today), status: "attended", note: null }));

  // Önceki dönemden tamamlanmış iki ders (Transkript)
  const done = [
    {
      name: "Fotoğrafçılığa Giriş", code: "PHO-100", color: "butter" as const, rating: 4, minutes: [14, 38],
      reflection: "Pozlama üçgenini artık düşünmeden kullanıyorum. Işığı okumak en büyük kazanım oldu.",
      note: "Portre ışığına ayrı bir ders açmak iyi olur.",
      topics: ["Pozlama üçgeni", "Kompozisyon", "Doğal ışık", "Sokak fotoğrafçılığı", "Düzenleme temelleri"],
    },
    {
      name: "Stoacılık", code: "PHI-120", color: "sage" as const, rating: 5, minutes: [22, 30],
      reflection: "Kontrol ikiliği günlük hayatımı gerçekten değiştirdi. Sabah notları alışkanlığa dönüştü.",
      note: "Epiktetos'un Söylevler'ini bir gün tamamen oku.",
      topics: ["Kontrol ikiliği", "Seneca'nın mektupları", "Marcus Aurelius", "Negatif görselleştirme"],
    },
  ];
  done.forEach((c, idx) => {
    const completedAt = wallToUtc(prevTerm.end_date, "18:00", tz).toISOString();
    const course = add("courses", {
      kind: "course", term_id: prevTerm.id, name: c.name, code: c.code, color: c.color, description: null, goal: null,
      status: "completed", target_weekly_minutes: 120, start_date: prevTerm.start_date, target_end_date: prevTerm.end_date,
      completed_at: completedAt, final_reflection: c.reflection, final_note: c.note, final_rating: c.rating,
    });
    const topics: { position: string }[] = [];
    c.topics.forEach((title) => {
      const t = add("topics", { course_id: course.id, title, status: "done", done_at: completedAt, position: positionAtEnd(topics) });
      topics.push(t);
    });
    for (let i = 0; i < c.minutes[0]; i++) {
      const day = subDays(termStart, 20 + i * 4 + idx);
      const start = wallToUtc(isoDate(day), "19:00", tz);
      add("study_logs", {
        course_id: course.id, topic_id: null, started_at: start.toISOString(),
        ended_at: addMinutes(start, c.minutes[1] * 3).toISOString(), duration_minutes: c.minutes[1] * 3, source: "timer",
      });
    }
  });
}
