import type { Metadata } from "next";

import { TodayView } from "@/components/today/today-view";

export const metadata: Metadata = { title: "Bugün" };

export default function Page() {
  return <TodayView />;
}
