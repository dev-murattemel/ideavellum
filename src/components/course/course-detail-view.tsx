"use client";

import { ArrowLeft, BookOpen } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/lib/nav/nav-context";

export function CourseDetailView({ courseId }: { courseId: string }) {
  void courseId;
  return (
    <EmptyState
      icon={BookOpen}
      title="Ders bulunamadı"
      description="Bu ders silinmiş ya da henüz oluşturulmamış olabilir."
      action={
        <Button asChild variant="secondary">
          <AppLink href="/dersler">
            <ArrowLeft />
            Derslere dön
          </AppLink>
        </Button>
      }
    />
  );
}
