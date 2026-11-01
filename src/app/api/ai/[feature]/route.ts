import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { AiUnavailableError, aiConfig, runAi } from "@/lib/ai/server";
import { AI_FEATURES, type AiFeature } from "@/lib/ai/schemas";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** AI çağrıları yalnızca sunucuda yapılır; istemci sadece bu işlem için gereken veriyi gönderir. */
export async function POST(req: Request, { params }: { params: Promise<{ feature: string }> }) {
  const { feature } = await params;
  if (!(feature in AI_FEATURES)) return NextResponse.json({ error: "Bilinmeyen özellik" }, { status: 404 });
  if (!aiConfig().enabled) return NextResponse.json({ error: "AI asistan sunucuda kapalı (AI_ENABLED)." }, { status: 503 });

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("ai_enabled" as "id").eq("id", user.id).maybeSingle();
    if (!(profile as { ai_enabled?: boolean } | null)?.ai_enabled) return NextResponse.json({ error: "AI asistan ayarlardan kapalı." }, { status: 403 });
  }

  const parsed = AI_FEATURES[feature as AiFeature].input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  try {
    const result = await runAi(feature as AiFeature, parsed.data);
    return NextResponse.json({ result });
  } catch (e) {
    if (e instanceof AiUnavailableError) return NextResponse.json({ error: e.message }, { status: 503 });
    if (e instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "Çok fazla istek; biraz sonra tekrar dene." }, { status: 429 });
    if (e instanceof Anthropic.APIError) return NextResponse.json({ error: "AI servisine ulaşılamadı." }, { status: 502 });
    return NextResponse.json({ error: "Beklenmeyen bir hata oldu." }, { status: 500 });
  }
}
