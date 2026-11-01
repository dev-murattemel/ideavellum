import type { Metadata } from "next";
import { NotebookPen } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { QuickAddButton } from "@/components/layout/quick-add-button";

export const metadata: Metadata = { title: "Notlar" };

export default function NotesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Notlar" description="Tüm derslerin notları tek yerde." />
      <EmptyState
        icon={NotebookPen}
        title="Henüz not yok"
        description="Bir dersin altına ya da hızlı ekle ile ilk notunu yaz; burada derse göre süzebileceksin."
        action={<QuickAddButton action="note" />}
      />
    </div>
  );
}
