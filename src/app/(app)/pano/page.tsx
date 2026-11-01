import type { Metadata } from "next";

import { BoardView } from "@/components/board/board-view";

export const metadata: Metadata = { title: "Pano" };

export default function Page() {
  return <BoardView />;
}
