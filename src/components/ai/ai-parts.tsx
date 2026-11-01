import { LoaderCircle, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function AiMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent-text", className)}>
      <Sparkles className="size-3" aria-hidden /> AI
    </span>
  );
}

export function AiSampleNote({ sample }: { sample: boolean }) {
  if (!sample) return <p className="text-xs text-ink-subtle">AI önerisidir; kontrol ederek kullan.</p>;
  return (
    <p className="text-xs text-ink-subtle">
      Önizleme: bu bir <span className="font-medium">örnek yanıt</span>. Gerçek AI, uygulama yayınlanıp Anthropic anahtarı girildiğinde çalışır.
    </p>
  );
}

export function AiLoading({ text = "Düşünüyor…" }: { text?: string }) {
  return (
    <p className="flex items-center gap-2 text-13 text-ink-muted" aria-live="polite">
      <LoaderCircle className="size-4 animate-spin" aria-hidden /> {text}
    </p>
  );
}
