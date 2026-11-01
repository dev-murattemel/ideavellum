"use client";

import { isSupabaseConfigured, publicEnv } from "@/lib/env";

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    isSupabaseConfigured &&
    !!publicEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  );
}

function base64ToBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

/** Bildirim izni ister, telefonu/tarayıcıyı push için kaydeder ve aboneliği Supabase'e yazar. */
export async function subscribePush(): Promise<"ok" | "denied" | "unsupported" | "error"> {
  if (!pushSupported()) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(publicEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) }));
    const json = sub.toJSON();
    const { createClient } = await import("@/lib/supabase/client");
    const { error } = await createClient()
      .from("push_subscriptions" as never)
      .upsert(
        { endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth, user_agent: navigator.userAgent } as never,
        { onConflict: "endpoint" },
      );
    return error ? "error" : "ok";
  } catch {
    return "error";
  }
}
