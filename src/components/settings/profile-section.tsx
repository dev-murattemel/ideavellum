"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { SettingsRow, SettingsSection } from "./settings-section";
import { ThemePicker } from "./theme-picker";

const ZONES = [
  ["Europe/Istanbul", "İstanbul (GMT+3)"],
  ["Europe/Berlin", "Berlin"],
  ["Europe/London", "Londra"],
  ["America/New_York", "New York"],
  ["Asia/Dubai", "Dubai"],
];

export function ProfileSection() {
  const p = useProfile();
  return (
    <>
      <SettingsSection title="Profil" description="Adın ve saat dilimin. Tüm saatler bu dilime göre gösterilir.">
        <div className="flex flex-col divide-y divide-line">
          <SettingsRow label="Ad">
            <Input key={p.full_name} defaultValue={p.full_name ?? ""} placeholder="Adın" aria-label="Ad" className="h-8 w-56"
              onBlur={(e) => e.target.value.trim() !== (p.full_name ?? "") && data().updateProfile({ full_name: e.target.value.trim() || null })} />
          </SettingsRow>
          <SettingsRow label="E-posta">{p.email ?? "Önizleme modunda"}</SettingsRow>
          <SettingsRow label="Saat dilimi">
            <Select value={p.timezone} onValueChange={(timezone) => data().updateProfile({ timezone })}>
              <SelectTrigger size="sm" className="w-56" aria-label="Saat dilimi"><SelectValue /></SelectTrigger>
              <SelectContent>{ZONES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </SettingsRow>
        </div>
      </SettingsSection>
      <SettingsSection title="Görünüm" description="Açık, koyu ya da cihazınla aynı tema.">
        <ThemePicker />
      </SettingsSection>
    </>
  );
}
