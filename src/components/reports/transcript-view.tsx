import { GraduationCap } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/lib/nav/nav-context";

export function TranscriptView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transkript" description="Tamamladığın derslerin arşivi ve değerlendirmesi." />
      <EmptyState
        icon={GraduationCap}
        title="Transkriptin henüz boş"
        description="Bir dersi tamamladığında kapanış notun ve kendine verdiğin puanla birlikte burada arşivlenecek."
        action={
          <Button asChild variant="secondary">
            <AppLink href="/dersler">Derslere git</AppLink>
          </Button>
        }
      />
    </div>
  );
}
