"use client";

import * as React from "react";

import { useData } from "@/lib/data/store";

/**
 * Supabase'e bağlıyken ders saatleri, görevler ya da bildirim ayarları değişince
 * sunucudaki hatırlatmaları (telefon/e-posta) 3 sn gecikmeyle yeniden üretir.
 */
export function ReminderSync() {
  const mode = useData((s) => s.mode);
  const status = useData((s) => s.status);
  const sessions = useData((s) => s.class_sessions);
  const tasks = useData((s) => s.tasks);
  const prefs = useData((s) => s.profile.notification_prefs);
  const bell = useData((s) => s.profile.bell_settings);
  const first = React.useRef(true);

  React.useEffect(() => {
    if (mode !== "remote" || status !== "ready") return;
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => void fetch("/api/reminders/sync", { method: "POST" }).catch(() => {}), 3000);
    return () => clearTimeout(t);
  }, [mode, status, sessions, tasks, prefs, bell]);

  return null;
}
