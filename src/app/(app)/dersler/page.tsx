import type { Metadata } from "next";

import { CoursesView } from "@/components/course/courses-view";

export const metadata: Metadata = { title: "Müfredat" };

export default function Page() {
  return <CoursesView />;
}
