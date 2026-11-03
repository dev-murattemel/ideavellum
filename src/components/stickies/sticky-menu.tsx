"use client";

import { Archive, ListTodo, MoreHorizontal, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { data } from "@/lib/data/store";
import type { StickyNote } from "@/lib/data/types";
import { archiveSticky, restoreSticky, stickyToNote, stickyToTask } from "@/lib/domain/stickies";
import { ui } from "@/lib/ui-store";

/** Notun eylemleri: düzenle, göreve / nota çevir, toparlandı, sil */
export function StickyMenu({ s, onEdit }: { s: StickyNote; onEdit: () => void }) {
  const undo = { label: "Geri al", onClick: () => restoreSticky(s) };
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
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={onEdit}><Pencil /> Düzenle</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            const t = stickyToTask(s);
            toast.success("Göreve çevrildi", { description: "Pano'da Yapılacak sütununda.", action: { label: "Görevi aç", onClick: () => ui().openTask(t.id) } });
          }}
        >
          <ListTodo /> Göreve çevir
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            const n = stickyToNote(s);
            toast.success("Nota çevrildi", { action: { label: "Notu aç", onClick: () => ui().openNote(n.id) } });
          }}
        >
          <NotebookPen /> Nota çevir
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { archiveSticky(s); toast("Toparlandı", { action: undo }); }}>
          <Archive /> Toparlandı, kaldır
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
