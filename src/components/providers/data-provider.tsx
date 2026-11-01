"use client";

import * as React from "react";
import { toast } from "sonner";

import { isPreviewBuild } from "@/lib/ai/client";
import { countRows } from "@/lib/data/backup";
import { defaultProfile, LOCAL_USER_ID } from "@/lib/data/defaults";
import { idbDel, idbGet, idbSet, requestPersistence } from "@/lib/data/device-db";
import { loadLocal, startLocalPersistence } from "@/lib/data/local-storage";
import { buildDemoData } from "@/lib/data/seed";
import { cloudCacheKey, DEVICE_KEY, getStorageMode, MIGRATE_FLAG } from "@/lib/data/storage-mode";
import { emptySnapshot, setAdapter, useData } from "@/lib/data/store";
import { TABLE_NAMES, type DataSnapshot, type Profile } from "@/lib/data/types";
import { isSupabaseConfigured } from "@/lib/env";

type Saved = { data: DataSnapshot; profile: Profile };

/** Depodaki her değişikliği kısa gecikmeyle IndexedDB'ye yazar */
function persistTo(key: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return useData.subscribe((s) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const data = Object.fromEntries(TABLE_NAMES.map((t) => [t, s[t]])) as unknown as DataSnapshot;
      void idbSet(key, { data, profile: s.profile } satisfies Saved).catch(() => {});
    }, 400);
  });
}

const withAllTables = (d: DataSnapshot) => {
  TABLE_NAMES.forEach((t) => (d[t] ??= {} as never));
  return d;
};

/**
 * Veriyi üç yerden birinden yükler:
 * - Bulut (Supabase): hesapla; açılışta cihazdaki kopya anında gösterilir, sonra sunucudan tazelenir.
 * - Bu cihaz: hesapsız; her şey tarayıcının veritabanında (IndexedDB) kalır.
 * - Önizleme: örnek verilerle, tarayıcı hafızasında.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const status = useData((s) => s.status);

  React.useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;

    async function initCloud() {
      const [{ createClient }, { loadRemote, supabaseAdapter }] = await Promise.all([
        import("@/lib/supabase/client"),
        import("@/lib/data/supabase-adapter"),
      ]);
      const client = createClient();
      const adapter = supabaseAdapter(client);

      // 1) Cihazdaki kopya: uygulama anında açılsın, internet yoksa da veriler görünsün
      const { data: sess } = await client.auth.getSession();
      const uid = sess.session?.user.id;
      let fromCache = false;
      if (uid) {
        stop = persistTo(cloudCacheKey(uid));
        const cached = await idbGet<Saved>(cloudCacheKey(uid));
        if (cached && !cancelled) {
          useData.getState().load(withAllTables(cached.data), cached.profile, "remote", "cloud");
          fromCache = true;
        }
      }

      const reload = async () => {
        const res = await loadRemote(client);
        if (res && !cancelled) useData.getState().load(res.data, res.profile, "remote", "cloud");
        return res;
      };
      setAdapter(adapter, () => {
        toast.error("Değişiklik kaydedilemedi", { description: "Son kayıtlı hâl geri yüklendi." });
        void reload();
      });

      // 2) Sunucudan taze veri
      try {
        const res = await reload();
        if (res) {
          if (!uid) stop = persistTo(cloudCacheKey(res.profile.id));
          await migrateDeviceData(res.profile.id, adapter, reload);
        }
      } catch {
        if (fromCache) toast("Çevrimdışısın", { description: "Cihazdaki son kopya gösteriliyor; değişiklikler bağlantı gelince gönderilir." });
        else useData.setState({ status: "error" });
      }
    }

    async function initDevice() {
      const saved = await idbGet<Saved>(DEVICE_KEY);
      if (cancelled) return;
      const profile = saved?.profile ?? { ...defaultProfile(LOCAL_USER_ID), full_name: null };
      useData.getState().load(withAllTables(saved?.data ?? emptySnapshot()), profile, "local", "device");
      stop = persistTo(DEVICE_KEY);
      void requestPersistence();
    }

    function initPreview() {
      const saved = loadLocal();
      // Önizlemede AI özellikleri görülebilsin diye açık başlar; asıl uygulamada varsayılan kapalı.
      const profile = saved?.profile ?? { ...defaultProfile(LOCAL_USER_ID), full_name: "Murat", ai_enabled: isPreviewBuild };
      useData.getState().load(saved?.data ?? buildDemoData(LOCAL_USER_ID), profile, "local", "preview");
      stop = startLocalPersistence();
      if (!saved) useData.setState({});
    }

    if (isSupabaseConfigured && getStorageMode() === "device") void initDevice();
    else if (isSupabaseConfigured) void initCloud();
    else initPreview();

    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  if (status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center text-sm text-ink-muted">
        Veriler yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.
      </div>
    );
  }

  return <>{children}</>;
}

/** "Buluta taşı" istendiyse cihazdaki verileri giriş yapılan hesaba yükler */
async function migrateDeviceData(
  uid: string,
  adapter: { upsert: (t: (typeof TABLE_NAMES)[number], rows: object[]) => Promise<void> },
  reload: () => Promise<unknown>,
) {
  let flagged = false;
  try {
    flagged = localStorage.getItem(MIGRATE_FLAG) === "1";
  } catch {}
  if (!flagged) return;
  const saved = await idbGet<Saved>(DEVICE_KEY);
  if (!saved || !countRows(saved.data)) {
    localStorage.removeItem(MIGRATE_FLAG);
    return;
  }
  const id = toast.loading("Cihazdaki veriler hesabına taşınıyor…");
  try {
    for (const t of TABLE_NAMES) {
      const rows = Object.values(saved.data[t] ?? {}).map((r) => ({ ...(r as object), user_id: uid }));
      for (let i = 0; i < rows.length; i += 500) await adapter.upsert(t, rows.slice(i, i + 500));
    }
    await idbDel(DEVICE_KEY);
    localStorage.removeItem(MIGRATE_FLAG);
    await reload();
    toast.success("Verilerin buluta taşındı", { id, description: "Artık her cihazdan ulaşabilirsin." });
  } catch {
    toast.error("Taşıma tamamlanamadı", { id, description: "Cihazdaki veriler silinmedi; Ayarlar'dan tekrar dene." });
  }
}
