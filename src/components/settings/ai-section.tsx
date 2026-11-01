"use client";

import { Sparkles } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { SettingsRow, SettingsSection } from "./settings-section";

export function AiSection() {
  const p = useProfile();
  return (
    <SettingsSection title="AI asistan" description="Haftalık rapora yorum, notlardan konu ve görev önerisi, günlük odak ve yeni alanlar için konu taslağı.">
      <div className="flex flex-col gap-4">
        <SettingsRow label="AI asistanı kullan" hint="Kapalıyken hiçbir veri AI servisine gönderilmez.">
          <Switch checked={p.ai_enabled} onCheckedChange={(v) => data().updateProfile({ ai_enabled: v })} aria-label="AI asistanı kullan" />
        </SettingsRow>
        <p className="flex gap-2 rounded-lg bg-sunken p-3 text-13 text-ink-muted">
          <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
          Her istek yalnızca o işlem için gereken veriyi (ör. sadece açtığın notun metni) sunucu üzerinden Anthropic’a gönderir. Önerilen konu ve görevler sen onaylamadan kaydedilmez.
        </p>
      </div>
    </SettingsSection>
  );
}
