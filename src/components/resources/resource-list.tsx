"use client";

import * as React from "react";
import { Library, Plus } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { useCourseMap, useRows } from "@/lib/data/hooks";
import type { ResourceStatus, ResourceType } from "@/lib/data/types";
import { ui } from "@/lib/ui-store";
import { ResourceRow } from "./resource-row";

const ORDER: Record<ResourceStatus, number> = { in_progress: 0, queued: 1, done: 2 };

export function ResourceList({ courseId, type = "all", status = "all", query = "" }: { courseId?: string; type?: "all" | ResourceType; status?: "all" | ResourceStatus; query?: string }) {
  const resources = useRows("resources");
  const courses = useCourseMap();
  const list = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return resources
      .filter((r) => !courseId || (courseId === "none" ? !r.course_id : r.course_id === courseId))
      .filter((r) => (type === "all" || r.type === type) && (status === "all" || r.status === status))
      .filter((r) => !q || `${r.title} ${r.author ?? ""} ${r.summary ?? ""}`.toLocaleLowerCase("tr").includes(q))
      .sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.updated_at.localeCompare(a.updated_at));
  }, [resources, courseId, type, status, query]);

  if (list.length === 0) {
    return (
      <EmptyState compact icon={Library} title={query || type !== "all" || status !== "all" ? "Eşleşen kaynak yok" : "Henüz kaynak yok"}
        description="İzlediğin videoları, okuduğun kitap ve makaleleri alanlarına bağla; ilerlemeni buradan takip et."
        action={<Button onClick={() => ui().open({ type: "resource", preset: { course_id: courseId && courseId !== "none" ? courseId : undefined } })}><Plus /> Kaynak ekle</Button>} />
    );
  }
  return (
    <ul className="overflow-hidden rounded-xl border border-line bg-surface">
      {list.map((r) => <ResourceRow key={r.id} r={r} course={r.course_id ? courses[r.course_id] : undefined} />)}
    </ul>
  );
}
