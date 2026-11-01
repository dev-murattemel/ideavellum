import "server-only";

import { addDays } from "date-fns";

import { defaultProfile } from "@/lib/data/defaults";
import type { ClassSession, Course, NotificationChannel, NotificationEvent, Profile, Task } from "@/lib/data/types";
import { taskReminderAt } from "@/lib/domain/task-time";
import type { AdminClient } from "@/lib/supabase/admin";
import { isoDate, isoWeekday, wallToUtc, zonedNow } from "@/lib/time";
import { bellEvents } from "./bell-events";

const WINDOW_DAYS = 14;
const AUTO_KINDS = ["bell_before", "bell_start", "bell_end", "task_due", "daily_digest", "weekly_report", "custom"];

export async function loadProfile(admin: AdminClient, userId: string): Promise<Profile> {
  const { data: row } = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
  const base = defaultProfile(userId);
  return row
    ? {
        ...base,
        full_name: row.full_name,
        timezone: row.timezone ?? base.timezone,
        bell_settings: { ...base.bell_settings, ...(row.bell_settings ?? {}) },
        notification_prefs: { ...base.notification_prefs, ...(row.notification_prefs ?? {}), channels: { ...base.notification_prefs.channels, ...(row.notification_prefs?.channels ?? {}) } },
        ai_enabled: Boolean(row.ai_enabled),
      }
    : base;
}

function channelsFor(p: Profile, e: NotificationEvent): NotificationChannel[] {
  const c = p.notification_prefs.channels[e];
  return (Object.keys(c) as NotificationChannel[]).filter((k) => c[k]);
}

/**
 * Bir kullanıcının önümüzdeki 14 günlük hatırlatmalarını yeniden üretir.
 * Ders saati ya da görev değişince ve her gece çağrılır; bekleyen eski kayıtlar silinip yenileri yazılır.
 */
export async function syncUserReminders(admin: AdminClient, userId: string, now = new Date()) {
  const profile = await loadProfile(admin, userId);
  const tz = profile.timezone;
  const [{ data: sessions }, { data: courses }, { data: tasks }] = await Promise.all([
    admin.from("class_sessions").select("*").eq("user_id", userId),
    admin.from("courses").select("*").eq("user_id", userId),
    admin.from("tasks").select("*").eq("user_id", userId).neq("status", "done").not("due_at", "is", null),
  ]);
  const s = (sessions ?? []).map((x: ClassSession) => ({ ...x, start_time: x.start_time.slice(0, 5), end_time: x.end_time.slice(0, 5) }));
  const courseMap = Object.fromEntries((courses ?? []).map((c: Course) => [c.id, c]));
  const today = zonedNow(tz, now);
  const rows: Record<string, unknown>[] = [];

  const bellCh = channelsFor(profile, "bell");
  if (bellCh.length) {
    bellEvents(s, courseMap, profile.bell_settings, today, WINDOW_DAYS, tz)
      .filter((e) => e.fireAt > now)
      .forEach((e) => rows.push({ user_id: userId, kind: e.kind, entity_type: "class_session", entity_id: e.sessionId, fire_at: e.fireAt.toISOString(), channels: bellCh, title: e.title, body: e.body }));
  }

  const taskCh = channelsFor(profile, "task_due");
  if (taskCh.length) {
    (tasks ?? []).forEach((t: Task) => {
      const at = taskReminderAt(t.due_at!, tz);
      if (at > now) rows.push({ user_id: userId, kind: "task_due", entity_type: "task", entity_id: t.id, fire_at: at.toISOString(), channels: taskCh, title: "Görev hatırlatması", body: t.title });
    });
  }

  const prefs = profile.notification_prefs;
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const day = addDays(today, i);
    const digestAt = wallToUtc(isoDate(day), prefs.daily_digest_time, tz);
    const digestCh = channelsFor(profile, "daily_digest");
    if (digestCh.length && digestAt > now) rows.push({ user_id: userId, kind: "daily_digest", fire_at: digestAt.toISOString(), channels: digestCh, title: "Günün özeti" });
    const overdueCh = channelsFor(profile, "overdue");
    const overdueAt = wallToUtc(isoDate(day), "09:00", tz);
    if (overdueCh.length && overdueAt > now) rows.push({ user_id: userId, kind: "custom", entity_type: "overdue", fire_at: overdueAt.toISOString(), channels: overdueCh, title: "Geciken görevler" });
    const weeklyCh = channelsFor(profile, "weekly_report");
    if (weeklyCh.length && isoWeekday(day) === prefs.weekly_report.weekday) {
      const at = wallToUtc(isoDate(day), prefs.weekly_report.time, tz);
      if (at > now) rows.push({ user_id: userId, kind: "weekly_report", fire_at: at.toISOString(), channels: weeklyCh, title: "Haftalık rapor" });
    }
  }

  const del = await admin.from("reminders").delete().eq("user_id", userId).eq("status", "pending").gt("fire_at", now.toISOString()).in("kind", AUTO_KINDS);
  if (del.error) throw del.error;
  for (let i = 0; i < rows.length; i += 500) {
    const ins = await admin.from("reminders").insert(rows.slice(i, i + 500));
    if (ins.error) throw ins.error;
  }
  return rows.length;
}
