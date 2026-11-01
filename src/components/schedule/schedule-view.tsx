import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { QuickAddButton } from "@/components/layout/quick-add-button";

export function ScheduleView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ders programı" description="Haftalık ders saatlerin; hafta Pazartesi başlar." />
      <EmptyState
        icon={CalendarDays}
        title="Henüz ders saati yok"
        description="Önce bir ders ekle, sonra haftalık saatlerini programa yerleştir. Örneğin “İngilizce B2” için Salı 19:00–20:30."
        action={<QuickAddButton action="course" />}
      />
    </div>
  );
}
