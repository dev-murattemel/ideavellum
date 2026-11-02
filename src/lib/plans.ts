/**
 * Plan tanımları. Ödeme sistemi (Paddle) bağlanana kadar hiçbir sınır uygulanmaz:
 * erken erişimde herkes her özelliği kullanır. Sınırlar burada tek yerde durur ki
 * ödeme açıldığında arayüz ve kontroller aynı kaynaktan beslensin.
 */
export type PlanKey = "free" | "premium";

export type Plan = {
  key: PlanKey;
  /** USD, aylık ve yıllık fiyat */
  price: { monthly: number; yearly: number };
  limits: { activeTerms: number | null; courses: number | null };
  cloudSync: boolean;
  reminders: boolean;
};

export const PLANS: Record<PlanKey, Plan> = {
  free: {
    key: "free",
    price: { monthly: 0, yearly: 0 },
    limits: { activeTerms: 1, courses: 3 },
    cloudSync: false,
    reminders: false,
  },
  premium: {
    key: "premium",
    price: { monthly: 5, yearly: 48 },
    limits: { activeTerms: null, courses: null },
    cloudSync: true,
    reminders: true,
  },
};

/** Ödeme açık mı? Kapalıyken (erken erişim) sınır yok, fiyatlar "yakında" gösterilir. */
export const BILLING_ENABLED = process.env.NEXT_PUBLIC_BILLING_ENABLED === "true";

/** Yıllık planın aylığa göre kazancı (%), ör. 20 */
export const yearlySaving = () => {
  const { monthly, yearly } = PLANS.premium.price;
  return Math.round((1 - yearly / (monthly * 12)) * 100);
};
