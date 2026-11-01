"use client";

import * as React from "react";
import { Check, CloudOff, FileCheck2, HardDrive, LoaderCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDataMode, usePlace } from "@/lib/data/hooks";
import { retryQueued, useSync } from "@/lib/data/store";
import { useFileLink } from "@/lib/data/file-link";
import { cn } from "@/lib/utils";

function useOnline() {
  return React.useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

/** Üst çubukta kayıt durumu: bulutla eşitlenme her an görünür */
export function SyncStatus() {
  const mode = useDataMode();
  const { pending, queued } = useSync();
  const online = useOnline();
  const place = usePlace();
  const file = useFileLink();
  if (place === "device") {
    const linked = file.status === "linked";
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-ink-subtle outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {linked ? <FileCheck2 className="size-3.5" aria-hidden /> : <HardDrive className="size-3.5" aria-hidden />}
            <span className="max-w-40 truncate max-lg:sr-only">{linked ? file.fileName : "Bu cihazda"}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>{linked ? `Veriler ${file.fileName} dosyasına otomatik kaydediliyor` : "Veriler yalnızca bu cihazda; hiçbir sunucuya gönderilmez"}</TooltipContent>
      </Tooltip>
    );
  }
  if (mode !== "remote") return null;

  const offline = !online || queued > 0;
  const state = offline ? "offline" : pending > 0 ? "saving" : "saved";
  const label = {
    offline: queued ? `Çevrimdışı · ${queued} değişiklik bekliyor` : "Çevrimdışı",
    saving: "Kaydediliyor…",
    saved: "Tüm değişiklikler kaydedildi",
  }[state];
  const Icon = state === "offline" ? CloudOff : state === "saving" ? LoaderCircle : Check;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={retryQueued}
          aria-live="polite"
          aria-label={label}
          className={cn(
            "flex h-9 cursor-default items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
            state === "offline" ? "cursor-pointer bg-[#FDF4D3] text-[#7D6210] dark:bg-[#E3B524]/16 dark:text-[#F1D37A]" : "text-ink-subtle",
          )}
        >
          <Icon className={cn("size-3.5", state === "saving" && "animate-spin")} aria-hidden />
          <span className={cn(state === "saved" && "max-lg:sr-only")}>{state === "saved" ? "Kaydedildi" : state === "saving" ? "Kaydediliyor" : "Çevrimdışı"}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}{state === "offline" ? " — internet gelince otomatik gönderilir" : ""}</TooltipContent>
    </Tooltip>
  );
}
