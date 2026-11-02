import type { AreaKind } from "@/lib/data/types";

type Hints = { title: string; list: string; details: string; listTitle: string };

const DEFAULT: Hints = {
  title: "Bugünün konusu",
  listTitle: "Kontrol listesi",
  list: "Yapılacak bir adım ekle",
  details: "Ayrıntılar, bağlantılar, kendine not…",
};

/** Gün panelindeki örnek metinler: dersin türüne göre (spor → setler, mutfak → malzemeler) */
const HINTS: Partial<Record<AreaKind, Hints>> = {
  fitness: { title: "Bugün: üst göğüs, bacak günü…", listTitle: "Hareketler ve setler", list: "Hareket ara: bench press, squat, koşu…", details: "Isınma, ağırlıklar, nasıl hissettim…" },
  cooking: { title: "Bugünkü tarif: mercimek çorbası…", listTitle: "Malzemeler", list: "Malzeme ara: soğan, mercimek, zeytinyağı…", details: "Yapılışı, pişirme süresi, püf noktaları…" },
  reading: { title: "Bugün: 3. bölüm", listTitle: "Okuma listesi", list: "Ekle: bölüm okuma, not çıkarma…", details: "Altını çizdiğim yerler, düşüncelerim…" },
  spiritual: { title: "Bugün: Bakara 1–20", listTitle: "Sureler ve okuma", list: "Sure ara: Yâsîn, Mülk…", details: "Üzerine düşündüklerim…" },
  watching: { title: "Bugün izlenecek video", listTitle: "İzleme listesi", list: "Video başlığı ya da bağlantı", details: "Aldığım notlar…" },
  course: { title: "Bugünün konusu: Present perfect", listTitle: "Kontrol listesi", list: "20 kelime tekrar et", details: "Ders notları, sorular, bağlantılar…" },
};

export const entryHints = (kind: AreaKind | undefined) => (kind && HINTS[kind]) || DEFAULT;
