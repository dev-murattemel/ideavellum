import { formatDuration } from "@/lib/time";
import type { AiFeature, AiInput, AiOutput } from "./schemas";

/**
 * Önizleme sürümünde sunucu olmadığı için gerçek AI çağrılamaz.
 * Bu fonksiyonlar aynı verilerden basit kurallarla ÖRNEK yanıt üretir; arayüzde "örnek" diye işaretlenir.
 */
export const SAMPLES: { [F in AiFeature]: (input: AiInput<F>) => AiOutput<F> } = {
  weekly: (i) => {
    const pct = i.targetMinutes ? Math.round((i.totalMinutes / i.targetMinutes) * 100) : null;
    const top = i.perCourse[0];
    const behind = i.perCourse.filter((c) => c.target && c.minutes < c.target * 0.6);
    return {
      comment: `${i.range} döneminde toplam ${formatDuration(i.totalMinutes)} çalıştın${pct !== null ? `; bu hedefinin %${pct}'i` : ""}. ${top ? `En çok zamanı “${top.name}” aldı (${formatDuration(top.minutes)}).` : ""} ${i.completedTasks} görev bitirdin ve ${i.streak} günlük serin sürüyor.`.trim(),
      suggestions: [
        ...behind.slice(0, 2).map((c) => `“${c.name}” için hedefin ${formatDuration(c.target - c.minutes)} gerisindesin; hafta başına 30 dakikalık iki kısa oturum koy.`),
        i.attendanceRate !== null && i.attendanceRate < 80 ? `Yoklama oranın %${i.attendanceRate}; kaçırdığın program saatlerinden birini hafta sonuna ertele.` : "Seriyi korumak için her gün en az 15 dakikalık küçük bir oturum yeterli.",
      ].slice(0, 3),
    };
  },
  focus: (i) => {
    const items = [
      ...i.overdue.slice(0, 2).map((t) => ({ title: t.title, reason: `${t.due} tarihinden beri bekliyor${t.course ? ` (${t.course})` : ""}; önce bunu kapat ya da yeni tarih ver.` })),
      ...i.sessionsToday.filter((s) => !s.done).slice(0, 1).map((s) => ({ title: `${s.time} ${s.course}`, reason: "Bugünün programında sıradaki iş; 5 dakika önce hazırlan." })),
      ...i.dueToday.slice(0, 2).map((t) => ({ title: t.title, reason: `Son tarihi bugün (${t.due}).` })),
    ].slice(0, 3);
    const lagging = i.courses.find((c) => c.target && c.weekMinutes < c.target / 2);
    if (items.length < 3 && lagging) items.push({ title: `${lagging.name} için 30 dk çalış`, reason: `Bu hafta ${formatDuration(lagging.weekMinutes)} / ${formatDuration(lagging.target)} hedef.` });
    return { headline: items[0] ? `Bugünün ana işi: ${items[0].title}` : "Bugün sakin bir gün; küçük bir tekrar oturumu yeterli.", items };
  },
  suggest: (i) => {
    const sentences = i.text.split(/[.\n•\-]+/).map((s) => s.trim()).filter((s) => s.length > 12 && s.length < 90);
    const fresh = sentences.filter((s) => !i.existingTopics.some((t) => t.toLowerCase() === s.toLowerCase()));
    return {
      topics: fresh.slice(0, 3).map((s) => ({ title: s.replace(/:$/, ""), why: `“${i.sourceTitle}” içinde geçiyor ve konu listende yok.` })),
      tasks: [
        { title: `“${i.sourceTitle}” için 5 maddelik özet çıkar`, priority: "medium" as const },
        { title: `“${i.sourceTitle}” içinden 3 soru yaz ve cevapla`, priority: "low" as const },
      ],
    };
  },
  outline: (i) => {
    const base = ["Temel kavramlar ve terimler", "Kısa tarihçe ve bağlam", "Ana yöntemler", "Uygulamalı örnekler", "Sık yapılan hatalar", "Mini proje", "Tekrar ve değerlendirme"];
    return {
      topics: base
        .filter((t) => !i.existingTopics.includes(t))
        .map((t, n) => ({ title: n === 0 ? `${i.name}: ${t.toLowerCase()}` : t, note: n === base.length - 1 ? `Hedefe göre kendini ölç${i.goal ? `: “${i.goal.slice(0, 60)}”` : ""}.` : "Önizleme için kural tabanlı örnek." })),
    };
  },
};
