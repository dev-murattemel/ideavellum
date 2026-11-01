"use client";

import * as React from "react";
import { Download, HardDrive, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { countRows, downloadBackup, lastBackupAt, snapshotNow } from "@/lib/data/backup";
import { usePlace } from "@/lib/data/hooks";

const DAY = 86_400_000;
const SNOOZE = "ivl-backup-snooze";

/** Cihaz modunda: yedek 7 günden eskiyse (ya da hiç yoksa) kibar bir hatırlatma */
function check(): { due: boolean; days: number | null } {
  const rows = countRows(snapshotNow().data);
  const last = lastBackupAt();
  let snooze = 0;
  try {
    snooze = Number(localStorage.getItem(SNOOZE) ?? 0);
  } catch {}
  const now = Date.now();
  return { due: rows >= 5 && (!last || now - last > 7 * DAY) && now > snooze, days: last ? Math.floor((now - last) / DAY) : null };
}

export function BackupReminder() {
  const place = usePlace();
  // Bu bileşen veriler yüklendikten sonra, yalnızca tarayıcıda çizilir; saklama yeri oturum boyunca değişmez
  const [state, setState] = React.useState<{ due: boolean; days: number | null }>(() => (place === "device" ? check() : { due: false, days: null }));
  if (place !== "device" || !state.due) return null;
  const { days } = state;

  return (
    <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#FDF4D3] text-[#7D6210] dark:bg-[#E3B524]/16 dark:text-[#F1D37A]"><HardDrive className="size-4" aria-hidden /></span>
      <p className="min-w-0 flex-1 text-13">
        <span className="font-medium">{days === null ? "Henüz yedek almadın." : `Son yedeğin ${days} gün önce.`}</span>{" "}
        <span className="text-ink-muted">Verilerin yalnızca bu cihazda; bir yedek indirip güvenli bir yere koy.</span>
      </p>
      <Button size="sm" onClick={() => { downloadBackup(); toast.success("Yedek indirildi"); setState(check()); }}><Download /> Yedeği indir</Button>
      <Button variant="ghost" size="icon-sm" aria-label="3 gün sonra hatırlat" onClick={() => { try { localStorage.setItem(SNOOZE, String(Date.now() + 3 * DAY)); } catch {} setState(check()); }}><X /></Button>
    </div>
  );
}
