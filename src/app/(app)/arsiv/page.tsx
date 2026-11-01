import type { Metadata } from "next";

import { TranscriptView } from "@/components/reports/transcript-view";

export const metadata: Metadata = { title: "Arşiv" };

export default function Page() {
  return <TranscriptView />;
}
