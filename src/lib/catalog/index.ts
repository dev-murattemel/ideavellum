import type { AreaKind } from "@/lib/data/types";
import { EXERCISES } from "./exercises";
import { INGREDIENTS, UNITS } from "./ingredients";
import { SURAHS } from "./surahs";
import type { CatalogGroup, CatalogItem, Metric } from "./types";

export type { CatalogItem, Metric } from "./types";
export { UNITS };

const READING: CatalogGroup[] = [{ name: "Okuma", metric: "amount", unit: "sayfa", items: ["Bölüm okuma", "Not çıkarma", "Tekrar okuma", "Özet yazma"] }];

/** Ders türüne göre hazır liste ve yeni maddenin varsayılan ölçüsü */
const BY_KIND: Partial<Record<AreaKind, { groups: CatalogGroup[]; fallback: Metric; unit?: string }>> = {
  fitness: { groups: EXERCISES, fallback: "strength" },
  cooking: { groups: INGREDIENTS, fallback: "amount", unit: "adet" },
  spiritual: { groups: SURAHS, fallback: "amount", unit: "sayfa" },
  reading: { groups: READING, fallback: "amount", unit: "sayfa" },
};

export function catalogFor(kind: AreaKind | undefined): { items: CatalogItem[]; fallback: Metric; unit?: string } {
  const c = (kind && BY_KIND[kind]) || { groups: [], fallback: "plain" as Metric };
  return {
    items: c.groups.flatMap((g) => g.items.map((label) => ({ label, group: g.name, metric: g.metric, unit: g.unit }))),
    fallback: c.fallback,
    unit: c.unit,
  };
}

/** Türkçe karakterleri ve büyük/küçük harfi yok sayan arama anahtarı: "Göğüs" → "gogus" */
export const searchKey = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/[ıİ]/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
