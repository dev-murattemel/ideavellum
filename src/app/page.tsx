import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/marketing/landing-page";
import { isSupabaseConfigured } from "@/lib/env";
import { COPY } from "@/lib/marketing/copy";
import { resolveLang } from "@/lib/marketing/lang";

type Props = { searchParams: Promise<{ lang?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = await resolveLang((await searchParams).lang);
  const { title, description } = COPY[lang].meta;
  return { title: { absolute: title }, description, openGraph: { title, description, images: ["/marketing/today.webp"] } };
}

/**
 * Giriş yapmış ya da cihaz modunu seçmiş kişi proxy tarafından /bugun'a yönlendirilir;
 * buraya yalnızca yeni ziyaretçi düşer ve tanıtım sayfasını görür.
 */
export default async function Home({ searchParams }: Props) {
  // Kurulum modunda (Supabase yokken) doğrudan uygulamaya
  if (!isSupabaseConfigured) redirect("/bugun");
  const lang = await resolveLang((await searchParams).lang);
  return <LandingPage lang={lang} />;
}
