import type { Metadata } from "next";
import Link from "next/link";
import { ChartColumn } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Raporlar" };

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Raporlar" description="Haftalık ve aylık ilerleme özetlerin." />
      <EmptyState
        icon={ChartColumn}
        title="Rapor için henüz veri yok"
        description="Çalışma süren ve tamamladığın görevler biriktikçe haftalık ve aylık özetlerin burada oluşacak."
        action={
          <Button asChild variant="secondary">
            <Link href="/bugun">Bugün ekranına git</Link>
          </Button>
        }
      />
    </div>
  );
}
