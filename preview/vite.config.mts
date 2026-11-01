import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Önizleme derlemesi: uygulamanın ekranlarını sunucusuz, tek bir HTML dosyasına paketler.
 * Kullanım: PHASE_LABEL="Faz 1 — …" pnpm preview:build
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { "@": path.resolve(__dirname, "../src") } },
  define: {
    "process.env": "{}",
    __PHASE_LABEL__: JSON.stringify(process.env.PHASE_LABEL ?? "Geliştirme sürümü"),
  },
  build: {
    outDir: path.resolve(__dirname, "../preview-dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 4000,
  },
  logLevel: "warn",
});
