"use client";

import { defaultProfile } from "./defaults";
import { data } from "./store";
import { TABLE_NAMES, type DataSnapshot, type Profile } from "./types";

export type Backup = { app: "ideavellum"; version: 1; exportedAt: string; data: DataSnapshot; profile: Profile };

const LAST_KEY = "ivl-last-backup";

export function snapshotNow(): { data: DataSnapshot; profile: Profile } {
  const s = data();
  return { data: Object.fromEntries(TABLE_NAMES.map((t) => [t, s[t]])) as unknown as DataSnapshot, profile: s.profile };
}

export const countRows = (d: DataSnapshot) => TABLE_NAMES.reduce((n, t) => n + Object.keys(d[t] ?? {}).length, 0);

/** Tüm verileri tek bir .json dosyası olarak indirir */
export function downloadBackup() {
  const { data: d, profile } = snapshotNow();
  const backup: Backup = { app: "ideavellum", version: 1, exportedAt: new Date().toISOString(), data: d, profile };
  const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ideavellum-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  try {
    localStorage.setItem(LAST_KEY, String(Date.now()));
  } catch {}
  return countRows(d);
}

/** Yedek dosyasını okur ve doğrular */
export async function readBackup(file: File): Promise<Backup> {
  const parsed = JSON.parse(await file.text()) as Partial<Backup>;
  if (parsed.app !== "ideavellum" || parsed.version !== 1 || !parsed.data) throw new Error("Bu dosya bir ideavellum yedeği değil.");
  TABLE_NAMES.forEach((t) => ((parsed.data as DataSnapshot)[t] ??= {} as never));
  return parsed as Backup;
}

export function lastBackupAt(): number | null {
  try {
    const v = localStorage.getItem(LAST_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

/** Dosyadan ya da yedekten gelen profili eksik alanlara karşı varsayılanlarla tamamlar */
export function normalizeProfile(p: Partial<Profile> | undefined, id: string, email: string | null): Profile {
  const base = defaultProfile(id, email);
  return {
    ...base,
    ...(p ?? {}),
    id,
    email,
    bell_settings: { ...base.bell_settings, ...(p?.bell_settings ?? {}), quiet_hours: { ...base.bell_settings.quiet_hours, ...(p?.bell_settings?.quiet_hours ?? {}) } },
    notification_prefs: {
      ...base.notification_prefs,
      ...(p?.notification_prefs ?? {}),
      channels: { ...base.notification_prefs.channels, ...(p?.notification_prefs?.channels ?? {}) },
    },
  };
}
