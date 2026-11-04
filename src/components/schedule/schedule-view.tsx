"use client";

import * as React from "react";
import { addDays, addMonths, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveCourses } from "@/lib/data/hooks";
import { fmt, weekDays } from "@/lib/time";
import { ui } from "@/lib/ui-store";
import { MonthGrid } from "./month-grid";
import { ScheduleAgenda } from "./schedule-agenda";
import { ScheduleStats } from "./schedule-stats";
import { useNow } from "./use-now";
import { WeekGrid } from "./week-grid";

type View = "day" | "week" | "month";
const ALL = "all";
const AGENDA_KEY = "ivl-agenda-open";

function readAgenda() {
  try {
    return localStorage.getItem(AGENDA_KEY) !== "0";
  } catch {
    return true;
  }
}

/**
 * Takvim sayfası: üstte araç çubuğu ve haftanın özeti, ortada takvim,
 * geniş ekranda (1536px ve üstü) sağda gündem paneli (bugün, yaklaşan, yoklama bekleyen).
 */
export function ScheduleView() {
  const now = useNow(60_000);
  const courses = useActiveCourses();
  const [view, setView] = React.useState<View>(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? "day" : "week",
  );
  const [anchor, setAnchor] = React.useState(now);
  const [filter, setFilter] = React.useState<string>(ALL);
  const [agenda, setAgenda] = React.useState(readAgenda);
  // Dar ekranda gündem sağdan açılan panelde gösterilir
  const [agendaSheet, setAgendaSheet] = React.useState(false);

  const days = React.useMemo(() => (view === "day" ? [anchor] : weekDays(anchor)), [view, anchor]);
  const week = React.useMemo(() => weekDays(anchor), [anchor]);
  const step = (dir: 1 | -1) =>
    setAnchor((a) => (view === "month" ? addMonths(a, dir) : addDays(a, dir * (view === "day" ? 1 : 7))));
  const toggleAgenda = () => {
    setAgenda((v) => {
      try {
        localStorage.setItem(AGENDA_KEY, v ? "0" : "1");
      } catch {}
      return !v;
    });
  };
  const courseFilter = filter === ALL ? null : filter;

  const label =
    view === "month"
      ? fmt(anchor, "MMMM yyyy")
      : view === "day"
        ? fmt(anchor, "d MMMM yyyy, EEEE")
        : isSameMonth(days[0], days[6])
          ? `${fmt(days[0], "d")}–${fmt(days[6], "d MMMM yyyy")}`
          : `${fmt(days[0], "d MMM")} – ${fmt(days[6], "d MMM yyyy")}`;

  return (
    <div className="flex gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-[-0.015em]">Takvim</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => ui().open({ type: "session" })}><Plus />Etkinlik ekle</Button>
            <Button
              variant="secondary"
              className="2xl:hidden"
              onClick={() => setAgendaSheet(true)}
            >
              <PanelRightOpen /> Gündem
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden 2xl:inline-flex"
              aria-label={agenda ? "Gündemi gizle" : "Gündemi göster"}
              aria-pressed={agenda}
              onClick={toggleAgenda}
            >
              {agenda ? <PanelRightClose /> : <PanelRightOpen />}
            </Button>
          </div>
        </div>

        {/* Araç çubuğu: Bugün · tarih · oklar | Gün Hafta Ay | alan süzgeci */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setAnchor(now)}>Bugün</Button>
          <h2 className="mx-1 min-w-0 text-base font-semibold first-letter:uppercase" aria-live="polite">{label}</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Önceki" onClick={() => step(-1)}><ChevronLeft /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="Sonraki" onClick={() => step(1)}><ChevronRight /></Button>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as View)}>
              <TabsList aria-label="Görünüm">
                <TabsTrigger value="day">Gün</TabsTrigger>
                <TabsTrigger value="week">Hafta</TabsTrigger>
                <TabsTrigger value="month">Ay</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger size="sm" className="w-[180px]" aria-label="Alana göre süz"><SelectValue /></SelectTrigger>
              <SelectContent align="end">
                <SelectItem value={ALL}>Hepsi</SelectItem>
                <SelectItem value="events">Serbest etkinlikler</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span data-course={c.color} className="size-2 rounded-full bg-course-solid" aria-hidden />
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScheduleStats days={week} filter={courseFilter} />

        {view === "month" ? (
          <MonthGrid anchor={anchor} filter={courseFilter} onPickDay={(d) => { setAnchor(d); setView("day"); }} />
        ) : (
          <WeekGrid days={days} filter={courseFilter} />
        )}
      </div>

      <Sheet open={agendaSheet} onOpenChange={setAgendaSheet}>
        <SheetContent className="p-5 pt-6 2xl:hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetTitle className="sr-only">Gündem</SheetTitle>
          <SheetDescription className="sr-only">Bugün, yaklaşan ve işaretlenmeyi bekleyen saatler</SheetDescription>
          <ScheduleAgenda filter={courseFilter} />
        </SheetContent>
      </Sheet>

      {agenda && (
        <div className="hidden w-[340px] shrink-0 border-l border-line pl-6 2xl:block">
          <div className="sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col">
            <ScheduleAgenda filter={courseFilter} />
          </div>
        </div>
      )}
    </div>
  );
}
