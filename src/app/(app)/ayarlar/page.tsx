import type { Metadata } from "next";
import { BellRing } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SettingsRow, SettingsSection } from "@/components/settings/settings-section";
import { ThemePicker } from "@/components/settings/theme-picker";
import { DEFAULT_TIMEZONE } from "@/lib/dates";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Ayarlar" description="Profil, görünüm, zil ve bildirim tercihlerin." />

      <div className="rounded-xl border border-line bg-surface px-5 py-8 md:px-8">
        <SettingsSection title="Profil" description="Hesabın ve saat dilimin.">
          <div className="flex flex-col divide-y divide-line">
            <SettingsRow label="Ad">{user?.fullName ?? "—"}</SettingsRow>
            <SettingsRow label="E-posta">{user?.email ?? "Kurulum modunda"}</SettingsRow>
            <SettingsRow label="Saat dilimi">{DEFAULT_TIMEZONE.replace("_", " ")} (İstanbul)</SettingsRow>
          </div>
        </SettingsSection>

        <SettingsSection title="Görünüm" description="Açık, koyu ya da cihazınla aynı tema.">
          <ThemePicker />
        </SettingsSection>

        <SettingsSection
          title="Zil ve bildirimler"
          description="Ders öncesi uyarı, başlangıç ve bitiş zili, telefon ve e-posta bildirimleri."
        >
          <div className="flex items-start gap-3 rounded-lg bg-sunken p-4">
            <BellRing className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
            <p className="text-13 text-ink-muted">
              Zil ve bildirim ayarları Faz 4&apos;te açılacak. Varsayılanlar: ders öncesi 5 dk uyarı, sabah özeti
              07:30, haftalık rapor Pazar 20:00.
            </p>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
