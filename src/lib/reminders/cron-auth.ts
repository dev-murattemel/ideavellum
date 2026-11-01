import "server-only";

import { serverEnv } from "@/lib/env";

/** Zamanlanmış çağrılar sadece doğru CRON_SECRET ile kabul edilir. */
export function isCronAuthorized(req: Request) {
  const secret = serverEnv().CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export function appUrl(req: Request) {
  return serverEnv().APP_URL ?? new URL(req.url).origin;
}
