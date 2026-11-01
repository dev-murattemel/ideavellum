"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSelect } from "@/components/ui/time-select";
import { useProfile } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import type { NotificationPrefs } from "@/lib/data/types";
import { WEEKDAY_NAMES } from "@/lib/time";
import { SettingsRow, SettingsSection } from "./settings-section";

export function EmailSection() {
  const profile = useProfile();
  const p = profile.notification_prefs;
  const set = (patch: Partial<NotificationPrefs>) => data().updateProfile({ notification_prefs: { ...p, ...patch } });
  return (
    <SettingsSection title="E-posta" description={`Özetler ${profile.email ?? "hesabındaki e-posta adresine"} gönderilir.`}>
      <div className="flex flex-col divide-y divide-line">
        <SettingsRow label="Sabah özeti saati">
          <span className="block w-32"><TimeSelect label="Sabah özeti saati" from={5 * 60} to={11 * 60} value={p.daily_digest_time} onChange={(v) => set({ daily_digest_time: v })} /></span>
        </SettingsRow>
        <SettingsRow label="Haftalık rapor">
          <span className="flex gap-2">
            <Select value={String(p.weekly_report.weekday)} onValueChange={(v) => set({ weekly_report: { ...p.weekly_report, weekday: Number(v) } })}>
              <SelectTrigger size="sm" className="w-32" aria-label="Haftalık rapor günü"><SelectValue /></SelectTrigger>
              <SelectContent>{WEEKDAY_NAMES.map((d, i) => <SelectItem key={d} value={String(i + 1)}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <span className="block w-28"><TimeSelect label="Haftalık rapor saati" from={6 * 60} to={23 * 60} step={30} value={p.weekly_report.time} onChange={(v) => set({ weekly_report: { ...p.weekly_report, time: v } })} /></span>
          </span>
        </SettingsRow>
      </div>
    </SettingsSection>
  );
}
