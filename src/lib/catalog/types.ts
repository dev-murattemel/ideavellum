/**
 * Bir listede maddenin nasıl ölçüldüğü:
 * - strength: set × tekrar × kg (bench press)
 * - cardio: dakika ve km (koşu)
 * - amount: miktar + birim (200 g kıyma, 2 sayfa)
 * - plain: sadece metin
 */
export type Metric = "strength" | "cardio" | "amount" | "plain";

export type CatalogGroup = { name: string; metric: Metric; unit?: string; items: string[] };
export type CatalogItem = { label: string; group: string; metric: Metric; unit?: string };
