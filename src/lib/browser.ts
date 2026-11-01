"use client";

export type BrowserKind = "brave" | "firefox" | "safari" | "mobile" | "chromium" | "other";

/** Dosya erişimi için tarayıcıyı tanır (yalnızca açıklama ve yönlendirme için) */
export function detectBrowser(): BrowserKind {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "mobile";
  if ((navigator as Navigator & { brave?: unknown }).brave) return "brave";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua)) return "safari";
  if (/Chrome\/|Edg\//.test(ua)) return "chromium";
  return "other";
}
