import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenu } from "@/components/layout/command-menu";
import { CommandMenuProvider } from "@/components/layout/command-menu-context";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SetupBanner } from "@/components/layout/setup-banner";
import { SIDEBAR_COOKIE, SidebarProvider } from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

// Her istekte taze: saat, selam ve oturum bilgisi sabitlenmesin.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [cookieStore, user] = await Promise.all([cookies(), getCurrentUser()]);

  if (isSupabaseConfigured && !user) redirect("/giris");

  const collapsed = cookieStore.get(SIDEBAR_COOKIE)?.value === "true";
  const sidebarUser = user
    ? { name: user.fullName ?? user.email.split("@")[0], email: user.email }
    : null;

  return (
    <TooltipProvider>
      <SidebarProvider defaultCollapsed={collapsed}>
        <CommandMenuProvider>
          <div className="flex min-h-dvh">
            <AppSidebar user={sidebarUser} />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar />
              <main id="icerik" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-12">
                {!isSupabaseConfigured && <SetupBanner />}
                {children}
              </main>
            </div>
          </div>
          <MobileNav />
          <CommandMenu />
        </CommandMenuProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}
