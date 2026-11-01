import type { Metadata } from "next";

import { JournalView } from "@/components/journal/journal-view";

export const metadata: Metadata = { title: "Günlük" };

export default function Page() {
  return <JournalView />;
}
