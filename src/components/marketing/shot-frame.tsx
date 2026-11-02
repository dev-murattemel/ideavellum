import Image from "next/image";

import { cn } from "@/lib/utils";

/** Ekran görüntüsü çerçevesi: ince kenar, yumuşak gölge, üstte pencere noktaları. */
export function ShotFrame({ src, alt, priority, className }: { src: string; alt: string; priority?: boolean; className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-2xl border border-line bg-surface shadow-panel", className)}>
      <div className="flex h-8 items-center gap-1.5 border-b border-line bg-sunken/60 px-3" aria-hidden>
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
      </div>
      <Image src={src} alt={alt} width={2000} height={1306} priority={priority} sizes="(min-width: 1200px) 1120px, 100vw" className="block h-auto w-full" />
    </figure>
  );
}
