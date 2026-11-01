import { NextResponse } from "next/server";

import { dispatchDue } from "@/lib/reminders/dispatch";
import { appUrl, isCronAuthorized } from "@/lib/reminders/cron-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Her dakika Supabase pg_cron tarafından çağrılır: zamanı gelen hatırlatmaları gönderir. */
export async function POST(req: Request) {
  if (!isCronAuthorized(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const sent = await dispatchDue(createAdminClient(), appUrl(req));
  return NextResponse.json({ sent });
}
