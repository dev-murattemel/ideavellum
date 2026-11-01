import { NextResponse } from "next/server";

import { appUrl, isCronAuthorized } from "@/lib/reminders/cron-auth";
import { syncUserReminders } from "@/lib/reminders/generate";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Her gece 03:00: 14 günlük hatırlatma penceresini ileri kaydırır, günlük/haftalık e-postaları planlar. */
export async function POST(req: Request) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  void appUrl(req);
  const admin = createAdminClient();
  const { data: users, error } = await admin.from("profiles").select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let total = 0;
  for (const u of users ?? []) total += await syncUserReminders(admin, u.id);
  return NextResponse.json({ users: users?.length ?? 0, reminders: total });
}
