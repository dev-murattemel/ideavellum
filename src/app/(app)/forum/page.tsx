import type { Metadata } from "next";

import { ForumView } from "@/components/forum/forum-view";

export const metadata: Metadata = { title: "Forum" };

export default function Page() {
  return <ForumView />;
}
