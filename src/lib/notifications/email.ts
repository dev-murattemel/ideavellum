import "server-only";

import type { ReactElement } from "react";
import { Resend } from "resend";

import { serverEnv } from "@/lib/env";

let client: Resend | null = null;

export async function sendEmail(to: string, subject: string, react: ReactElement) {
  const env = serverEnv();
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) throw new Error("RESEND_API_KEY ya da EMAIL_FROM eksik.");
  client ??= new Resend(env.RESEND_API_KEY);
  const { error } = await client.emails.send({ from: env.EMAIL_FROM, to, subject, react });
  if (error) throw new Error(error.message);
}
