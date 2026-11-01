import type { Metadata } from "next";

import { AuthCallback } from "./auth-callback";

export const metadata: Metadata = { title: "Giriş yapılıyor" };

export default function Page() {
  return <AuthCallback />;
}
