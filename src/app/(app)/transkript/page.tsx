import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Transkript" };

export default function TranscriptPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Transkript" description="Tamamladığın derslerin arşivi ve değerlendirmesi." />
      <EmptyState
        icon={GraduationCap}
        title="Transkriptin henüz boş"
        description="Bir dersi tamamladığında kapanış notun ve kendine verdiğin puanla birlikte burada arşivlenecek."
        action={
          <Button asChild variant="secondary">
            <Link href="/dersler">Derslere git</Link>
          </Button>
        }
      />
    </div>
  );
}
