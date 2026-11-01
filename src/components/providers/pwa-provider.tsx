"use client";

import { SerwistProvider } from "@serwist/turbopack/react";

/** Service worker'ı kaydeder (geliştirme sırasında kapalı). */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV !== "production"}>
      {children}
    </SerwistProvider>
  );
}
