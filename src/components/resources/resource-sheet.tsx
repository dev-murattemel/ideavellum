"use client";

import * as React from "react";
import { FileText, Pencil, Quote } from "lucide-react";
import { toast } from "sonner";

import { useNow } from "@/components/schedule/use-now";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRow, useRows } from "@/lib/data/hooks";
import type { Resource } from "@/lib/data/types";
import { fmtAmount } from "@/lib/domain/habits";
import { highlightsToNote, readingLog } from "@/lib/domain/highlights";
import { ui, useUI } from "@/lib/ui-store";
import { HighlightList } from "./highlight-list";
import { Rating } from "./rating";
import { ReadingLog } from "./reading-log";
import { statusLabel, TYPE_META, UNIT_LABEL } from "./resource-meta";

/** Kaynağın defteri: alıntılar, okuma günlüğü ve özet tek yerde */
export function ResourceSheetHost() {
  const id = useUI((s) => s.resourceSheet);
  const open = useUI((s) => s.openResource);
  const r = useRow("resources", id ?? undefined);
  return (
    <Sheet open={!!r} onOpenChange={(o) => !o && open(null)}>
      <SheetContent className="gap-0 overflow-hidden p-0 sm:max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
        {r && <Body key={r.id} r={r} />}
      </SheetContent>
    </Sheet>
  );
}

/** Büyük sayılar tam, küçükler tek ondalık: 305,75 → 306; 1,46 → 1,5 */
const round = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10);

function Stat({ label, value, unit }: { label: string; value: string; unit?: string | null }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg bg-sunken px-3 py-2">
      <span className="truncate text-xs text-ink-muted">{label}</span>
      <span className="tabular truncate text-base font-semibold">
        {value}{unit && value !== "–" && <span className="ml-1 text-xs font-normal text-ink-muted">{unit}</span>}
      </span>
    </div>
  );
}

function Body({ r }: { r: Resource }) {
  const now = useNow();
  const course = useRow("courses", r.course_id ?? undefined);
  const highlights = useRows("highlights").filter((h) => h.resource_id === r.id);
  const log = readingLog(r.id, useRows("habits"), useRows("habit_checks"), now);
  const meta = TYPE_META[r.type];
  const Icon = meta.icon;
  const pct = r.progress_total ? ((r.progress_current ?? 0) / r.progress_total) * 100 : r.status === "done" ? 100 : 0;
  const unit = log.unit ?? (r.unit ? UNIT_LABEL[r.unit] : "");
  const [tab, setTab] = React.useState(highlights.length || !log.linked.length ? "highlights" : "log");

  const toNote = () => {
    const id = highlightsToNote(r, highlights);
    toast.success("Alıntılar nota aktarıldı", { description: `${r.title} · Alıntılar`, action: { label: "Notu aç", onClick: () => ui().openNote(id) } });
  };

  return (
    <>
      <SheetDescription className="sr-only">{meta.label} defteri: alıntılar ve okuma günlüğü</SheetDescription>
      <div className="flex-1 overflow-y-auto">
        <header data-course={course?.color ?? "slate"} className="flex flex-col gap-4 bg-course px-6 pt-6 pb-5 text-course-fg">
          <div className="flex items-start gap-3 pr-8">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface/70" aria-hidden><Icon className="size-5" strokeWidth={1.8} /></span>
            <div className="min-w-0">
              <SheetTitle className="text-xl leading-7 font-semibold">{r.title}</SheetTitle>
              <p className="text-13 opacity-85">{[meta.label, r.author, course?.name].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="shrink-0 rounded-md bg-surface/70 px-2 py-0.5 text-xs font-medium">{statusLabel(r.status, r.type)}</span>
            {r.progress_total ? (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Progress value={pct} tone="course" label={`${r.title} ilerlemesi`} className="bg-surface/60" />
                <span className="tabular shrink-0 text-xs">{r.progress_current ?? 0}/{r.progress_total} {r.unit ? UNIT_LABEL[r.unit] : ""}</span>
              </div>
            ) : <span className="flex-1" />}
            <Rating value={r.rating} />
          </div>
        </header>

        <div className="flex flex-col gap-6 p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Alıntı" value={String(highlights.length)} />
            <Stat label="Son 30 gün" value={log.linked.length ? fmtAmount(round(log.total30)) : "–"} unit={unit} />
            <Stat label="Okunan gün" value={log.linked.length ? String(log.days30) : "–"} unit="/ 30" />
            <Stat label="Günlük ort." value={log.days30 ? fmtAmount(round(log.avg)) : "–"} unit={unit} />
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList aria-label="Defter">
              <TabsTrigger value="highlights">Alıntılar{highlights.length ? ` · ${highlights.length}` : ""}</TabsTrigger>
              <TabsTrigger value="log">Okuma günlüğü</TabsTrigger>
              {r.summary && <TabsTrigger value="summary">Özet</TabsTrigger>}
            </TabsList>
            <TabsContent value="highlights" className="pt-4"><HighlightList items={highlights} resourceId={r.id} /></TabsContent>
            <TabsContent value="log" className="pt-4"><ReadingLog rows={log.rows} linked={log.linked} /></TabsContent>
            {r.summary && <TabsContent value="summary" className="pt-4"><p className="text-sm leading-6 whitespace-pre-line">{r.summary}</p></TabsContent>}
          </Tabs>
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface p-4">
        <Button variant="ghost" className="mr-auto" onClick={() => ui().open({ type: "resource", resourceId: r.id })}><Pencil /> Düzenle</Button>
        {highlights.length > 0 && <Button variant="secondary" onClick={toNote}><FileText /> Notlara aktar</Button>}
        <Button onClick={() => ui().open({ type: "highlight", resourceId: r.id, page: r.progress_current ?? undefined })}><Quote /> Alıntı ekle</Button>
      </footer>
    </>
  );
}
