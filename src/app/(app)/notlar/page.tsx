import type { Metadata } from "next";

import { NotesView } from "@/components/notes/notes-view";

export const metadata: Metadata = { title: "Notlar" };

export default function Page() {
  return <NotesView />;
}
