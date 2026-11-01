import { Library } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { QuickAddButton } from "@/components/layout/quick-add-button";

export function ResourcesView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Kaynaklar" description="Video, kitap, makale, podcast ve kurslar." />
      <EmptyState
        icon={Library}
        title="Henüz kaynak yok"
        description="İzlediğin videoları, okuduğun kitap ve makaleleri derslerine bağla; ilerlemeni buradan takip et."
        action={<QuickAddButton action="resource" />}
      />
    </div>
  );
}
