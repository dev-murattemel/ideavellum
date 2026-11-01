"use client";

import * as React from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { LoaderCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

/**
 * E-postadaki giriş bağlantısı buraya döner. Üç biçimi de kabul eder:
 * - #access_token=… (bağlantı istendiği tarayıcıdan bağımsız; varsayılan yöntem)
 * - ?token_hash=…&type=… (özel e-posta şablonu kullanılırsa)
 * - ?code=… (eski bağlantılar; yalnızca istendiği tarayıcıda çalışır)
 * Oturum tarayıcı çerezine yazılır, sonra Bugün ekranına gidilir.
 */
export function AuthCallback() {
  React.useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const fail = () => window.location.replace("/giris?hata=baglanti");

      if (hash.get("error") || url.searchParams.get("error")) return fail();

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") as EmailOtpType | null;
      const code = url.searchParams.get("code");

      let error: unknown = null;
      if (accessToken && refreshToken) {
        ({ error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }));
      } else if (tokenHash && type) {
        ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
      } else if (code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
      } else {
        return fail();
      }
      if (error) return fail();
      window.location.replace("/bugun");
    };
    void run();
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center" aria-busy="true">
      <LoaderCircle className="size-6 animate-spin text-accent-text" aria-hidden />
      <p className="text-sm text-ink-muted">Giriş yapılıyor…</p>
    </main>
  );
}
