import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { QuickAddButton } from "@/components/layout/quick-add-button";

export function CoursesView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dersler" description="Aktif dönemin dersleri, konuları ve ilerlemesi." />
      <EmptyState
        icon={BookOpen}
        title="Henüz ders yok"
        description="İlk dersini ekleyerek döneme başla."
        action={<QuickAddButton action="course" />}
      />
    </div>
  );
}
