import type { Metadata } from "next";

import { ReportsView } from "@/components/reports/reports-view";

export const metadata: Metadata = { title: "Raporlar" };

export default function Page() {
  return <ReportsView />;
}
