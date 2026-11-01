"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ResourceStatus, ResourceType } from "@/lib/data/types";
import { ui } from "@/lib/ui-store";
import { CourseFilterChips } from "./course-filter-chips";
import { RESOURCE_TYPES } from "./resource-meta";
import { ResourceList } from "./resource-list";

export function ResourcesView() {
  const [course, setCourse] = React.useState("all");
  const [type, setType] = React.useState<"all" | ResourceType>("all");
  const [status, setStatus] = React.useState<"all" | ResourceStatus>("all");
  const [query, setQuery] = React.useState("");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Kaynaklar"
        description="Video, kitap, makale, podcast ve kurslar."
        actions={<Button onClick={() => ui().open({ type: "resource", preset: { course_id: course === "all" || course === "none" ? undefined : course } })}><Plus /> Kaynak ekle</Button>}
      />
      <CourseFilterChips value={course} onChange={setCourse} />
      <div className="flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger size="sm" className="w-auto min-w-32" aria-label="Tür"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm türler</SelectItem>
            {RESOURCE_TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger size="sm" className="w-auto min-w-32" aria-label="Durum"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm durumlar</SelectItem>
            <SelectItem value="queued">Sırada</SelectItem>
            <SelectItem value="in_progress">Devam ediyor</SelectItem>
            <SelectItem value="done">Bitti</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kaynaklarda ara" aria-label="Kaynaklarda ara" className="h-9 pl-9" />
        </div>
      </div>
      <ResourceList courseId={course === "all" ? undefined : course} type={type} status={status} query={query} />
    </div>
  );
}
