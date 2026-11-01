"use client";

/**
 * Saklama yeri: "cloud" (Supabase, hesapla) ya da "device" (hesapsız, yalnızca bu tarayıcı).
 * Çerezde tutulur ki sunucu tarafı oturum koruması da bilsin.
 */
export const STORAGE_COOKIE = "ivl_storage";
export type StorageMode = "cloud" | "device";

export function getStorageMode(): StorageMode {
  if (typeof document === "undefined") return "cloud";
  return document.cookie.split("; ").some((c) => c === `${STORAGE_COOKIE}=device`) ? "device" : "cloud";
}

export function setStorageMode(mode: StorageMode) {
  document.cookie =
    mode === "device"
      ? `${STORAGE_COOKIE}=device; path=/; max-age=31536000; samesite=lax`
      : `${STORAGE_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

/** Cihaz verisini buluta taşıma isteği (girişten sonra yüklenir) */
export const MIGRATE_FLAG = "ivl-migrate-device";
export const DEVICE_KEY = "device-snapshot";
export const cloudCacheKey = (uid: string) => `cloud-cache:${uid}`;
