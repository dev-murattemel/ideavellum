"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCourseTopics, useRow, useRows } from "@/lib/data/hooks";
import { positionAtEnd } from "@/lib/data/position";
import { data } from "@/lib/data/store";
import { AiLoading, AiMark, AiSampleNote } from "./ai-parts";
import { SuggestionPicker, type Pick } from "./suggestion-picker";
import { useAi, useAiEnabled } from "./use-ai";

/** Not ya da kaynak özetinden konu/görev önerisi; kullanıcı seçtiklerini ekler. */
export function SuggestFromTextButton({ courseId, title, text }: { courseId: string | null; title: string; text: string }) {
  const enabled = useAiEnabled();
  const [open, setOpen] = React.useState(false);
  if (!enabled || !courseId || text.trim().length < 20) return null;
  return (
    <>
      <Button variant="soft" size="sm" onClick={() => setOpen(true)}><Sparkles /> Konu ve görev öner</Button>
      {open && <SuggestDialog courseId={courseId} title={title} text={text} onClose={() => setOpen(false)} />}
    </>
  );
}

function SuggestDialog({ courseId, title, text, onClose }: { courseId: string; title: string; text: string; onClose: () => void }) {
  const course = useRow("courses", courseId);
  const topics = useCourseTopics(courseId);
  const tasks = useRows("tasks");
  const ai = useAi("suggest");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    void ai.run({ courseName: course?.name ?? null, existingTopics: topics.map((t) => t.title), sourceTitle: title || "Not", text: text.slice(0, 12000) });
  }, [ai, course, topics, title, text]);

  const picks: Pick[] = ai.result
    ? [
        ...ai.result.data.topics.map((t, i) => ({ id: `t${i}`, title: t.title, detail: t.why, group: "Yeni konular" })),
        ...ai.result.data.tasks.map((t, i) => ({ id: `k${i}`, title: t.title, detail: `Öncelik: ${{ low: "Düşük", medium: "Orta", high: "Yüksek" }[t.priority]}`, group: "Görevler" })),
      ]
    : [];

  const apply = () => {
    if (!ai.result) return;
    let added = 0;
    const current = [...topics];
    ai.result.data.topics.forEach((t, i) => {
      if (!selected.has(`t${i}`)) return;
      current.push(data().insert("topics", { course_id: courseId, title: t.title, status: "not_started", position: positionAtEnd(current), done_at: null }));
      added++;
    });
    const todo = tasks.filter((t) => t.status === "todo");
    ai.result.data.tasks.forEach((t, i) => {
      if (!selected.has(`k${i}`)) return;
      todo.push(data().insert("tasks", { course_id: courseId, topic_id: null, title: t.title, description: `“${title}” kaynağından önerildi.`, status: "todo", priority: t.priority, due_at: null, position: positionAtEnd(todo), completed_at: null }));
      added++;
    });
    toast.success(`${added} öneri eklendi`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <AiMark className="mb-1 self-start" />
          <DialogTitle>“{title || "Not"}” için öneriler</DialogTitle>
          <DialogDescription>Eklemek istediklerini işaretle; işaretlemediğin hiçbir şey kaydedilmez.</DialogDescription>
        </DialogHeader>
        {ai.loading && <AiLoading text="Metni okuyor…" />}
        {ai.error && <p className="text-13 text-destructive">{ai.error}</p>}
        {ai.result && (
          <>
            <SuggestionPicker items={picks} selected={selected} onToggle={(id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })} />
            <AiSampleNote sample={ai.result.sample} />
          </>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Vazgeç</Button>
          <Button onClick={apply} disabled={!selected.size}>Seçilenleri ekle ({selected.size})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
