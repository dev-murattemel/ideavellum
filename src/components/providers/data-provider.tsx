"use client";

import * as React from "react";
import { toast } from "sonner";

import { defaultProfile, LOCAL_USER_ID } from "@/lib/data/defaults";
import { loadLocal, startLocalPersistence } from "@/lib/data/local-storage";
import { buildDemoData } from "@/lib/data/seed";
import { setAdapter, useData } from "@/lib/data/store";
import { isPreviewBuild } from "@/lib/ai/client";
import { isSupabaseConfigured } from "@/lib/env";

/** Supabase bağlıysa veriyi oradan, değilse tarayıcıdan (ilk açılışta örnek verilerle) yükler. */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const status = useData((s) => s.status);

  React.useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;

    async function init() {
      if (isSupabaseConfigured) {
        const [{ createClient }, { loadRemote, supabaseAdapter }] = await Promise.all([
          import("@/lib/supabase/client"),
          import("@/lib/data/supabase-adapter"),
        ]);
        const client = createClient();
        const reload = async () => {
          const res = await loadRemote(client);
          if (res && !cancelled) useData.getState().load(res.data, res.profile, "remote");
        };
        setAdapter(supabaseAdapter(client), () => {
          toast.error("Değişiklik kaydedilemedi", { description: "Bağlantını kontrol et; son kayıtlı hâl geri yüklendi." });
          void reload();
        });
        try {
          await reload();
        } catch {
          useData.setState({ status: "error" });
        }
        return;
      }

      const saved = loadLocal();
      // Önizlemede AI özellikleri görülebilsin diye açık başlar; asıl uygulamada varsayılan kapalı.
      const profile = saved?.profile ?? { ...defaultProfile(LOCAL_USER_ID), full_name: "Murat", ai_enabled: isPreviewBuild };
      useData.getState().load(saved?.data ?? buildDemoData(LOCAL_USER_ID), profile, "local");
      stop = startLocalPersistence();
      // İlk açılışta da kaydet ki örnek veriler sabit kalsın
      if (!saved) useData.setState({});
    }

    void init();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  if (status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center text-sm text-ink-muted">
        Veriler yüklenemedi. Sayfayı yenilemeyi dene.
      </div>
    );
  }

  return <>{children}</>;
}
