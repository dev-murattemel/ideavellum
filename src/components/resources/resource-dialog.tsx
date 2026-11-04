"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CourseSelect, NONE, TopicSelect } from "@/components/board/task-fields";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRow } from "@/lib/data/hooks";
import { data } from "@/lib/data/store";
import type { ResourceStatus, ResourceType, ResourceUnit } from "@/lib/data/types";
import { Rating } from "./rating";
import { defaultUnit, RESOURCE_TYPES, statusLabel, UNIT_LABEL } from "./resource-meta";

const num = (s: string) => (s.trim() === "" ? null : Math.max(0, Math.round(Number(s))) || 0);

export function ResourceDialog({ resourceId, preset, onClose }: { resourceId?: string; preset?: { course_id?: string; type?: ResourceType }; onClose: () => void }) {
  const r = useRow("resources", resourceId);
  const [type, setType] = React.useState<ResourceType>(r?.type ?? preset?.type ?? "book");
  const [title, setTitle] = React.useState(r?.title ?? "");
  const [author, setAuthor] = React.useState(r?.author ?? "");
  const [url, setUrl] = React.useState(r?.url ?? "");
  const [courseId, setCourseId] = React.useState(r?.course_id ?? preset?.course_id ?? NONE);
  const [topicId, setTopicId] = React.useState(r?.topic_id ?? NONE);
  const [status, setStatus] = React.useState<ResourceStatus>(r?.status ?? "queued");
  const [cur, setCur] = React.useState(r?.progress_current?.toString() ?? "");
  const [total, setTotal] = React.useState(r?.progress_total?.toString() ?? "");
  const [unit, setUnit] = React.useState<ResourceUnit>(r?.unit ?? defaultUnit(type));
  const [rating, setRating] = React.useState<number | null>(r?.rating ?? null);
  const [summary, setSummary] = React.useState(r?.summary ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState(false);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 2) return setError("Başlık en az 2 harf olmalı.");
    const c = num(cur);
    const t = num(total);
    const values = {
      type, title: title.trim(), author: author.trim() || null, url: url.trim() || null,
      course_id: courseId === NONE ? null : courseId, topic_id: topicId === NONE ? null : topicId,
      status: t && c !== null && c >= t ? "done" : status, progress_current: c, progress_total: t,
      unit: c !== null || t !== null ? unit : null, rating, summary: summary.trim() || null,
    } satisfies Partial<import("@/lib/data/types").Resource>;
    if (r) data().update("resources", r.id, values);
    else data().insert("resources", values);
    toast.success(r ? "Kaynak güncellendi" : "Kaynak eklendi", { description: values.title });
    onClose();
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{r ? "Kaynağı düzenle" : "Kaynak ekle"}</DialogTitle>
            <DialogDescription>İzlediğin video, okuduğun kitap ya da makale.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="flex flex-col gap-4" noValidate>
            <div role="radiogroup" aria-label="Tür" className="flex flex-wrap gap-1.5">
              {RESOURCE_TYPES.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" role="radio" aria-checked={type === id}
                  onClick={() => { setType(id); if (!cur && !total) setUnit(defaultUnit(id)); }}
                  className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-13 font-medium transition-colors ${type === id ? "border-primary bg-accent-soft text-accent-text" : "border-line text-ink-muted hover:text-foreground"}`}>
                  <Icon className="size-4" aria-hidden />{label}
                </button>
              ))}
            </div>
            <Field label="Başlık" htmlFor="r-title" error={error ?? undefined}>
              <Input id="r-title" autoFocus value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} placeholder="English Grammar in Use" />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Yazar / kanal" htmlFor="r-author"><Input id="r-author" value={author} onChange={(e) => setAuthor(e.target.value)} /></Field>
              <Field label="Bağlantı" htmlFor="r-url"><Input id="r-url" type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" /></Field>
              <Field label="Alan"><CourseSelect value={courseId} onChange={(v) => { setCourseId(v); setTopicId(NONE); }} /></Field>
              <Field label="Konu"><TopicSelect courseId={courseId} value={topicId} onChange={setTopicId} /></Field>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto_1fr] items-end gap-2">
              <Field label="Durum">
                <Select value={status} onValueChange={(v) => setStatus(v as ResourceStatus)}>
                  <SelectTrigger aria-label="Durum"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["queued", "in_progress", "done"] as const).map((s) => <SelectItem key={s} value={s}>{statusLabel(s, type)}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="İlerleme" htmlFor="r-cur"><Input id="r-cur" inputMode="numeric" className="tabular w-20" value={cur} onChange={(e) => setCur(e.target.value.replace(/\D/g, ""))} placeholder="0" /></Field>
              <Field label="Toplam" htmlFor="r-total"><Input id="r-total" inputMode="numeric" className="tabular w-20" value={total} onChange={(e) => setTotal(e.target.value.replace(/\D/g, ""))} placeholder="—" /></Field>
              <Field label="Birim">
                <Select value={unit} onValueChange={(v) => setUnit(v as ResourceUnit)}>
                  <SelectTrigger aria-label="Birim"><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(UNIT_LABEL) as ResourceUnit[]).map((u) => <SelectItem key={u} value={u}>{UNIT_LABEL[u]}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Puan"><Rating value={rating} onChange={setRating} size="md" /></Field>
            <Field label="Kısa özet" htmlFor="r-sum"><Textarea id="r-sum" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Bu kaynaktan aklında kalan" /></Field>
            <DialogFooter className="sm:justify-between">
              {r ? <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirm(true)}><Trash2 /> Kaynağı sil</Button> : <span />}
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
                <Button type="submit">{r ? "Değişiklikleri kaydet" : "Kaynağı ekle"}</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Kaynak silinsin mi?" description={`“${r?.title}” listeden kaldırılır.`} confirmLabel="Kaynağı sil"
        onConfirm={() => { if (r) data().remove("resources", r.id); toast("Kaynak silindi"); onClose(); }} />
    </>
  );
}
