"use client";

import * as React from "react";
import { LayoutGrid, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TagChip } from "@/components/tags/tag-chip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchKey } from "@/lib/catalog";
import type { CourseColor } from "@/lib/course-colors";
import { useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import type { StickyNote } from "@/lib/data/types";
import { arrangeStickies, createSticky, restoreSticky } from "@/lib/domain/stickies";
import { useMedia } from "@/lib/hooks/use-media";
import { tagCounts } from "@/lib/tags";
import { CaptureBar } from "./capture-bar";
import { CorkBoard } from "./cork-board";
import { StickyColors } from "./sticky-colors";
import { StickyGrid } from "./sticky-grid";

type Tab = "board" | "done";

/** Mantar pano: aklına geleni hızla as, uygun zamanda göreve / nota çevirerek toparla */
export function StickiesView() {
  const rows = useRows("sticky_notes");
  const desktop = useMedia("(min-width: 768px)");
  const [tab, setTab] = React.useState<Tab>("board");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [color, setColor] = React.useState<CourseColor | null>(null);
  const [tag, setTag] = React.useState<string | null>(null);
  const width = React.useRef(960);
  const onWidth = React.useCallback((w: number) => {
    if (w) width.current = w;
  }, []);

  const live = rows.filter((s) => !s.archived_at);
  const done = rows.filter((s) => s.archived_at).sort((a, b) => (b.archived_at ?? "").localeCompare(a.archived_at ?? ""));
  const tags = tagCounts(live).map(([t]) => t);
  const q = searchKey(query);
  const match = (s: StickyNote) => (!color || s.color === color) && (!tag || s.tags.includes(tag)) && (!q || searchKey(`${s.text} ${s.tags.join(" ")}`).includes(q));
  const filtering = !!(color || tag || q);

  const add = (text: string, c: CourseColor, t: string[]) => {
    const s = createSticky(text, c, t, width.current);
    if (tab !== "board") setTab("board");
    toast("Panoya asıldı", { description: text.split("\n")[0].slice(0, 60), action: { label: "Düzenle", onClick: () => setEditingId(s.id) } });
  };

  const archiveActions = (s: StickyNote) => (
    <div data-no-drag className="flex items-center gap-0.5">
      <Button variant="ghost" size="icon-sm" className="size-7 text-course-fg/70 hover:bg-surface/50 hover:text-course-fg" aria-label="Panoya geri as" title="Panoya geri as" onClick={() => restoreSticky(s)}>
        <RotateCcw />
      </Button>
      <Button variant="ghost" size="icon-sm" className="size-7 text-course-fg/70 hover:bg-surface/50 hover:text-destructive" aria-label="Kalıcı sil" title="Kalıcı sil" onClick={() => data().remove("sticky_notes", s.id)}>
        <Trash2 />
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-[-0.015em]">Mantar pano</h1>
          <p className="text-sm text-ink-muted">Aklına geleni hemen as; uygun bir zamanda göreve ya da nota çevirerek toparla.</p>
        </div>
        <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setEditingId(null); }}>
          <TabsList aria-label="Mantar pano">
            <TabsTrigger value="board" className="gap-1.5">Panoda <span className="tabular text-xs text-ink-subtle">{live.length}</span></TabsTrigger>
            <TabsTrigger value="done" className="gap-1.5">Toparlananlar <span className="tabular text-xs text-ink-subtle">{done.length}</span></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <CaptureBar onAdd={add} />

      {tab === "board" && live.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Notlarda ara"
            aria-label="Notlarda ara"
            className="h-8 w-44 rounded-md border border-line bg-surface px-2.5 text-13 outline-none placeholder:text-ink-subtle focus:border-ring"
          />
          <StickyColors size="sm" value={color} onChange={(c) => setColor(color === c ? null : c)} />
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {tags.slice(0, 10).map((t) => <TagChip key={t} tag={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)} />)}
            </div>
          )}
          {filtering && <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setColor(null); setTag(null); }}>Süzgeci temizle</Button>}
          {desktop && (
            <Button variant="secondary" size="sm" className="ml-auto" onClick={() => arrangeStickies(width.current)} title="Notları düzgün bir ızgaraya diz">
              <LayoutGrid /> Hizala
            </Button>
          )}
        </div>
      )}

      {tab === "board" ? (
        desktop ? (
          <CorkBoard stickies={live} match={match} editingId={editingId} setEditingId={setEditingId} onWidth={onWidth} />
        ) : live.length ? (
          <StickyGrid stickies={live.filter(match)} editingId={editingId} setEditingId={setEditingId} />
        ) : (
          <p className="cork rounded-2xl p-8 text-center text-13 text-ink-muted"><span className="rounded-lg bg-surface/80 px-3 py-2">Pano boş. Yukarıya yaz ve as.</span></p>
        )
      ) : done.length ? (
        <>
          <p className="text-13 text-ink-muted">Göreve ya da nota çevirdiğin ve “toparlandı” dediğin notlar. Gerekirse panoya geri asabilirsin.</p>
          <StickyGrid stickies={done} editingId={null} setEditingId={() => {}} actions={archiveActions} />
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong p-8 text-center text-13 text-ink-muted">Henüz toparlanan not yok.</p>
      )}
    </div>
  );
}
