import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";
import { resolveLang } from "@/lib/marketing/lang";
import { LEGAL } from "@/lib/marketing/legal";

type Props = { searchParams: Promise<{ lang?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = await resolveLang((await searchParams).lang);
  return { title: LEGAL[lang].terms.title };
}

export default async function Page({ searchParams }: Props) {
  const lang = await resolveLang((await searchParams).lang);
  return <LegalPage doc="terms" lang={lang} />;
}
