import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

const PUBLIC_PATHS = ["/giris", "/auth", "/serwist", "/manifest.webmanifest", "/api/cron"];

/** Her istekte Supabase oturumunu tazeler ve girişi olmayanı /giris'e yollar. */
export async function updateSession(request: NextRequest) {
  // Kurulum modu: anahtarlar yoksa korumasız aç ki arayüz görülebilsin.
  if (!isSupabaseConfigured) return NextResponse.next({ request });

  // Cihaz modu: hesapsız kullanım; veriler tarayıcıda, sunucuya oturum gerekmez
  const deviceMode = request.cookies.get("ivl_storage")?.value === "device";
  if (deviceMode && !request.nextUrl.pathname.startsWith("/api/")) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  if (!user && !isPublic && !path.startsWith("/api/cron")) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && path === "/giris") {
    const url = request.nextUrl.clone();
    url.pathname = "/bugun";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
