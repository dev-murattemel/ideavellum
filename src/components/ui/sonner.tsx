"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border !border-line !bg-surface !text-foreground !shadow-lift !font-sans !text-sm",
          description: "!text-ink-muted",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
