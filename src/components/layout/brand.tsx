import { cn } from "@/lib/utils";

/** Logo işareti: üst üste binmiş iki yarı saydam parşömen yaprağı. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path d="M9 10.5c0-.83.67-1.5 1.5-1.5H19l4 4v8.5c0 .83-.67 1.5-1.5 1.5h-11c-.83 0-1.5-.67-1.5-1.5v-11Z" fill="var(--accent-ink)" fillOpacity=".38" />
      <path d="M11.5 12.5c0-.83.67-1.5 1.5-1.5h6.2l3.3 3.3V22c0 .83-.67 1.5-1.5 1.5H13c-.83 0-1.5-.67-1.5-1.5v-9.5Z" fill="var(--accent-ink)" />
      <path d="M19.2 11v2.3c0 .55.45 1 1 1h2.3" fill="none" stroke="var(--accent)" strokeOpacity=".35" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M14.2 17h5M14.2 19.6h3.4" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-base font-semibold tracking-[-0.01em] text-foreground", className)}>
      ideavellum
    </span>
  );
}
