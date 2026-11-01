import type { Metadata } from "next";

import { QuotesView } from "@/components/quotes/quotes-view";

export const metadata: Metadata = { title: "Aforizmalar" };

export default function Page() {
  return <QuotesView />;
}
