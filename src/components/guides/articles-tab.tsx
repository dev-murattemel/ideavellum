"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

import { ARTICLES } from "@/lib/guides";
import { ui } from "@/lib/ui-store";
import { FilterChips } from "./filter-chips";

/** Yöntem rehberleri: okuma, dil, maneviyat, izleme, proje, alışkanlık */
export function ArticlesTab() {
  const topics = [...new Set(ARTICLES.map((a) => a.topic))];
  const [topic, setTopic] = React.useState("all");
  const shown = ARTICLES.filter((a) => topic === "all" || a.topic === topic);

  return (
    <div className="flex flex-col gap-5">
      <FilterChips
        label="Konu"
        value={topic}
        onChange={setTopic}
        chips={[
          { key: "all", label: "Tümü", count: ARTICLES.length },
          ...topics.map((t) => ({ key: t, label: t, count: ARTICLES.filter((a) => a.topic === t).length, color: ARTICLES.find((a) => a.topic === t)!.color })),
        ]}
      />
      <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((a) => (
          <button
            key={a.id}
            type="button"
            data-course={a.color}
            onClick={() => ui().openGuide({ type: "article", id: a.id })}
            className="lift group flex cursor-pointer flex-col gap-3 rounded-xl border border-line bg-surface p-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="w-fit rounded-md bg-course px-2 py-0.5 text-xs font-medium text-course-fg">{a.topic}</span>
            <span className="text-base leading-6 font-semibold">{a.title}</span>
            <span className="text-13 text-ink-muted">{a.summary}</span>
            <span className="mt-auto flex items-center gap-1 pt-1 text-13 font-medium">
              {a.steps.length} adımda oku <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
