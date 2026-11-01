import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & { tone?: "neutral" | "course" | "outline" | "accent" }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5",
        tone === "neutral" && "bg-sunken text-ink-muted",
        tone === "course" && "bg-course text-course-fg",
        tone === "outline" && "border border-line bg-surface text-ink-muted",
        tone === "accent" && "bg-accent-soft text-accent-text",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
