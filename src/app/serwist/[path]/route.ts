import { createSerwistRoute } from "@serwist/turbopack";

// Service worker dosyasını (/serwist/sw.js) üretir ve sunar.
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});
