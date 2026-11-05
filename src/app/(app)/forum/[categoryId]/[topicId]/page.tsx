import type { Metadata } from "next";

import { TopicView } from "@/components/forum/topic-view";

export const metadata: Metadata = { title: "Forum" };

export default async function Page({ params }: { params: Promise<{ categoryId: string; topicId: string }> }) {
  const { categoryId, topicId } = await params;
  return <TopicView key={topicId} categoryId={categoryId} topicId={topicId} />;
}
