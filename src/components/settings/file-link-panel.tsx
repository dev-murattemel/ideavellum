"use client";

import * as React from "react";
import { FileCheck2, FilePlus2, FolderOpen, Link2Off, RefreshCw, Share2, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { fileLinkSupported, linkNewFile, mergeFromFile, openExistingFile, reconnectFileLink, shareBackup, unlinkFile, useFileLink } from "@/lib/data/file-link";
import { detectBrowser, type BrowserKind } from "@/lib/browser";
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

  if (!supported) return <UnsupportedPanel />;

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

const REASON: Record<BrowserKind, { title: string; text: string }> = {
  brave: {
    title: "Brave dosya bağlantısını kapalı tutuyor",
    text: "Açmak için adres çubuğuna brave://flags/#file-system-access-api yaz, “Enabled” seç ve Brave'i yeniden başlat. Sonra buradan diğer tarayıcıdaki aynı dosyayı “Var olan dosyayı aç” ile seç.",
  },
  firefox: {
    title: "Firefox dosyaya otomatik bağlanamıyor",
    text: "Firefox bir sitenin seçtiğin dosyaya kendi kendine yazmasına izin vermiyor. Diğer tarayıcıdaki ortak dosyayı aşağıdan elle birleştirebilirsin; otomatik eşitleme için Chrome ya da Edge kullan.",
  },
  safari: {
    title: "Safari dosyaya otomatik bağlanamıyor",
    text: "Safari bir sitenin seçtiğin dosyaya kendi kendine yazmasına izin vermiyor. Diğer tarayıcıdaki ortak dosyayı aşağıdan elle birleştirebilirsin; otomatik eşitleme için Chrome ya da Edge kullan.",
  },
  mobile: {
    title: "Telefonda dosyaya otomatik bağlanılamıyor",
    text: "Telefon tarayıcıları bir sitenin seçtiğin konuma kendi kendine yazmasına izin vermiyor. Yedeği paylaşım ekranından Dosyalar'a ya da Drive'a kaydedebilir, ortak dosyayı buradan birleştirebilirsin.",
  },
  chromium: { title: "Bu tarayıcıda dosya bağlantısı kapalı", text: "Tarayıcı ayarlarında dosya erişimi kapatılmış olabilir. Ortak dosyayı aşağıdan elle birleştirebilirsin." },
  other: { title: "Bu tarayıcı dosyaya otomatik bağlanamıyor", text: "Ortak dosyayı aşağıdan elle birleştirebilir ya da Chrome / Edge kullanabilirsin." },
};

/** Dosya bağlantısını desteklemeyen tarayıcılar: nedeni, çözümü ve elle birleştirme */
function UnsupportedPanel() {
  const kind = React.useSyncExternalStore(() => () => {}, detectBrowser, () => "other" as BrowserKind);
  const input = React.useRef<HTMLInputElement>(null);
  const r = REASON[kind];

  const merge = async (file: File | undefined) => {
    if (!file) return;
    try {
      const res = await mergeFromFile(file);
      toast.success(res.changed ? "Ortak dosyadaki değişiklikler eklendi" : "Zaten güncelsin", { description: `${res.rows} kayıt.` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Dosya okunamadı");
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
      <p className="flex items-center gap-2 text-sm font-semibold"><Smartphone className="size-4" aria-hidden /> {r.title}</p>
      <p className="text-13 text-ink-muted">{r.text}</p>
      <p className="rounded-md bg-sunken/70 px-3 py-2 text-13 text-ink-muted">
        Farklı tarayıcı ve cihazlarda her şeyin <span className="font-medium text-foreground">otomatik</span> aynı kalması için en sağlam yol <span className="font-medium text-foreground">Bulutta sakla</span>: aşağıdaki “Buluta taşı” ile verilerin hesabına geçer.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => input.current?.click()}><FolderOpen /> Ortak dosyadan güncelle</Button>
        <input ref={input} type="file" accept="application/json,.json" hidden onChange={(e) => { void merge(e.target.files?.[0]); e.target.value = ""; }} />
        <Button
          variant="secondary"
          onClick={async () => {
            const res = await shareBackup();
            if (res === "shared") toast.success("Yedek kaydedildi");
            else if (res === "downloaded") toast.success("Yedek indirildi", { description: "İndirilenler klasöründe." });
          }}
        >
          <Share2 /> Yedeği kaydet
        </Button>
      </div>
    </div>
  );
}
