"use client";

import * as React from "react";
import { FilePlus2, FolderOpen, HardDrive, RefreshCw, Share2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { countRows, lastBackupAt, snapshotNow } from "@/lib/data/backup";
import { fileLinkSupported, linkNewFile, openExistingFile, reconnectFileLink, shareBackup, useFileLink } from "@/lib/data/file-link";
import { usePlace } from "@/lib/data/hooks";

const DAY = 86_400_000;
const SNOOZE = "ivl-backup-snooze";

function readSnooze() {
  try {
    return Number(localStorage.getItem(SNOOZE) ?? 0);
  } catch {
    return 0;
  }
}

function backupDue() {
  const last = lastBackupAt();
  const now = Date.now();
  return { due: countRows(snapshotNow().data) >= 5 && (!last || now - last > 7 * DAY), days: last ? Math.floor((now - last) / DAY) : null };
}

const isAbort = (e: unknown) => (e as { name?: string })?.name === "AbortError";

/**
 * Bugün ekranında veri güvenliği kartı:
 * - Masaüstü: dosya bağlı değilse dosya seçmeyi önerir; izin gerekiyorsa tek tıkla bağlar.
 * - Telefon: yedek 7 günden eskiyse paylaşım ekranıyla kaydetmeyi önerir.
 */
export function BackupReminder() {
  const place = usePlace();
  const link = useFileLink();
  const supported = React.useSyncExternalStore(() => () => {}, fileLinkSupported, () => false);
  // Veriler yüklendikten sonra, yalnızca tarayıcıda çizilir; zaman bilgisi bir kez okunur
  const [snoozedUntil, setSnoozedUntil] = React.useState(readSnooze);
  const [now] = React.useState(() => Date.now());
  const [due] = React.useState(backupDue);

  const snooze = () => {
    const until = Date.now() + 3 * DAY;
    try {
      localStorage.setItem(SNOOZE, String(until));
    } catch {}
    setSnoozedUntil(until);
  };
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
    } catch (e) {
      if (!isAbort(e)) toast.error(e instanceof Error ? e.message : "Dosya işlemi tamamlanamadı");
    }
  };

  // İzin bekleyen bağlı dosya: her iki modda da tek tıkla yeniden bağlan
  if (supported && link.status === "needs-permission") {
    return (
      <Card icon={RefreshCw} title={`${link.fileName} dosyasına yeniden bağlan`} text="Tarayıcı güvenlik için izni yeniden soruyor; bir tıkla eşitleme kaldığı yerden sürer.">
        <Button size="sm" onClick={() => void act(async () => { if (!(await reconnectFileLink())) throw new Error("İzin verilmedi"); }, "Dosyaya bağlanıldı")}><RefreshCw /> Bağlan</Button>
      </Card>
    );
  }

  if (place !== "device" || now < snoozedUntil) return null;

  if (supported && link.status === "none") {
    return (
      <Card icon={HardDrive} title="Verilerini bilgisayarında bir dosyada tut" text="Bir kez dosya seç; her değişiklik oraya otomatik yazılır, açılışta oradan okunur." onClose={snooze}>
        <Button size="sm" onClick={() => void act(linkNewFile, "Dosya bağlandı; değişiklikler otomatik kaydedilecek")}><FilePlus2 /> Dosya seç</Button>
        <Button size="sm" variant="secondary" onClick={() => void act(openExistingFile, "Veriler dosyadan yüklendi")}><FolderOpen /> Var olanı aç</Button>
      </Card>
    );
  }

  if (!supported && due.due) {
    return (
      <Card
        icon={HardDrive}
        title={due.days === null ? "Henüz yedek almadın." : `Son yedeğin ${due.days} gün önce.`}
        text="Verilerin yalnızca bu cihazda; yedeği Dosyalar'a ya da Drive'a kaydet."
        onClose={snooze}
      >
        <Button size="sm" onClick={async () => { const r = await shareBackup(); if (r !== "cancelled") { toast.success("Yedek kaydedildi"); snooze(); } }}><Share2 /> Yedeği kaydet</Button>
      </Card>
    );
  }

  return null;
}

function Card({ icon: Icon, title, text, children, onClose }: { icon: React.ElementType; title: string; text: string; children: React.ReactNode; onClose?: () => void }) {
  return (
    <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FDF4D3] text-[#7D6210] dark:bg-[#E3B524]/16 dark:text-[#F1D37A]"><Icon className="size-4" aria-hidden /></span>
      <p className="min-w-0 flex-1 text-13">
        <span className="font-medium">{title}</span> <span className="text-ink-muted">{text}</span>
      </p>
      <div className="flex items-center gap-2">
        {children}
        {onClose && <Button variant="ghost" size="icon-sm" aria-label="3 gün sonra hatırlat" onClick={onClose}><X /></Button>}
      </div>
    </div>
  );
}
