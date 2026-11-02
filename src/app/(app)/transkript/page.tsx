import type { Metadata } from "next";

import { TranscriptView } from "@/components/reports/transcript-view";

export const metadata: Metadata = { title: "Transkript" };

export default function Page() {
  return <TranscriptView />;
}
