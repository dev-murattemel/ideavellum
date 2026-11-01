"use client";

import { isSupabaseConfigured } from "@/lib/env";

export async function signOutClient() {
  if (!isSupabaseConfigured) return;
  const { createClient } = await import("./client");
  const client = createClient();
  // Ortak kullanılan cihazda veri kalmasın: buluttaki verinin cihaz kopyasını sil
  const uid = (await client.auth.getSession()).data.session?.user.id;
  if (uid) {
    const [{ idbDel }, { cloudCacheKey }] = await Promise.all([import("@/lib/data/device-db"), import("@/lib/data/storage-mode")]);
    await idbDel(cloudCacheKey(uid)).catch(() => {});
  }
  await client.auth.signOut();
  // Bellekteki tüm verinin temizlenmesi için tam sayfa yenileme istiyoruz.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = "/giris";
}
