"use client";

import * as React from "react";
import { Cloud, CloudUpload, Download, HardDrive, Monitor, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { downloadBackup, lastBackupAt } from "@/lib/data/backup";
import { idbDel } from "@/lib/data/device-db";
import { usePlace, useProfile } from "@/lib/data/hooks";
import { DEVICE_KEY, MIGRATE_FLAG, setStorageMode } from "@/lib/data/storage-mode";
import { emptySnapshot, useData } from "@/lib/data/store";
import { TABLE_NAMES } from "@/lib/data/types";
import { timeAgo } from "@/lib/time";
import { SettingsSection } from "./settings-section";
import { FileLinkPanel } from "./file-link-panel";
import { mergeFromFile, useFileLink } from "@/lib/data/file-link";
import { hardNavigate } from "@/lib/nav/hard-navigate";

const PLACE = {
  device: { icon: HardDrive, title: "Bu cihazda saklanıyor", text: "Hesap yok; veriler yalnızca bu tarayıcının veritabanında. Düzenli yedek indirmeyi unutma." },
  cloud: { icon: Cloud, title: "Bulutta saklanıyor", text: "Her cihazdan erişilir. Hızlı açılış ve çevrimdışı okuma için bir kopya bu cihazda da tutulur; çıkış yapınca silinir." },
  preview: { icon: Monitor, title: "Önizleme", text: "Örnek verilerle çalışır; değişiklikler yalnızca bu tarayıcıda kalır." },
} as const;

/** Verilerin nerede durduğu, yedek indir / yükle, buluta taşı */
export function StorageSection() {
  const place = usePlace();
  const profile = useProfile();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [confirmWipe, setConfirmWipe] = React.useState(false);
  const [last, setLast] = React.useState<number | null>(() => lastBackupAt());
  const rows = useData((s) => TABLE_NAMES.reduce((n, t) => n + Object.keys(s[t]).length, 0));
  const linked = useFileLink((l) => l.status === "linked");
  const P = place === "device" && linked
    ? { ...PLACE.device, text: "Hesap yok; veriler bu cihazda ve seçtiğin dosyada. Her değişiklik dosyaya otomatik kaydediliyor." }
    : PLACE[place];
  const Icon = P.icon;

  const backup = () => {
    const n = downloadBackup();
    setLast(Date.now());
    toast.success("Yedek indirildi", { description: `${n} kayıt tek dosyada. Güvenli bir yere (ör. iCloud, Google Drive) kaydet.` });
  };

  // Yedek mevcut verilerin üzerine yazılmaz; kayıt kayıt birleştirilir
  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      const res = await mergeFromFile(file);
      toast.success(res.changed ? "Yedek birleştirildi" : "Zaten güncelsin", { description: `${res.rows} kayıt.` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yedek okunamadı");
    }
  };

  const moveToCloud = () => {
    try {
      localStorage.setItem(MIGRATE_FLAG, "1");
    } catch {}
    hardNavigate("/giris?tasi=1");
  };

  const wipeDevice = async () => {
    await idbDel(DEVICE_KEY).catch(() => {});
    useData.getState().load(emptySnapshot(), profile, "local", "device");
    toast("Bu cihazdaki veriler silindi");
  };

  return (
    <SettingsSection title="Veriler ve yedek" description="Verilerinin nerede durduğu; yedek indir ya da yedekten geri yükle.">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-lg bg-sunken/60 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface ring-1 ring-line"><Icon className="size-[18px]" aria-hidden /></span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm font-semibold">{P.title}{place === "cloud" && profile.email ? ` · ${profile.email}` : ""}</p>
            <p className="text-13 text-ink-muted">{P.text}</p>
            <p className="tabular mt-1 text-xs text-ink-subtle">{rows} kayıt · Son yedek: {last ? timeAgo(new Date(last).toISOString()) : "hiç alınmadı"}</p>
          </div>
        </div>

        {place !== "preview" && <FileLinkPanel />}

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={backup}><Download /> Yedeği indir</Button>
          {place !== "cloud" && (
            <>
              <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload /> Yedekten yükle</Button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
            </>
          )}
          {place === "device" && (
            <>
              <Button variant="secondary" onClick={moveToCloud}><CloudUpload /> Buluta taşı</Button>
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmWipe(true)}><Trash2 /> Bu cihazdaki verileri sil</Button>
            </>
          )}
          {place === "device" && (
            <Button variant="ghost" onClick={() => { setStorageMode("cloud"); hardNavigate("/giris"); }}>
              <Cloud /> Bulut hesabıyla gir
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmWipe}
        onOpenChange={setConfirmWipe}
        title="Bu cihazdaki tüm veriler silinsin mi?"
        description="Alanlar, notlar, günlük, sözler ve alışkanlıklar kalıcı olarak silinir. Yedeğin yoksa geri getirilemez."
        confirmLabel="Her şeyi sil"
        onConfirm={() => void wipeDevice()}
      />
    </SettingsSection>
  );
}
