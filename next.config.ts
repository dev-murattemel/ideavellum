import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eski adresler yeni adlarına yönlenir (yer imleri bozulmasın)
  async redirects() {
    return [
      { source: "/dersler", destination: "/alanlar", permanent: true },
      { source: "/dersler/:id", destination: "/alanlar/:id", permanent: true },
      { source: "/program", destination: "/takvim", permanent: true },
      { source: "/raporlar", destination: "/ilerleme", permanent: true },
      { source: "/karne", destination: "/ilerleme", permanent: true },
      { source: "/transkript", destination: "/arsiv", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withSerwist(nextConfig);
