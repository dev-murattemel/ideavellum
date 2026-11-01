import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Ders" };

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await params;
  return (
    <EmptyState
      icon={BookOpen}
      title="Ders bulunamadı"
      description="Bu ders silinmiş ya da henüz oluşturulmamış olabilir."
      action={
        <Button asChild variant="secondary">
          <Link href="/dersler">
            <ArrowLeft />
            Derslere dön
          </Link>
        </Button>
      }
    />
  );
}
