import { addDays } from "date-fns";

import type { CourseColor } from "@/lib/course-colors";
import { isoDate, wallToUtc } from "@/lib/time";
import { positionAtEnd } from "./position";
import type { createBuilder } from "./seed-builder";
import { doc, h, p, todo, ul } from "./tiptap";
import type { Course, DataSnapshot, ResourceStatus, ResourceType, ResourceUnit, TaskPriority, TaskStatus } from "./types";

type Add = ReturnType<typeof createBuilder>["add"];
type Ctx = { courses: Record<string, Course>; today: Date; tz: string };

type TaskSeed = [string, string | null, TaskStatus, TaskPriority, number | null, string | null, [boolean, string][]?];

// [başlık, ders, durum, öncelik, bugünden gün farkı (son tarih), saat, kontrol listesi]
const TASKS: TaskSeed[] = [
  ["Reported speech alıştırmaları (Unit 7)", "eng", "todo", "high", 0, "18:00", [[true, "A bölümü"], [false, "B bölümü"], [false, "Yanlışları deftere yaz"]]],
  ["Ayna evresi metnini ikinci kez oku", "lacan", "in_progress", "medium", 0, "21:00", [[true, "İlk 6 sayfa"], [true, "Kavram haritası"], [false, "Kalan sayfalar"], [false, "3 soru yaz"]]],
  ["Hata mesajı örneklerini topla", "ux", "todo", "medium", -1, "17:00", [[false, "5 uygulamadan ekran görüntüsü"], [false, "İyi / kötü diye ayır"]]],
  ["C majör gamı metronomla 80 bpm", "piano", "in_progress", "low", 1, null, [[true, "Sağ el"], [true, "Sol el"], [false, "İki el"]]],
  ["Renk körlüğü simülasyonuyla 3 grafiği test et", "dataviz", "todo", "medium", 2, null],
  ["Essay taslağı: uzaktan çalışma", "eng", "todo", "urgent", 3, "23:00", [[false, "Giriş paragrafı"], [false, "İki argüman"], [false, "Karşı görüş"], [false, "Sonuç"]]],
  ["Simgesel düzen üzerine 1 sayfalık özet", "lacan", "todo", "high", 4, null],
  ["Buton metinleri kontrol listesi", "ux", "review", "medium", 1, null, [[true, "Eylemi söylüyor mu?"], [true, "Fiil ile başlıyor mu?"], [true, "İki kelimeyi geçiyor mu?"]]],
  ["Konuşma kulübü için 3 dakikalık konu hazırla", "eng", "review", "medium", 4, "16:00"],
  ["Akor geçişleri videosunu izle", "piano", "todo", "low", 6, null],
  ["Gösterge panosu taslağı (Figma)", "dataviz", "in_progress", "high", 5, null, [[true, "Izgara"], [false, "Grafik kartları"], [false, "Renk paleti"]]],
  ["Haftalık kelime listesi: 30 kelime", "eng", "done", "medium", -2, null],
  ["Freud'a dönüş: okuma notları", "lacan", "done", "medium", -6, null],
  ["Ses ve ton rehberi v1", "ux", "done", "high", -4, null, [[true, "3 ilke"], [true, "Örnek cümleler"]]],
  ["Nota okuma testi", "piano", "done", "low", -9, null],
  ["Dönem hedeflerini gözden geçir", null, "todo", "low", 7, null],
  ["Kütüphane kartını yenile", null, "done", "low", -1, null],
];

const RESOURCES: [string, ResourceType, string, string | null, ResourceStatus, number | null, number | null, ResourceUnit | null, number | null, string | null][] = [
  ["English Grammar in Use", "book", "eng", "Raymond Murphy", "in_progress", 142, 380, "page", null, null],
  ["BBC 6 Minute English", "podcast", "eng", "BBC Learning English", "in_progress", 24, 60, "minute", 4, "Kısa, günlük konular; telaffuz için çok iyi."],
  ["Écrits — Ayna Evresi", "book", "lacan", "Jacques Lacan", "in_progress", 6, 9, "page", null, null],
  ["Lacan: A Very Short Introduction", "book", "lacan", "Lionel Bailly", "done", 168, 168, "page", 5, "Kavramları sade dille anlatıyor; başlangıç için ideal."],
  ["Žižek — Lacan ve sinema (konuşma)", "video", "lacan", "Slavoj Žižek", "queued", 0, 52, "minute", null, null],
  ["Microcopy: The Complete Guide", "book", "ux", "Kinneret Yifrah", "in_progress", 3, 11, "chapter", null, null],
  ["Writing is Designing", "book", "ux", "Metts & Welfle", "queued", 0, 200, "page", null, null],
  ["Gymnopédie No.1 — yavaş eğitim videosu", "video", "piano", "Pianote", "in_progress", 12, 34, "minute", null, null],
  ["Fundamentals of Data Visualization", "book", "dataviz", "Claus O. Wilke", "in_progress", 9, 29, "chapter", 4, null],
  ["Datawrapper blog: renk rehberi", "article", "dataviz", "Lisa C. Rost", "done", null, null, null, 5, "Renk paletleri için en iyi pratik kaynak."],
];

export function seedContent(add: Add, snap: DataSnapshot, { courses, today, tz }: Ctx) {
  TASKS.forEach(([title, key, status, priority, dueOffset, time, checklist]) => {
    const inColumn = Object.values(snap.tasks).filter((t) => t.status === status);
    const due = dueOffset === null ? null : wallToUtc(isoDate(addDays(today, dueOffset)), time ?? "23:59", tz);
    const task = add("tasks", {
      course_id: key ? courses[key].id : null, topic_id: null, title, description: null, status, priority,
      due_at: due?.toISOString() ?? null, position: positionAtEnd(inColumn),
      completed_at: status === "done" ? (due ?? new Date()).toISOString() : null,
    });
    checklist?.forEach(([is_done, label]) => {
      const items = Object.values(snap.task_checklist_items).filter((i) => i.task_id === task.id);
      add("task_checklist_items", { task_id: task.id, label, is_done, position: positionAtEnd(items) });
    });
  });

  RESOURCES.forEach(([title, type, key, author, status, cur, total, unit, rating, summary]) =>
    add("resources", {
      course_id: courses[key].id, topic_id: null, type, title, url: null, author, status,
      progress_current: cur, progress_total: total, unit, rating, summary,
    }),
  );

  add("notes", {
    course_id: courses.lacan.id, topic_id: null, title: "Ayna evresi — ana fikirler", is_pinned: true, tags: ["psikanaliz", "özet"],
    content: doc(
      p("Çocuk 6–18 ay arasında aynadaki görüntüsünü kendisi olarak tanır; ama bu tanıma bir yanılgıdır."),
      h(3, "Kilit kavramlar"),
      ul(["Ego bir yanılsama olarak kurulur", "Bütünlük hissi dışarıdan gelir", "Hayali düzenin başlangıcı"]),
      todo([[true, "Écrits'teki metni oku"], [false, "Kendi örneğimi yaz"]]),
    ),
  });
  add("notes", {
    course_id: courses.eng.id, topic_id: null, title: "Reported speech — zaman kaydırma tablosu", is_pinned: false, tags: ["gramer"],
    content: doc(p("Doğrudan anlatımda geçmiş zamana bir adım kaydır:"), ul(["am/is → was", "will → would", "can → could", "have done → had done"])),
  });
  add("notes", {
    course_id: courses.ux.id, topic_id: null, title: "İyi bir boş durum ne söyler?", is_pinned: true, tags: ["ilke"],
    content: doc(p("1) Burada ne olacağını, 2) neden boş olduğunu, 3) ilk adımı söyler. Tek bir net eylem butonu yeter.")),
  });
  add("notes", {
    course_id: courses.piano.id, topic_id: null, title: "Parmak numaraları", is_pinned: false, tags: ["teknik"],
    content: doc(p("Başparmak 1, serçe parmak 5. C majörde başparmak geçişi 3. parmaktan sonra.")),
  });
  add("notes", {
    course_id: null, topic_id: null, title: "Dönem için kendime not", is_pinned: false, tags: ["kişisel", "hedef"],
    content: doc(p("Haftada en az 5 gün, en az 30 dakika. Seriyi bozma ama kendini de yorma.")),
  });
}

const QUOTES: [string, string | null, string | null, string[], boolean][] = [
  ["Az ama her gün; çok ama arada bir'den iyidir.", null, null, ["alışkanlık"], true],
  ["Yorgunluk bazen yanlış işi yapmanın değil, doğru işi çok uzun süre ertelemenin sonucudur.", null, "Sabah yürüyüşü", ["erteleme"], false],
  ["Bir şeyi gerçekten öğrendiğini, onu sade cümlelerle anlatabildiğinde anlarsın.", null, null, ["öğrenme"], false],
  ["Talih, hazırlıkla fırsatın buluştuğu yerdir.", "Seneca", null, ["hazırlık"], true],
  ["Dün akıllıydım, dünyayı değiştirmek istedim. Bugün bilgeyim, kendimi değiştiriyorum.", "Mevlânâ", null, ["değişim"], true],
  ["Ruhum, bir hedefi olmadığında kendini kaybeder.", "Montaigne", "Denemeler", ["hedef"], false],
  ["Sessizlik de bir cevaptır; çoğu zaman en dürüst olanı.", null, null, ["kişisel"], false],
  ["Mükemmel, iyinin düşmanıdır.", "Voltaire", null, ["ilke"], false],
];

const JOURNAL: [number, number, string][] = [
  [-1, 4, "Sabah koşusu zor başladı ama 5 km'yi tamamladım. Akşam Lacan okurken ilk kez 'Büyük Öteki'yi kendi cümlelerimle anlatabildim."],
  [-2, 3, "Gün dağınık geçti. Reported speech alıştırmalarını yarıda bıraktım; yarın sabah ilk iş."],
  [-3, 5, "Piyano'da iki el ilk kez birlikte çalıştı. Küçük ama çok mutlu edici bir an."],
  [-5, 2, "Yorgunum. Uyku düzenim kaydı; bu hafta 23:30'da ekranı kapatmayı deneyeceğim."],
  [-6, 4, "Kuran okumasından sonra kısa bir yürüyüş. Güne sakin başlamak her şeyi değiştiriyor."],
];

/** Önizleme için örnek sözler ve günlük sayfaları */
export function seedJournalAndQuotes(add: Add, today: Date) {
  QUOTES.forEach(([text, author, source, tags, is_favorite]) => add("quotes", { text, author, source, tags, is_favorite }));
  JOURNAL.forEach(([offset, mood, text]) =>
    add("journal_entries", { date: isoDate(addDays(today, offset)), mood, tags: [], content: doc(p(text)) }),
  );
}

/** Önizleme için örnek alışkanlıklar ve son 70 günün işaretleri */
export function seedHabits(add: Add, today: Date) {
  const habits: [string, "sky" | "sage" | "peach" | "lavender", number, number][] = [
    ["2 litre su iç", "sky", 7, 0.85],
    ["10 sayfa kitap oku", "lavender", 5, 0.7],
    ["Kuran oku", "sage", 7, 0.9],
    ["Şekersiz gün", "peach", 4, 0.5],
  ];
  habits.forEach(([name, color, target, rate], hi) => {
    const h = add("habits", { name, color, target_per_week: target, position: null, archived: false });
    for (let i = 0; i < 70; i++) {
      // Sabit ama doğal görünen bir dağılım; son günlerde seri olsun
      const v = Math.abs(Math.sin((i + 1) * (hi + 3) * 12.9898)) % 1;
      if (i < 5 - hi || v < rate) add("habit_checks", { habit_id: h.id, date: isoDate(addDays(today, -i)) });
    }
  });
}

/** Mantar panoda birkaç yapışkan not */
export function seedStickies(add: Add) {
  const notes: [string, CourseColor, string[], number, number][] = [
    ["Sapiens'i bitirince Homo Deus'a geç", "butter", ["okuma"], 24, 24],
    ["Piyano: sol el arpejleri için metronom 60'tan başla", "mint", ["piyano"], 252, 40],
    ["Sunum fikri:\nVeriyle hikâye anlatmanın 3 kuralı", "sky", ["fikir", "iş"], 480, 22],
    ["Annemi ara, hafta sonu kahvaltı planı", "rose", [], 708, 36],
    ["Mercimek ve bulgur bitti, markete yaz", "peach", ["alışveriş"], 40, 230],
    ["Koşu ayakkabısı tabanı aşınmış, yenisine bak", "lavender", ["spor"], 268, 244],
  ];
  notes.forEach(([text, color, tags, x, y], i) =>
    add("sticky_notes", { text, color, tags, x, y, z: i + 1, archived_at: null, converted_to: null, task_id: null, note_id: null, journal_date: null }),
  );
}
