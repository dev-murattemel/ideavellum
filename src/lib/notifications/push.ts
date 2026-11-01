import "server-only";

import webpush from "web-push";

import { publicEnv, serverEnv } from "@/lib/env";
import type { AdminClient } from "@/lib/supabase/admin";

let configured = false;
function configure() {
  if (configured) return true;
  const env = serverEnv();
  if (!publicEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) return false;
  webpush.setVapidDetails(env.VAPID_SUBJECT, publicEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

/** Kullanıcının tüm cihazlarına bildirim gönderir; geçersiz abonelikleri temizler. */
export async function sendPush(admin: AdminClient, userId: string, payload: { title: string; body?: string; url?: string; tag?: string }) {
  if (!configure()) throw new Error("VAPID anahtarları eksik.");
  const { data: subs } = await admin.from("push_subscriptions").select("*").eq("user_id", userId);
  if (!subs?.length) throw new Error("Kayıtlı cihaz yok.");
  const results = await Promise.allSettled(
    subs.map((s: { id: string; endpoint: string; p256dh: string; auth: string }) =>
      webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload)).catch(async (err: { statusCode?: number }) => {
        if (err.statusCode === 404 || err.statusCode === 410) await admin.from("push_subscriptions").delete().eq("id", s.id);
        throw err;
      }),
    ),
  );
  if (results.every((r) => r.status === "rejected")) throw new Error("Hiçbir cihaza ulaşılamadı.");
}
