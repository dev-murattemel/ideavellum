import type { Metadata } from "next";

import { CategoryView } from "@/components/forum/category-view";

export const metadata: Metadata = { title: "Forum" };

export default async function Page({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  return <CategoryView key={categoryId} categoryId={categoryId} />;
}
