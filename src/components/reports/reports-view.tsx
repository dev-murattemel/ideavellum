import { ChartColumn } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/lib/nav/nav-context";

export function ReportsView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Raporlar" description="Haftalık ve aylık ilerleme özetlerin." />
      <EmptyState
        icon={ChartColumn}
        title="Rapor için henüz veri yok"
        description="Çalışma süren ve tamamladığın görevler biriktikçe haftalık ve aylık özetlerin burada oluşacak."
        action={
          <Button asChild variant="secondary">
            <AppLink href="/bugun">Bugün ekranına git</AppLink>
          </Button>
        }
      />
    </div>
  );
}
