import type { Metadata } from "next";

import { GuideView } from "@/components/guides/guide-view";

export const metadata: Metadata = { title: "Rehber" };

export default function Page() {
  return <GuideView />;
}
