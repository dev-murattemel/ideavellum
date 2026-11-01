"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { Rating } from "@/components/resources/rating";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useRow } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import { useCourseStats } from "@/lib/domain/course-stats";
import { useNav } from "@/lib/nav/nav-context";
import { formatDuration } from "@/lib/time";

/** Dersi kapatır: kısa değerlendirme ister ve Transkript'e taşır. */
export function CompleteCourseDialog({ courseId, onClose }: { courseId: string; onClose: () => void }) {
  const course = useRow("courses", courseId);
  const nav = useNav();
  const [reflection, setReflection] = React.useState("");
  const [note, setNote] = React.useState("");
  const [rating, setRating] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  if (!course) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return setError("Birkaç cümleyle ne öğrendiğini yaz.");
    if (!rating) return setError("Kendine 1–5 arası bir puan ver.");
    data().update("courses", course.id, {
      status: "completed", completed_at: new Date().toISOString(),
      final_reflection: reflection.trim(), final_note: note.trim() || null, final_rating: rating,
    });
    toast.success(`“${course.name}” tamamlandı`, { description: "Transkript'e eklendi. Tebrikler!" });
    onClose();
    nav.push("/transkript");
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <span data-course={course.color} className="mb-2 flex size-11 items-center justify-center rounded-xl bg-course text-course-fg">
            <GraduationCap className="size-6" strokeWidth={1.7} aria-hidden />
          </span>
          <DialogTitle>“{course.name}” dersini tamamla</DialogTitle>
          <DialogDescription>Kapanış değerlendirmen Transkript&apos;te dersin yanında saklanır.</DialogDescription>
        </DialogHeader>
        <CourseSummary courseId={course.id} />
        <form onSubmit={save} className="flex flex-col gap-4" noValidate>
          <Field label="Ne öğrendim?" htmlFor="cc-ref">
            <Textarea id="cc-ref" rows={3} autoFocus value={reflection} onChange={(e) => { setReflection(e.target.value); setError(null); }} placeholder="Bu dersten aklımda kalan en önemli şeyler…" />
          </Field>
          <Field label="Kendime not (isteğe bağlı)" htmlFor="cc-note">
            <Textarea id="cc-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bir dahaki sefere farklı yapacağım şey…" />
          </Field>
          <Field label="Kendime puanım">
            <Rating value={rating} onChange={(v) => { setRating(v); setError(null); }} size="md" />
          </Field>
          {error && <p role="alert" className="text-13 text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
            <Button type="submit">Dersi tamamla</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CourseSummary({ courseId }: { courseId: string }) {
  const course = useRow("courses", courseId)!;
  const s = useCourseStats(course);
  return (
    <p className="rounded-lg bg-sunken px-3 py-2.5 text-13 text-ink-muted">
      Toplam <span className="font-medium text-foreground">{formatDuration(s.totalMinutes)}</span> çalıştın,{" "}
      <span className="font-medium text-foreground">{s.topicsDone}/{s.topicsTotal}</span> konuyu bitirdin.
      {s.openTasks > 0 && ` ${s.openTasks} açık görev dersle birlikte arşivlenecek.`}
    </p>
  );
}
