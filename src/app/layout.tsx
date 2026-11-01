import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ideavellum",
    template: "%s · ideavellum",
  },
  description: "Hayatını bir üniversite dönemi gibi programla: dersler, ders saatleri, görevler, notlar ve kaynaklar tek yerde.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#141416" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning className={onest.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
