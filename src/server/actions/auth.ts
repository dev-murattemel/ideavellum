"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isSupabaseConfigured, serverEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type MagicLinkState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; email?: string };

const emailSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi yaz (ör. murat@ornek.com)."),
});

/** E-posta adresine tek kullanımlık giriş bağlantısı (magic link) gönderir. */
export async function sendMagicLink(
  _prev: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  if (!isSupabaseConfigured) {
    return { status: "error", message: "Supabase bağlantısı henüz kurulmadı." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const parsed = emailSchema.safeParse({ email });
  if (!parsed.success) {
    return { status: "error", email, message: parsed.error.issues[0]?.message ?? "E-posta geçersiz." };
  }

  const origin = serverEnv().APP_URL ?? (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    const message =
      error.status === 429
        ? "Çok sık deneme yapıldı. Bir dakika bekleyip tekrar dene."
        : "Bağlantı gönderilemedi. Biraz sonra tekrar dene.";
    return { status: "error", email, message };
  }

  return { status: "sent", email: parsed.data.email };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/giris");
}
