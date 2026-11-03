"use client";

import { Archive, BookMarked, ListTodo, MoreHorizontal, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProfile } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import type { StickyNote } from "@/lib/data/types";
import { archiveSticky, restoreSticky, stickyToJournal, stickyToNote, stickyToTask } from "@/lib/domain/stickies";
import { goTo } from "@/lib/nav/nav-context";
import { isoDate, zonedNow } from "@/lib/time";
import { ui } from "@/lib/ui-store";

/**
 * Notun eylemleri. Aktarımlar notu panodan kaldırmaz; not, sen silene ya da
 * arşivleyene kadar panoda kalır ve aktarıldığı yerlere bağlanır.
 */
export function StickyMenu({ s, onEdit }: { s: StickyNote; onEdit: () => void }) {
  const tz = useProfile().timezone;
  const hasTask = !!(s.task_id && data().tasks[s.task_id]);
  const hasNote = !!(s.note_id && data().notes[s.note_id]);
  const today = isoDate(zonedNow(tz));

  const toTask = () => {
    const { task, created } = stickyToTask(s);
    if (!created) return ui().openTask(task.id);
    toast.success("Göreve aktarıldı", { description: "Not panoda kalıyor; görev Pano'da Yapılacak sütununda.", action: { label: "Görevi aç", onClick: () => ui().openTask(task.id) } });
  };
  const toNote = () => {
    const { note, created } = stickyToNote(s);
    if (!created) return ui().openNote(note.id);
    toast.success("Nota aktarıldı", { description: "Not panoda kalıyor.", action: { label: "Notu aç", onClick: () => ui().openNote(note.id) } });
  };
  const toJournal = () => {
    if (s.journal_date === today) return goTo("/gunluk");
    stickyToJournal(s, today);
    toast.success("Bugünün günlüğüne eklendi", { action: { label: "Günlüğü aç", onClick: () => goTo("/gunluk") } });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Not eylemleri"
          data-no-drag
          className="size-7 text-course-fg/70 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface/50 hover:text-course-fg focus-visible:opacity-100 data-[state=open]:opacity-100 max-md:opacity-100"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={onEdit}><Pencil /> Düzenle</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-ink-subtle">Aktar · not panoda kalır</DropdownMenuLabel>
        <DropdownMenuItem onSelect={toTask}><ListTodo /> {hasTask ? "Görevi aç" : "Göreve aktar"}</DropdownMenuItem>
        <DropdownMenuItem onSelect={toNote}><NotebookPen /> {hasNote ? "Notu aç" : "Nota aktar"}</DropdownMenuItem>
        <DropdownMenuItem onSelect={toJournal}><BookMarked /> {s.journal_date === today ? "Günlüğü aç" : "Bugünün günlüğüne ekle"}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { archiveSticky(s); toast("Arşive kaldırıldı", { action: { label: "Geri al", onClick: () => restoreSticky(s) } }); }}>
          <Archive /> Arşive kaldır
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => {
            const copy = { ...s };
            data().remove("sticky_notes", s.id);
            toast("Not silindi", { action: { label: "Geri al", onClick: () => data().insert("sticky_notes", copy) } });
          }}
        >
          <Trash2 /> Sil
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
