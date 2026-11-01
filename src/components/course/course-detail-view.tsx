"use client";

import * as React from "react";
import { ArrowLeft, BookOpen, History, Library, NotebookPen } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRow } from "@/lib/data/hooks";
import { AppLink } from "@/lib/nav/nav-context";
import { CourseHeader } from "./course-header";
import { CourseOverview } from "./course-overview";
import { CourseTabPlaceholder } from "./course-tab-placeholder";
import { CourseTasksTab } from "./course-tasks-tab";
import { TopicList } from "./topic-list";

const TABS = [
  { value: "genel", label: "Genel bakış" },
  { value: "konular", label: "Konular" },
  { value: "gorevler", label: "Görevler" },
  { value: "notlar", label: "Notlar" },
  { value: "kaynaklar", label: "Kaynaklar" },
  { value: "gecmis", label: "Çalışma geçmişi" },
];

export function CourseDetailView({ courseId }: { courseId: string }) {
  const course = useRow("courses", courseId);
  const [tab, setTab] = React.useState("genel");

  if (!course) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Ders bulunamadı"
        description="Bu ders silinmiş ya da henüz oluşturulmamış olabilir."
        action={
          <Button asChild variant="secondary">
            <AppLink href="/dersler"><ArrowLeft />Derslere dön</AppLink>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CourseHeader course={course} />
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-5">
        <div className="relative -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <TabsList aria-label="Ders bölümleri">
            {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
        </div>
        <TabsContent value="genel"><CourseOverview course={course} /></TabsContent>
        <TabsContent value="konular"><TopicList course={course} /></TabsContent>
        <TabsContent value="gorevler"><CourseTasksTab course={course} /></TabsContent>
        <TabsContent value="notlar"><CourseTabPlaceholder icon={NotebookPen} title="Notlar" phase="Faz 3" /></TabsContent>
        <TabsContent value="kaynaklar"><CourseTabPlaceholder icon={Library} title="Kaynaklar" phase="Faz 3" /></TabsContent>
        <TabsContent value="gecmis"><CourseTabPlaceholder icon={History} title="Çalışma geçmişi" phase="Faz 3" /></TabsContent>
      </Tabs>
    </div>
  );
}
