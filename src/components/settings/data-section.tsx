"use client";

import * as React from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDataMode, useProfile } from "@/lib/data/hooks";
import { buildDemoData } from "@/lib/data/seed";
import { emptySnapshot, useData } from "@/lib/data/store";
import { useTimer } from "@/lib/timer/store";
import { SettingsSection } from "./settings-section";

/** Önizleme modunda: örnek verileri geri yükle ya da boş başla */
export function DataSection() {
  const mode = useDataMode();
  const profile = useProfile();
  const [confirm, setConfirm] = React.useState<"reset" | "clear" | null>(null);
  if (mode !== "local") return null;

  const apply = () => {
    useTimer.getState().discard();
    const snap = confirm === "reset" ? buildDemoData(profile.id) : emptySnapshot();
    useData.getState().load(snap, profile, "local");
    toast.success(confirm === "reset" ? "Örnek veriler yeniden yüklendi" : "Tüm veriler temizlendi; boş bir dönemle başlayabilirsin");
  };

  return (
    <SettingsSection title="Önizleme verileri" description="Bu önizlemedeki veriler sadece bu tarayıcıda durur. İstersen boş başlayıp kendi alanlarını girebilirsin.">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setConfirm("reset")}><RotateCcw /> Örnek verileri geri yükle</Button>
        <Button variant="secondary" className="text-destructive" onClick={() => setConfirm("clear")}><Trash2 /> Boş başla</Button>
      </div>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === "reset" ? "Örnek veriler geri yüklensin mi?" : "Tüm veriler silinsin mi?"}
        description="Bu tarayıcıda yaptığın tüm değişiklikler kaybolur."
        confirmLabel={confirm === "reset" ? "Örnek verileri yükle" : "Her şeyi sil"}
        onConfirm={apply}
      />
    </SettingsSection>
  );
}
