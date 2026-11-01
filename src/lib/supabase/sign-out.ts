"use client";

import { isSupabaseConfigured } from "@/lib/env";

export async function signOutClient() {
  if (!isSupabaseConfigured) return;
  const { createClient } = await import("./client");
  await createClient().auth.signOut();
  // Bellekteki tüm verinin temizlenmesi için tam sayfa yenileme istiyoruz.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = "/giris";
}
