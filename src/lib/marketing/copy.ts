import type { Lang } from "./lang";
import { en } from "./copy-en";
import { tr } from "./copy-tr";

export type Feature = { title: string; text: string };
export type Showcase = { eyebrow: string; title: string; text: string; points: string[]; image: string; alt: string };

export type Copy = {
  meta: { title: string; description: string };
  nav: { features: string; pricing: string; faq: string; login: string; start: string };
  hero: { badge: string; title: string; lead: string; primary: string; secondary: string; note: string; alt: string };
  areas: { title: string; items: string[] };
  features: { title: string; lead: string; items: Feature[] };
  showcase: Showcase[];
  how: { title: string; steps: Feature[] };
  pricing: {
    title: string;
    lead: string;
    monthly: string;
    yearly: string;
    perMonth: string;
    perYear: string;
    save: (n: number) => string;
    early: string;
    free: { name: string; tagline: string; cta: string; items: string[] };
    premium: { name: string; tagline: string; cta: string; soon: string; items: string[] };
  };
  faq: { title: string; items: { q: string; a: string }[] };
  cta: { title: string; text: string; button: string };
  footer: { tagline: string; privacy: string; terms: string; refund: string; contact: string; language: string };
};

export const COPY: Record<Lang, Copy> = { en, tr };
