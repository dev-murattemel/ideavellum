"use client";

import * as React from "react";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRow } from "@/lib/data/hooks";
import { AppLink } from "@/lib/nav/nav-context";
import { CourseHeader } from "./course-header";
import { CourseOverview } from "./course-overview";
import { OutlineButton } from "@/components/ai/outline-button";
import { createNote } from "@/components/notes/create-note";
import { NoteGrid } from "@/components/notes/note-grid";
import { ResourceList } from "@/components/resources/resource-list";
import { ui } from "@/lib/ui-store";
import { CourseHistoryTab } from "./course-history-tab";
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
        <TabsContent value="konular">
          <div className="flex flex-col gap-4">
            <OutlineButton course={course} />
            <TopicList course={course} />
          </div>
        </TabsContent>
        <TabsContent value="gorevler"><CourseTasksTab course={course} /></TabsContent>
        <TabsContent value="notlar">
          <div className="flex flex-col gap-4">
            <Button className="self-start" onClick={() => createNote(course.id)}><Plus /> Bu derse not ekle</Button>
            <NoteGrid courseId={course.id} newCourseId={course.id} />
          </div>
        </TabsContent>
        <TabsContent value="kaynaklar">
          <div className="flex flex-col gap-4">
            <Button className="self-start" onClick={() => ui().open({ type: "resource", preset: { course_id: course.id } })}><Plus /> Bu derse kaynak ekle</Button>
            <ResourceList courseId={course.id} />
          </div>
        </TabsContent>
        <TabsContent value="gecmis"><CourseHistoryTab course={course} /></TabsContent>
      </Tabs>
    </div>
  );
}
