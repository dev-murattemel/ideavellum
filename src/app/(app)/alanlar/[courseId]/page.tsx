import type { Metadata } from "next";

import { CourseDetailView } from "@/components/course/course-detail-view";

export const metadata: Metadata = { title: "Alan" };

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <CourseDetailView courseId={courseId} />;
}
