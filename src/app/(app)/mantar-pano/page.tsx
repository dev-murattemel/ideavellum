import type { Metadata } from "next";

import { StickiesView } from "@/components/stickies/stickies-view";

export const metadata: Metadata = { title: "Mantar pano" };

export default function Page() {
  return <StickiesView />;
}
