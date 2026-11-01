import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicEnv, serverEnv } from "@/lib/env";

/** Sunucu görevleri (cron) için tam yetkili istemci. Asla tarayıcıya gitmez. */
export function createAdminClient() {
  const key = serverEnv().SUPABASE_SERVICE_ROLE_KEY;
  if (!publicEnv.NEXT_PUBLIC_SUPABASE_URL || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY eksik.");
  return createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, key, { auth: { persistSession: false } });
}

export type AdminClient = ReturnType<typeof createAdminClient>;
