"use client";

import { Plus } from "lucide-react";

import { TaskListView } from "@/components/board/task-list-view";
import { DEFAULT_FILTERS, useBoardData } from "@/components/board/use-board-data";
import { useNow } from "@/components/schedule/use-now";
import { Button } from "@/components/ui/button";
import type { Course } from "@/lib/data/types";
import { ui } from "@/lib/ui-store";

export function CourseTasksTab({ course }: { course: Course }) {
  const now = useNow(60_000);
  const { columns } = useBoardData({ ...DEFAULT_FILTERS, course: course.id }, now, true);
  return (
    <div className="flex flex-col gap-4">
      <Button className="self-start" onClick={() => ui().open({ type: "task", preset: { course_id: course.id } })}>
        <Plus /> Bu derse görev ekle
      </Button>
      <TaskListView columns={columns} now={now} />
    </div>
  );
}
