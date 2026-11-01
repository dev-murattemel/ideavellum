"use client";

import * as React from "react";
import { BellRing, Share, Smartphone, SquarePlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { pushSupported, subscribePush } from "@/lib/notifications/push-client";
import { SettingsSection } from "./settings-section";

export function PushSection() {
  const [busy, setBusy] = React.useState(false);
  const supported = React.useSyncExternalStore(() => () => {}, pushSupported, () => false);

  const enable = async () => {
    setBusy(true);
    const r = await subscribePush();
    setBusy(false);
    const msg = {
      ok: "Bu cihaz bildirim alacak",
      denied: "Bildirim izni verilmedi. Tarayıcı ayarlarından izin verebilirsin.",
      unsupported: "Bu tarayıcı telefon bildirimlerini desteklemiyor",
      error: "Kayıt sırasında bir sorun oldu, tekrar dene",
    }[r];
    toast[r === "ok" ? "success" : "error"](msg);
  };

  return (
    <SettingsSection title="Telefon bildirimleri" description="Uygulama kapalıyken de zil ve görev hatırlatmaları telefonuna gelsin.">
      <div className="flex flex-col gap-4">
        {supported ? (
          <Button className="self-start" onClick={enable} disabled={busy}><BellRing /> Bu cihazda bildirimleri aç</Button>
        ) : (
          <p className="rounded-lg bg-sunken p-3 text-13 text-ink-muted">
            Telefon bildirimleri, uygulama yayınlanıp Supabase ve bildirim anahtarları girildiğinde çalışır. Bu önizlemede denenemez.
          </p>
        )}
        <div className="rounded-lg border border-line p-4">
          <p className="flex items-center gap-2 text-13 font-semibold"><Smartphone className="size-4" aria-hidden /> iPhone’da kurulum</p>
          <ol className="mt-3 flex flex-col gap-2 text-13 text-ink-muted">
            <li className="flex gap-2"><span className="tabular font-medium text-foreground">1.</span> Uygulamayı Safari’de aç.</li>
            <li className="flex gap-2"><span className="tabular font-medium text-foreground">2.</span> Alttaki <Share className="inline size-4" aria-label="Paylaş" /> Paylaş düğmesine dokun.</li>
            <li className="flex gap-2"><span className="tabular font-medium text-foreground">3.</span> <SquarePlus className="inline size-4" aria-hidden /> “Ana Ekrana Ekle”yi seç.</li>
            <li className="flex gap-2"><span className="tabular font-medium text-foreground">4.</span> Ana ekrandaki ideavellum simgesinden aç ve buradaki düğmeye bas.</li>
          </ol>
          <p className="mt-3 text-xs text-ink-muted">iPhone yalnızca ana ekrana eklenmiş uygulamalara bildirim gönderir. Android’de Chrome’dan doğrudan açabilirsin.</p>
        </div>
      </div>
    </SettingsSection>
  );
}
