import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert, Wrench } from "lucide-react";

import { BrandMark, BrandWordmark } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { COURSE_COLORS } from "@/lib/course-colors";
import { isSupabaseConfigured } from "@/lib/env";
import { StorageChoice } from "./storage-choice";

export const metadata: Metadata = { title: "Giriş yap" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; tasi?: string }>;
}) {
  const { hata, tasi } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-[440px] flex-col items-center">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2.5">
            <BrandMark className="size-9" />
            <BrandWordmark className="text-xl" />
          </div>
          <div className="flex items-center gap-1.5" aria-hidden>
            {COURSE_COLORS.map((c) => (
              <span key={c.key} data-course={c.key} className="size-2 rounded-full bg-course-solid" />
            ))}
          </div>
        </div>

        <div className="w-full rounded-2xl border border-line bg-surface p-6 sm:p-8">
          {hata === "baglanti" && (
            <div
              role="alert"
              data-course="rose"
              className="mb-6 flex gap-2.5 rounded-lg bg-course p-3 text-13 text-course-fg"
            >
              <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
              <p>Bu giriş bağlantısı geçersiz ya da süresi dolmuş. Yeni bir bağlantı iste.</p>
            </div>
          )}

          {isSupabaseConfigured ? (
            <StorageChoice moving={tasi === "1"} />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-xl font-semibold tracking-[-0.01em]">Kurulum bekleniyor</h1>
                <p className="text-sm text-ink-muted">
                  Giriş için Supabase anahtarlarının <code className="rounded-sm bg-sunken px-1 py-0.5 text-13">.env.local</code>{" "}
                  dosyasına yazılması gerekiyor. O zamana kadar arayüzü kurulum modunda gezebilirsin.
                </p>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link href="/bugun">
                  <Wrench />
                  Arayüze göz at
                </Link>
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-13 text-ink-muted">
          Dil, spor, okuma, mutfak, günlük ve notların tek yerde.
        </p>
      </div>
    </main>
  );
}
