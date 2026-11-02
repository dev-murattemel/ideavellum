import type { Lang } from "./lang";
import { legalEn } from "./legal-en";
import { legalTr } from "./legal-tr";

export type LegalKey = "privacy" | "terms" | "refund";
export type LegalDoc = { title: string; intro: string; sections: { h: string; p: string[] }[] };
export type LegalDocs = Record<LegalKey, LegalDoc> & { updated: string; contactFallback: string };

export const LEGAL: Record<Lang, LegalDocs> = { en: legalEn, tr: legalTr };
