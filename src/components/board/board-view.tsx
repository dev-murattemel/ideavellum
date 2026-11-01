import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { QuickAddButton } from "@/components/layout/quick-add-button";

const COLUMNS = [
  { id: "todo", title: "Yapılacak", dot: "bg-ink-subtle" },
  { id: "in_progress", title: "Devam ediyor", dot: "bg-[var(--sky-solid)]" },
  { id: "review", title: "Gözden geçir", dot: "bg-[var(--butter-solid)]" },
  { id: "done", title: "Bitti", dot: "bg-[var(--mint-solid)]" },
] as const;

export function BoardView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pano"
        description="Görevlerini Yapılacak'tan Bitti'ye taşı."
        actions={<QuickAddButton action="task" />}
      />

      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        <div className="grid min-w-[880px] grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <section
              key={col.id}
              aria-label={col.title}
              className="flex min-h-[420px] flex-col rounded-xl bg-sunken/70 p-2"
            >
              <header className="flex h-10 items-center gap-2 px-2">
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-surface pr-2 pl-2 text-13 font-medium">
                  <span className={`size-2 rounded-full ${col.dot}`} aria-hidden />
                  {col.title}
                </span>
                <span className="tabular text-13 text-ink-muted">0</span>
              </header>
              <div className="mt-1 flex flex-1 flex-col">
                <div className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong text-13 text-ink-subtle">
                  <Plus className="size-3.5" aria-hidden />
                  Görevler burada görünecek
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
