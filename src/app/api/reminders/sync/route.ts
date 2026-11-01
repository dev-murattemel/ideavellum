import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { syncUserReminders } from "@/lib/reminders/generate";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Ders saati, görev ya da bildirim ayarı değişince oturumdaki kullanıcının hatırlatmalarını yeniler. */
export async function POST() {
  if (!isSupabaseConfigured) return NextResponse.json({ error: "Supabase bağlı değil" }, { status: 503 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  const count = await syncUserReminders(createAdminClient(), user.id);
  return NextResponse.json({ reminders: count });
}
