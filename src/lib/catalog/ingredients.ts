import type { CatalogGroup } from "./types";

/** Hazır malzeme listesi; her biri miktar + birimle yazılır */
export const INGREDIENTS: CatalogGroup[] = [
  { name: "Sebze", metric: "amount", unit: "adet", items: ["Soğan", "Sarımsak", "Domates", "Biber", "Patates", "Havuç", "Kabak", "Patlıcan", "Ispanak", "Brokoli", "Mantar", "Salatalık", "Marul", "Pırasa", "Kereviz", "Bezelye", "Taze fasulye", "Lahana", "Karnabahar", "Maydanoz", "Dereotu", "Nane"] },
  { name: "Meyve", metric: "amount", unit: "adet", items: ["Limon", "Elma", "Muz", "Portakal", "Çilek", "Avokado", "Nar", "Kuru üzüm"] },
  { name: "Bakliyat ve tahıl", metric: "amount", unit: "su bardağı", items: ["Kırmızı mercimek", "Yeşil mercimek", "Nohut", "Kuru fasulye", "Pirinç", "Bulgur", "Makarna", "Yulaf", "Un", "Galeta unu", "Kinoa", "İrmik"] },
  { name: "Et, balık, yumurta", metric: "amount", unit: "g", items: ["Kıyma", "Tavuk göğsü", "Tavuk but", "Dana kuşbaşı", "Somon", "Levrek", "Ton balığı", "Karides", "Yumurta"] },
  { name: "Süt ürünleri", metric: "amount", unit: "g", items: ["Süt", "Yoğurt", "Beyaz peynir", "Kaşar peyniri", "Tereyağı", "Krema", "Labne", "Parmesan"] },
  { name: "Yağ ve sos", metric: "amount", unit: "yemek kaşığı", items: ["Zeytinyağı", "Ayçiçek yağı", "Domates salçası", "Biber salçası", "Nar ekşisi", "Soya sosu", "Sirke", "Bal", "Tahin", "Hardal"] },
  { name: "Baharat", metric: "amount", unit: "çay kaşığı", items: ["Tuz", "Karabiber", "Pul biber", "Kimyon", "Kekik", "Nane (kuru)", "Toz kırmızı biber", "Zerdeçal", "Tarçın", "Köri", "Defne yaprağı", "Sumak"] },
  { name: "Diğer", metric: "amount", unit: "adet", items: ["Şeker", "Kabartma tozu", "Maya", "Ceviz", "Badem", "Su", "Et suyu", "Tavuk suyu"] },
];

export const UNITS = ["g", "kg", "ml", "lt", "adet", "su bardağı", "çay bardağı", "yemek kaşığı", "tatlı kaşığı", "çay kaşığı", "tutam", "diş", "demet", "dilim", "paket"];
