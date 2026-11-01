"use client";

import * as React from "react";
import { FileCheck2, FilePlus2, FolderOpen, Link2Off, RefreshCw, Share2, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fileLinkSupported, linkNewFile, openExistingFile, reconnectFileLink, shareBackup, unlinkFile, useFileLink } from "@/lib/data/file-link";
import { usePlace } from "@/lib/data/hooks";
import { timeAgo } from "@/lib/time";

const isAbort = (e: unknown) => (e as { name?: string })?.name === "AbortError";

/** Verilerin otomatik yazılacağı dosya (masaüstü) ya da paylaşım ekranıyla kaydetme (telefon) */
export function FileLinkPanel() {
  const place = usePlace();
  const link = useFileLink();
  const supported = React.useSyncExternalStore(() => () => {}, fileLinkSupported, () => false);
  const asSource = place === "device";

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      if (!isAbort(e)) toast.error(e instanceof Error ? e.message : "Dosya işlemi tamamlanamadı");
    }
  };

  if (!supported) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
        <p className="flex items-center gap-2 text-sm font-semibold"><Smartphone className="size-4" aria-hidden /> Yedeği bir konuma kaydet</p>
        <p className="text-13 text-ink-muted">
          Bu tarayıcı (telefonlar, Safari, Firefox) bir sitenin seçilen dosyaya kendi kendine yazmasına izin vermiyor. Bunun yerine tek dokunuşla paylaşım ekranından
          “Dosyalar’a Kaydet”, Google Drive ya da istediğin konumu seç. Otomatik dosya bağlantısı için bilgisayarda Chrome ya da Edge kullanabilirsin.
        </p>
        <Button
          className="self-start"
          onClick={async () => {
            const r = await shareBackup();
            if (r === "shared") toast.success("Yedek kaydedildi");
            else if (r === "downloaded") toast.success("Yedek indirildi", { description: "İndirilenler klasöründe." });
          }}
        >
          <Share2 /> Yedeği kaydet
        </Button>
      </div>
    );
  }

  if (link.status === "linked" || link.status === "needs-permission" || link.status === "error") {
    const needs = link.status !== "linked";
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <FileCheck2 className="size-4" aria-hidden /> {link.fileName}
          <span className={needs ? "rounded-md bg-[#FDF4D3] px-1.5 py-0.5 text-xs font-medium text-[#7D6210] dark:bg-[#E3B524]/16 dark:text-[#F1D37A]" : "rounded-md bg-[#DFF5EA] px-1.5 py-0.5 text-xs font-medium text-[#1D6B47] dark:bg-[#34B37A]/16 dark:text-[#7FD8AE]"}>
            {needs ? "İzin bekliyor" : "Bağlı"}
          </span>
        </p>
        <p className="text-13 text-ink-muted">
          {needs
            ? "Tarayıcı güvenlik için dosyaya erişim iznini yeniden soruyor. Bir tıkla izin ver; veriler kaldığı yerden eşitlenir."
            : `${asSource ? "Veriler bu dosyadan okunuyor ve" : "Her değişiklik"} birkaç saniye içinde bu dosyaya yazılıyor${link.lastWrite ? ` · son kayıt ${timeAgo(new Date(link.lastWrite).toISOString())}` : ""}.`}
          {asSource && !needs && " Başka bir tarayıcıda ya da bilgisayarda (dosya iCloud Drive, Google Drive veya Dropbox klasöründeyse) “Var olan dosyayı aç” ile aynı dosyayı seç; iki taraftaki değişiklikler birleşir."}
        </p>
        <div className="flex flex-wrap gap-2">
          {needs && <Button onClick={() => void run(async () => { if (!(await reconnectFileLink())) throw new Error("İzin verilmedi"); }, "Dosyaya yeniden bağlanıldı")}><RefreshCw /> İzin ver ve bağlan</Button>}
          <Button variant="ghost" onClick={() => void run(unlinkFile, "Dosya bağlantısı kaldırıldı")}><Link2Off /> Bağlantıyı kaldır</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
      <p className="flex items-center gap-2 text-sm font-semibold"><FilePlus2 className="size-4" aria-hidden /> {asSource ? "Verilerini bir dosyada tut" : "Otomatik yedek dosyası"}</p>
      <p className="text-13 text-ink-muted">
        {asSource
          ? "Bilgisayarında bir dosya seç; uygulama verileri her açılışta oradan okur ve her değişikliği otomatik olarak oraya yazar. Yedek indirmeyi düşünmene gerek kalmaz."
          : "Bilgisayarında bir dosya seç; verilerinin güncel bir kopyası her değişiklikte otomatik olarak oraya yazılır."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void run(linkNewFile, "Dosya bağlandı; değişiklikler otomatik kaydedilecek")}><FilePlus2 /> Yeni dosya oluştur</Button>
        {asSource && <Button variant="secondary" onClick={() => void run(openExistingFile, "Veriler dosyadan yüklendi")}><FolderOpen /> Var olan dosyayı aç</Button>}
      </div>
    </div>
  );
}
