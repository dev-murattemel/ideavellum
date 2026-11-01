"use client";

import * as React from "react";
import { CalendarDays, List, Plus, SquareKanban } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { useNow } from "@/components/schedule/use-now";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ui } from "@/lib/ui-store";
import { BoardFilters } from "./board-filters";
import { BoardKanban } from "./board-kanban";
import { TaskCalendarView } from "./task-calendar-view";
import { TaskListView } from "./task-list-view";
import { DEFAULT_FILTERS, useBoardData, type BoardFilters as Filters } from "./use-board-data";

type View = "board" | "list" | "calendar";

export function BoardView() {
  const now = useNow(60_000);
  const [view, setView] = React.useState<View>("board");
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [showOldDone, setShowOldDone] = React.useState(false);
  const { columns, hiddenDone } = useBoardData(filters, now, showOldDone || view !== "board");
  const openCount = columns.todo.length + columns.in_progress.length + columns.review.length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Pano"
        description={`${openCount} açık görev · kartları sürükleyerek durumunu değiştir.`}
        actions={<Button onClick={() => ui().open({ type: "task" })}><Plus /> Görev ekle</Button>}
      />
      <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center lg:justify-between">
        <BoardFilters value={filters} onChange={setFilters} />
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList aria-label="Görünüm">
            <TabsTrigger value="board"><SquareKanban /> Pano</TabsTrigger>
            <TabsTrigger value="list"><List /> Liste</TabsTrigger>
            <TabsTrigger value="calendar"><CalendarDays /> Takvim</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {view === "board" && <BoardKanban columns={columns} now={now} hiddenDone={hiddenDone} onShowHidden={() => setShowOldDone(true)} />}
      {view === "list" && <TaskListView columns={columns} now={now} />}
      {view === "calendar" && <TaskCalendarView columns={columns} now={now} />}
    </div>
  );
}
