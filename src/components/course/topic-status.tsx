"use client";

import { Check } from "lucide-react";

import type { TopicStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const NEXT: Record<TopicStatus, TopicStatus> = { not_started: "in_progress", in_progress: "done", done: "not_started" };
export const TOPIC_STATUS_LABEL: Record<TopicStatus, string> = {
  not_started: "Başlanmadı",
  in_progress: "Devam ediyor",
  done: "Bitti",
};

/** Tıklandıkça durum değişir: başlanmadı → devam ediyor → bitti. Üst öğede data-course olmalı. */
export function TopicStatusButton({ status, onChange, title }: { status: TopicStatus; onChange: (s: TopicStatus) => void; title: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(NEXT[status])}
      aria-label={`${title}: ${TOPIC_STATUS_LABEL[status]}. Durumu değiştir`}
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className={cn(
          "relative flex size-[18px] items-center justify-center overflow-hidden rounded-full border-2 transition-colors",
          status === "not_started" && "border-line-strong",
          status === "in_progress" && "border-course-solid",
          status === "done" && "border-course-solid bg-course-solid text-white",
        )}
      >
        {status === "in_progress" && <span className="absolute inset-y-0 left-0 w-1/2 bg-course-solid" />}
        {status === "done" && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  );
}
