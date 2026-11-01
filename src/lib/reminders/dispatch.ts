import "server-only";

import { createElement } from "react";

import MorningDigest from "@/emails/morning-digest";
import OverdueTasks from "@/emails/overdue-tasks";
import SimpleNotice from "@/emails/simple-notice";
import WeeklyReport from "@/emails/weekly-report";
import type { Profile } from "@/lib/data/types";
import { morningDigestData, overdueData, weeklyReportData } from "@/lib/notifications/digest";
import { sendEmail } from "@/lib/notifications/email";
import { sendPush } from "@/lib/notifications/push";
import type { AdminClient } from "@/lib/supabase/admin";
import { minutesOfDay, utcToWall } from "@/lib/time";
import { inQuietHours } from "./bell-events";
import { loadProfile } from "./generate";

type Reminder = {
  id: string; user_id: string; kind: string; entity_type: string | null; entity_id: string | null;
  fire_at: string; channels: string[]; title: string | null; body: string | null;
};

const STALE_MS = 30 * 60_000; // yarım saatten eski ziller artık anlamsız

async function emailFor(admin: AdminClient, r: Reminder, p: Profile, appUrl: string) {
  if (r.kind === "daily_digest") return { subject: "Günün özeti", react: createElement(MorningDigest, await morningDigestData(admin, p, appUrl)) };
  if (r.kind === "weekly_report") return { subject: "Haftalık rapor", react: createElement(WeeklyReport, await weeklyReportData(admin, p, appUrl)) };
  if (r.entity_type === "overdue") {
    const d = await overdueData(admin, p, appUrl);
    return d.tasks.length ? { subject: `${d.tasks.length} görev gecikti`, react: createElement(OverdueTasks, d) } : null;
  }
  return { subject: r.title ?? "Hatırlatma", react: createElement(SimpleNotice, { appUrl, title: r.title ?? "Hatırlatma", body: r.body }) };
}

/** Zamanı gelmiş hatırlatmaları kanallarına gönderir ve sonucu kaydeder. */
export async function dispatchDue(admin: AdminClient, appUrl: string, now = new Date()) {
  const { data, error } = await admin.from("reminders").select("*").eq("status", "pending").lte("fire_at", now.toISOString()).order("fire_at").limit(200);
  if (error) throw error;
  const profiles = new Map<string, { p: Profile; email: string | null }>();
  let sent = 0;

  for (const r of (data ?? []) as Reminder[]) {
    if (!profiles.has(r.user_id)) {
      const { data: u } = await admin.auth.admin.getUserById(r.user_id);
      profiles.set(r.user_id, { p: await loadProfile(admin, r.user_id), email: u.user?.email ?? null });
    }
    const { p, email } = profiles.get(r.user_id)!;
    const isBell = r.kind.startsWith("bell_") || r.kind === "task_due";
    if (isBell && now.getTime() - new Date(r.fire_at).getTime() > STALE_MS) {
      await admin.from("reminders").update({ status: "cancelled" }).eq("id", r.id);
      continue;
    }
    // Sessiz saatlerde dışarıya gönderilmez; uygulama içi kayıt tutulur.
    const quiet = inQuietHours(p.bell_settings, minutesOfDay(utcToWall(now.toISOString(), p.timezone)));
    const logs: Record<string, unknown>[] = [];
    let failed = false;

    for (const channel of r.channels) {
      if (channel === "in_app") continue; // uygulama açıkken istemci kendisi çalar
      if (quiet) { logs.push({ user_id: r.user_id, reminder_id: r.id, channel, status: "skipped_quiet" }); continue; }
      try {
        if (channel === "push") await sendPush(admin, r.user_id, { title: r.title ?? "ideavellum", body: r.body ?? undefined, tag: r.id, url: r.entity_type === "task" ? "/pano" : "/bugun" });
        if (channel === "email") {
          if (!email) throw new Error("E-posta adresi yok.");
          const mail = await emailFor(admin, r, p, appUrl);
          if (mail) await sendEmail(email, mail.subject, mail.react);
        }
        logs.push({ user_id: r.user_id, reminder_id: r.id, channel, status: "sent" });
      } catch (e) {
        failed = true;
        logs.push({ user_id: r.user_id, reminder_id: r.id, channel, status: "failed", error: e instanceof Error ? e.message : String(e) });
      }
    }
    if (logs.length) await admin.from("notification_log").insert(logs);
    await admin.from("reminders").update({ status: failed ? "failed" : "sent", sent_at: now.toISOString() }).eq("id", r.id);
    sent++;
  }
  return sent;
}
