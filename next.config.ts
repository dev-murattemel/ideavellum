import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eski adresler yeni adlarına yönlenir (yer imleri bozulmasın)
  async redirects() {
    return [
      { source: "/alanlar", destination: "/dersler", permanent: true },
      { source: "/alanlar/:id", destination: "/dersler/:id", permanent: true },
      { source: "/program", destination: "/takvim", permanent: true },
      { source: "/raporlar", destination: "/karne", permanent: true },
      { source: "/arsiv", destination: "/transkript", permanent: true },
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
