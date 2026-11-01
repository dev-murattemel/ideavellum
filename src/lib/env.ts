import { z } from "zod";

/** Boş bırakılmış değişkenleri ("") hiç yazılmamış say. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: optional(z.url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional(z.string().min(20)),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: optional(z.string()),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: optional(z.string()),
  VAPID_PRIVATE_KEY: optional(z.string()),
  VAPID_SUBJECT: optional(z.string()),
  RESEND_API_KEY: optional(z.string()),
  EMAIL_FROM: optional(z.string()),
  CRON_SECRET: optional(z.string().min(16)),
  APP_URL: optional(z.url()),
  AI_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  ANTHROPIC_API_KEY: optional(z.string()),
  ANTHROPIC_MODEL: optional(z.string()),
});

// NEXT_PUBLIC_ değişkenleri tarayıcı paketine ancak tek tek yazılırsa girer.
export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
});

/** Supabase anahtarları girilmediyse uygulama "kurulum modunda" açılır. */
export const isSupabaseConfigured = Boolean(
  publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** Sadece sunucuda çağır. */
export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() tarayıcıda çağrılamaz.");
  }
  return serverSchema.parse(process.env);
}
