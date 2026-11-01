import type { Topic } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** Nokta tarzı ilerleme: her konu bir nokta (ilham 01). Üst öğede data-course olmalı. */
export function TopicDots({ topics, className }: { topics: Pick<Topic, "id" | "status">[]; className?: string }) {
  if (!topics.length) return null;
  return (
    <span className={cn("flex flex-wrap gap-1", className)} aria-hidden>
      {topics.map((t) => (
        <span
          key={t.id}
          className={cn(
            "size-2.5 rounded-full",
            t.status === "done" && "bg-course-solid",
            t.status === "in_progress" && "bg-course-solid/45",
            t.status === "not_started" && "bg-course-solid/15",
          )}
        />
      ))}
    </span>
  );
}
