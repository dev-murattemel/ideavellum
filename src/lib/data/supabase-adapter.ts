"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import { defaultProfile } from "./defaults";
import { emptySnapshot, type RemoteAdapter } from "./store";
import { TABLE_NAMES, type DataSnapshot, type Profile } from "./types";

/**
 * Supabase'e tarayıcıdan yazar. Güvenlik Row Level Security ile sağlanır:
 * her tabloda politika user_id = auth.uid(); başkasının verisine yazılamaz.
 */
export function supabaseAdapter(client: SupabaseClient): RemoteAdapter {
  return {
    async upsert(table, rows) {
      const { error } = await client.from(table).upsert(rows);
      if (error) throw error;
    },
    async remove(table, id) {
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    async saveProfile(p) {
      const { error } = await client
        .from("profiles")
        .update({
          full_name: p.full_name,
          timezone: p.timezone,
          bell_settings: p.bell_settings,
          notification_prefs: p.notification_prefs,
          ai_enabled: p.ai_enabled,
        })
        .eq("id", p.id);
      if (error) throw error;
    },
  };
}

/** Tek kullanıcılı uygulama: tüm veriyi açılışta bir kez çekmek yeterince hızlı. */
export async function loadRemote(
  client: SupabaseClient,
): Promise<{ data: DataSnapshot; profile: Profile } | null> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;

  const data = emptySnapshot();
  const results = await Promise.all(TABLE_NAMES.map((t) => client.from(t).select("*")));
  results.forEach((res, i) => {
    if (res.error) throw res.error;
    const table = TABLE_NAMES[i];
    // Postgres "time" sütunu "09:00:00" döner; uygulama "09:00" kullanır
    if (table === "class_sessions") {
      res.data?.forEach((r: { start_time: string; end_time: string }) => {
        r.start_time = r.start_time.slice(0, 5);
        r.end_time = r.end_time.slice(0, 5);
      });
    }
    (data as Record<string, Record<string, unknown>>)[table] = Object.fromEntries(
      (res.data ?? []).map((r: { id: string }) => [r.id, r]),
    );
  });

  const { data: row } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const base = defaultProfile(user.id, user.email ?? null);
  const profile: Profile = row
    ? {
        ...base,
        full_name: row.full_name,
        timezone: row.timezone ?? base.timezone,
        bell_settings: { ...base.bell_settings, ...(row.bell_settings ?? {}) },
        notification_prefs: { ...base.notification_prefs, ...(row.notification_prefs ?? {}) },
        ai_enabled: Boolean(row.ai_enabled),
      }
    : base;

  return { data, profile };
}
