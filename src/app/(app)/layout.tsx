import { cookies } from "next/headers";

import { AppShell } from "@/components/layout/app-shell";
import { SetupBanner } from "@/components/layout/setup-banner";
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-context";
import { isSupabaseConfigured } from "@/lib/env";
import { NextNavProvider } from "@/lib/nav/next-nav";

// Oturum koruması src/proxy.ts içinde; veriler tarayıcıda yüklenir.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";

  return (
    <NextNavProvider>
      <AppShell defaultCollapsed={collapsed} banner={isSupabaseConfigured ? null : <SetupBanner />}>
        {children}
      </AppShell>
    </NextNavProvider>
  );
}
