"use client";

import * as React from "react";
import { BellRing, CircleCheckBig, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useRow, useRows } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { setTaskDone, taskReminderAt } from "@/lib/domain/tasks";
import { fmt, utcToWall } from "@/lib/time";
import { useUI } from "@/lib/ui-store";
import { DueFields, joinDue, splitDue } from "./due-fields";
import { CourseSelect, NONE, PrioritySelect, StatusSelect, TopicSelect } from "./task-fields";
import { TaskChecklist } from "./task-checklist";
import { TaskLinkedNotes } from "./task-linked-notes";

/** Karta tıklayınca sağdan açılan görev paneli */
export function TaskSheet() {
  const id = useUI((s) => s.taskSheetId);
  const openTask = useUI((s) => s.openTask);
  const task = useRow("tasks", id);
  const all = useRows("tasks");
  const [confirm, setConfirm] = React.useState(false);

  if (!task) return null;
  const set = (patch: Partial<typeof task>) => data().update("tasks", task.id, patch);
  const due = splitDue(task.due_at);

  return (
    <Sheet open={!!task} onOpenChange={(o) => !o && openTask(null)}>
      <SheetContent className="gap-0 overflow-hidden p-0 sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetDescription className="sr-only">Görev ayrıntıları</SheetDescription>
        <div className="flex-1 overflow-y-auto p-5 pt-14">
          <SheetTitle asChild className="field-sizing-content w-full resize-none rounded-md bg-transparent px-1 text-xl leading-7 font-semibold outline-none hover:bg-hover focus:bg-sunken">
            <textarea
              key={task.id + task.title}
              defaultValue={task.title}
              rows={1}
              aria-label="Görev başlığı"
              onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== task.title && set({ title: e.target.value.trim() })}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), e.currentTarget.blur())}
            />
          </SheetTitle>

          <dl className="mt-5 grid grid-cols-[96px_1fr] items-center gap-x-3 gap-y-2.5 text-13">
            <dt className="text-ink-muted">Durum</dt>
            <dd><StatusSelect size="sm" value={task.status} onChange={(status) => set({ status, completed_at: status === "done" ? new Date().toISOString() : null })} /></dd>
            <dt className="text-ink-muted">Öncelik</dt>
            <dd><PrioritySelect size="sm" value={task.priority} onChange={(priority) => set({ priority })} /></dd>
            <dt className="text-ink-muted">Ders</dt>
            <dd><CourseSelect size="sm" value={task.course_id ?? NONE} onChange={(v) => set({ course_id: v === NONE ? null : v, topic_id: null })} /></dd>
            <dt className="text-ink-muted">Konu</dt>
            <dd><TopicSelect size="sm" courseId={task.course_id ?? NONE} value={task.topic_id ?? NONE} onChange={(v) => set({ topic_id: v === NONE ? null : v })} /></dd>
            <dt className="text-ink-muted">Son tarih</dt>
            <dd><DueFields date={due.date} time={due.time} onChange={(d, t) => set({ due_at: joinDue(d, t) })} idPrefix="ts" /></dd>
          </dl>

          {task.due_at && task.status !== "done" && (
            <p className="mt-3 flex items-center gap-2 rounded-lg bg-sunken px-3 py-2 text-xs text-ink-muted">
              <BellRing className="size-3.5 shrink-0" aria-hidden />
              Hatırlatma: {fmt(utcToWall(taskReminderAt(task.due_at).toISOString()), "d MMMM, HH:mm")}
              {splitDue(task.due_at).time === "23:59" ? " (saatsiz görevler o sabah hatırlatılır)" : " (son tarihten 1 saat önce)"}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <h3 className="text-13 font-semibold">Açıklama</h3>
            <Textarea
              key={task.id + (task.description ?? "")}
              defaultValue={task.description ?? ""}
              placeholder="Ayrıntı, bağlantı ya da kendine not…"
              onBlur={(e) => e.target.value !== (task.description ?? "") && set({ description: e.target.value || null })}
              className="field-sizing-content min-h-24"
            />
          </div>

          <div className="mt-6"><TaskChecklist taskId={task.id} /></div>
          <TaskLinkedNotes task={task} />
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-line bg-surface p-4">
          <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirm(true)}>
            <Trash2 /> Sil
          </Button>
          {task.status === "done" ? (
            <Button variant="secondary" onClick={() => setTaskDone(task, false, all)}><RotateCcw /> Yeniden aç</Button>
          ) : (
            <Button onClick={() => { setTaskDone(task, true, all); toast.success("Görev tamamlandı"); }}><CircleCheckBig /> Görevi tamamla</Button>
          )}
        </footer>
      </SheetContent>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Görev silinsin mi?"
        description={`“${task.title}” ve kontrol listesi silinir.`}
        confirmLabel="Görevi sil"
        onConfirm={() => { openTask(null); data().remove("tasks", task.id); toast("Görev silindi"); }}
      />
    </Sheet>
  );
}
