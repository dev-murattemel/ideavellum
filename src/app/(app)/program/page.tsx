import type { Metadata } from "next";

import { ScheduleView } from "@/components/schedule/schedule-view";

export const metadata: Metadata = { title: "Ders programı" };

export default function Page() {
  return <ScheduleView />;
}
