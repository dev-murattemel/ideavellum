import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-sunken text-ink-muted">
        <Compass className="size-6" strokeWidth={1.7} aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Bu sayfa bulunamadı</h1>
        <p className="text-sm text-ink-muted">Adres yanlış yazılmış ya da sayfa taşınmış olabilir.</p>
      </div>
      <Button asChild>
        <Link href="/bugun">Bugün ekranına dön</Link>
      </Button>
    </main>
  );
}
