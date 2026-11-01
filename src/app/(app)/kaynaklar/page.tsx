import type { Metadata } from "next";

import { ResourcesView } from "@/components/resources/resources-view";

export const metadata: Metadata = { title: "Kaynaklar" };

export default function Page() {
  return <ResourcesView />;
}
