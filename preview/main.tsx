import * as React from "react";
import { createRoot } from "react-dom/client";

import { AppShell } from "@/components/layout/app-shell";
import { SetupBanner } from "@/components/layout/setup-banner";
import { Toaster } from "@/components/ui/sonner";
import { useNav } from "@/lib/nav/nav-context";
import { HashNavProvider } from "./hash-nav";
import { resolveView, titleFor } from "./routes";
import "./preview.css";

declare const __PHASE_LABEL__: string;

function Routed() {
  const { pathname } = useNav();
  React.useEffect(() => {
    document.title = `${titleFor(pathname)} · ideavellum`;
  }, [pathname]);
  return resolveView(pathname);
}

function PreviewApp() {
  return (
    <HashNavProvider>
      <AppShell
        defaultCollapsed={false}
        banner={
          <SetupBanner
            text={`Önizleme · ${__PHASE_LABEL__}. Örnek verilerle çalışır; değişiklikler sadece bu tarayıcıda saklanır.`}
          />
        }
      >
        <Routed />
      </AppShell>
      <Toaster />
    </HashNavProvider>
  );
}

createRoot(document.getElementById("root")!).render(<PreviewApp />);
