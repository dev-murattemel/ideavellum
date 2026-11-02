"use client";

import * as React from "react";
import { addDays, addMonths, isSameMonth } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveCourses, useRows } from "@/lib/data/hooks";
import { fmt, weekDays } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { MonthGrid } from "./month-grid";
import { useNow } from "./use-now";
import { WeekGrid } from "./week-grid";
import { WeeklyLegend } from "./weekly-legend";

type View = "day" | "week" | "month";

export function ScheduleView() {
  const now = useNow(60_000);
  const courses = useActiveCourses();
  const sessions = useRows("class_sessions");
  const [view, setView] = React.useState<View>(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? "day" : "week",
  );
  const [anchor, setAnchor] = React.useState(now);

  const days = view === "day" ? [anchor] : weekDays(anchor);
  const step = (dir: 1 | -1) =>
    setAnchor((a) => (view === "month" ? addMonths(a, dir) : addDays(a, dir * (view === "day" ? 1 : 7))));

  const label =
    view === "month"
      ? fmt(anchor, "MMMM yyyy")
      : view === "day"
        ? fmt(anchor, "d MMMM yyyy, EEEE")
        : isSameMonth(days[0], days[6])
          ? `${fmt(days[0], "d")}–${fmt(days[6], "d MMMM yyyy")}`
          : `${fmt(days[0], "d MMM")} – ${fmt(days[6], "d MMM yyyy")}`;

  if (courses.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Takvim" description="Tüm derslerinin tekrar eden saatleri; hafta Pazartesi başlar." />
        <EmptyState
          icon={CalendarDays}
          title="Henüz ders yok"
          description="Önce bir ders ekle (ders, spor, okuma…), sonra saatlerini takvime yerleştir. Örneğin “Koşu” için her Salı 07:00–07:45."
          action={<Button onClick={() => ui().open({ type: "course" })}><Plus />Ders ekle</Button>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Takvim"
        description={sessions.length ? "Boş yere tıkla: saat ekle · Bloğa tıkla: o günün ayrıntısı · Sürükle: taşı · Alt kenar: uzat." : "Takvimde boş bir yere tıklayarak ilk saatini ekle."}
        actions={<Button onClick={() => ui().open({ type: "session" })}><Plus />Saat ekle</Button>}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon-sm" aria-label="Önceki" onClick={() => step(-1)}><ChevronLeft /></Button>
          <Button variant="secondary" size="icon-sm" aria-label="Sonraki" onClick={() => step(1)}><ChevronRight /></Button>
          <Button variant="secondary" size="sm" onClick={() => setAnchor(now)}>Bugün</Button>
          <h2 className="ml-1 text-base font-semibold first-letter:uppercase" aria-live="polite">{label}</h2>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList aria-label="Görünüm">
            <TabsTrigger value="day">Gün</TabsTrigger>
            <TabsTrigger value="week">Hafta</TabsTrigger>
            <TabsTrigger value="month">Ay</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "month" ? (
        <MonthGrid anchor={anchor} onPickDay={(d) => { setAnchor(d); setView("day"); }} />
      ) : (
        <WeekGrid days={days} />
      )}

      <WeeklyLegend />
    </div>
  );
}
