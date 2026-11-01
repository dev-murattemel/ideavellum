"use client";

import * as React from "react";
import { ArrowRight, Cloud, HardDrive, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setStorageMode, getStorageMode } from "@/lib/data/storage-mode";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { hardNavigate } from "@/lib/nav/hard-navigate";

type Choice = "cloud" | "device";

const OPTIONS: { id: Choice; icon: typeof Cloud; title: string; text: string }[] = [
  { id: "cloud", icon: Cloud, title: "Bulutta sakla", text: "Hesapla; her cihazdan eriş, telefon bildirimleri" },
  { id: "device", icon: HardDrive, title: "Sadece bu cihazda", text: "Hesapsız; veriler bu tarayıcıdan çıkmaz" },
];

/** Giriş ekranı: verilerin nerede saklanacağını seç */
export function StorageChoice({ moving }: { moving: boolean }) {
  // İlk çizim sunucuda: cihaz modu bilgisi tarayıcıda okunur
  const [choice, setChoice] = React.useState<Choice>("cloud");
  const wasDevice = typeof document !== "undefined" && getStorageMode() === "device";

  const startOnDevice = () => {
    setStorageMode("device");
    hardNavigate("/bugun");
  };

  return (
    <div className="flex flex-col gap-6">
      <div role="radiogroup" aria-label="Verilerin nerede saklansın?" className="grid grid-cols-2 gap-2">
        {OPTIONS.map(({ id, icon: Icon, title, text }) => {
          const on = choice === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setChoice(id)}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-2 rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                on ? "border-foreground bg-surface shadow-[0_0_0_1px_var(--accent)]" : "border-line bg-sunken/40 hover:border-line-strong",
              )}
            >
              <Icon className={cn("size-5", on ? "text-foreground" : "text-ink-subtle")} strokeWidth={1.8} aria-hidden />
              <span className="text-sm font-semibold">{title}</span>
              <span className="text-xs leading-4 text-ink-muted">{text}</span>
            </button>
          );
        })}
      </div>

      {choice === "cloud" ? (
        // Gönderince cihaz modundan çıkılır; e-postadaki bağlantı bulut hesabını açar
        <div onSubmitCapture={() => setStorageMode("cloud")}>
          {moving && (
            <p className="mb-4 rounded-lg bg-sunken px-3 py-2.5 text-13 text-ink-muted">
              Giriş yaptığında bu cihazdaki tüm verilerin hesabına taşınacak.
            </p>
          )}
          <LoginForm />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold tracking-[-0.01em]">Bu cihazda başla</h1>
            <p className="text-sm text-ink-muted">
              Hesap ya da e-posta gerekmez. Notların, günlüğün ve tüm bilgilerin yalnızca bu tarayıcıda saklanır; hiçbir sunucuya gönderilmez.
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-13 text-ink-muted">
            <li className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden /> Tam gizlilik: veriler cihazından çıkmaz.</li>
            <li className="flex gap-2"><HardDrive className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden /> Tarayıcı verilerini silersen kaybolur; Ayarlar&apos;dan düzenli yedek indir.</li>
            <li className="flex gap-2"><Cloud className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden /> İstediğin zaman tek tıkla buluta taşıyabilirsin.</li>
          </ul>
          <Button size="lg" className="w-full" onClick={startOnDevice}>
            {wasDevice ? "Bu cihazdaki verilerime dön" : "Bu cihazda başla"} <ArrowRight aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
