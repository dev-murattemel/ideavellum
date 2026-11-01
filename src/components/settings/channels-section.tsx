"use client";

import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import type { NotificationChannel, NotificationEvent } from "@/lib/data/types";
import { SettingsSection } from "./settings-section";

const EVENTS: { id: NotificationEvent; label: string; hint: string }[] = [
  { id: "bell", label: "Ders zili", hint: "Ders öncesi, başlangıç, bitiş" },
  { id: "task_due", label: "Görev son tarihi", hint: "Saatliyse 1 saat önce, değilse o sabah" },
  { id: "overdue", label: "Geciken görevler", hint: "Günde bir kez" },
  { id: "daily_digest", label: "Sabah özeti", hint: "Günün programı ve görevleri" },
  { id: "weekly_report", label: "Haftalık rapor", hint: "Süre, görev, yoklama" },
];
const CHANNELS: { id: NotificationChannel; label: string }[] = [
  { id: "in_app", label: "Uygulama" },
  { id: "push", label: "Telefon" },
  { id: "email", label: "E-posta" },
];

export function ChannelsSection() {
  const prefs = useProfile().notification_prefs;
  const toggle = (e: NotificationEvent, c: NotificationChannel, v: boolean) =>
    data().updateProfile({ notification_prefs: { ...prefs, channels: { ...prefs.channels, [e]: { ...prefs.channels[e], [c]: v } } } });

  return (
    <SettingsSection title="Bildirim kanalları" description="Her olay türü için nereden haber almak istediğini seç.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] text-sm">
          <thead>
            <tr className="text-xs text-ink-muted">
              <th className="pb-3 text-left font-medium">Olay</th>
              {CHANNELS.map((c) => <th key={c.id} className="w-24 pb-3 text-center font-medium">{c.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {EVENTS.map((e) => (
              <tr key={e.id}>
                <td className="py-3">
                  <span className="block">{e.label}</span>
                  <span className="block text-xs text-ink-muted">{e.hint}</span>
                </td>
                {CHANNELS.map((c) => (
                  <td key={c.id} className="py-3 text-center">
                    <Switch checked={prefs.channels[e.id][c.id]} onCheckedChange={(v) => toggle(e.id, c.id, v)} aria-label={`${e.label}: ${c.label}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsSection>
  );
}
