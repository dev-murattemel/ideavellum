"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCourseTopics } from "@/lib/data/hooks";
import { positionAtEnd } from "@/lib/data/position";
import { data } from "@/lib/data/store";
import type { Course } from "@/lib/data/types";
import { AiLoading, AiMark, AiSampleNote } from "./ai-parts";
import { SuggestionPicker } from "./suggestion-picker";
import { useAi, useAiEnabled } from "./use-ai";

/** Ders hedefinden sıralı konu taslağı oluşturur. */
export function OutlineButton({ course }: { course: Course }) {
  const enabled = useAiEnabled();
  const topics = useCourseTopics(course.id);
  const ai = useAi("outline");
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  if (!enabled || course.status === "completed") return null;

  const start = async () => {
    setOpen(true);
    setSelected(new Set());
    await ai.run({ name: course.name, goal: course.goal, description: course.description, existingTopics: topics.map((t) => t.title) });
  };
  const items = ai.result?.data.topics.map((t, i) => ({ id: String(i), title: t.title, detail: t.note, group: "Önerilen sıra" })) ?? [];

  const apply = () => {
    const current = [...topics];
    ai.result?.data.topics.forEach((t, i) => {
      if (selected.has(String(i))) current.push(data().insert("topics", { course_id: course.id, title: t.title, status: "not_started", position: positionAtEnd(current), done_at: null }));
    });
    toast.success(`${selected.size} konu eklendi`);
    setOpen(false);
  };

  return (
    <>
      <Button variant="soft" onClick={start} className="self-start"><Sparkles /> {topics.length ? "Eksik konuları öner" : "Hedefe göre konu taslağı oluştur"}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <AiMark className="mb-1 self-start" />
            <DialogTitle>“{course.name}” için konu taslağı</DialogTitle>
            <DialogDescription>{course.goal ? `Hedef: ${course.goal}` : "Ders adına göre hazırlanır. Daha iyi sonuç için derse bir hedef yaz."}</DialogDescription>
          </DialogHeader>
          {ai.loading && <AiLoading text="Taslak hazırlanıyor…" />}
          {ai.error && <p className="text-13 text-destructive">{ai.error}</p>}
          {ai.result && (
            <>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set(items.map((i) => i.id)))}>Tümünü seç</Button>
              </div>
              <SuggestionPicker items={items} selected={selected} onToggle={(id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; })} />
              <AiSampleNote sample={ai.result.sample} />
            </>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Vazgeç</Button>
            <Button onClick={apply} disabled={!selected.size}>Seçilenleri ekle ({selected.size})</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
