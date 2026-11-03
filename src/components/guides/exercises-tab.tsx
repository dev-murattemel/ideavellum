"use client";

import * as React from "react";
import { SearchX } from "lucide-react";

import { searchKey } from "@/lib/catalog";
import { EXERCISE_GUIDES, GUIDE_GROUPS } from "@/lib/guides";
import { ui } from "@/lib/ui-store";
import { ExerciseVisual, groupStyle } from "./exercise-visual";
import { FilterChips } from "./filter-chips";
import { SearchBox } from "./search-box";

/** Hareket rehberi: kas grubuna göre kartlar */
export function ExercisesTab() {
  const [group, setGroup] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const q = searchKey(query);
  const shown = EXERCISE_GUIDES.filter(
    (g) => (group === "all" || g.group === group) && (!q || searchKey(`${g.name} ${g.muscles.join(" ")} ${g.equipment}`).includes(q)),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterChips
          label="Kas grubu"
          value={group}
          onChange={setGroup}
          chips={[
            { key: "all", label: "Tümü", count: EXERCISE_GUIDES.length },
            ...GUIDE_GROUPS.filter((g) => EXERCISE_GUIDES.some((x) => x.group === g)).map((g) => ({
              key: g,
              label: g,
              count: EXERCISE_GUIDES.filter((x) => x.group === g).length,
              color: groupStyle(g).color,
            })),
          ]}
        />
        <SearchBox value={query} onChange={setQuery} placeholder="Hareket ya da kas ara" />
      </div>
      {shown.length ? (
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {shown.map((g) => (
            <button
              key={g.name}
              type="button"
              onClick={() => ui().openGuide({ type: "exercise", id: g.name })}
              className="lift flex cursor-pointer items-stretch overflow-hidden rounded-xl border border-line bg-surface text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ExerciseVisual group={g.group} className="w-24 shrink-0" />
              <span className="flex min-w-0 flex-col gap-1 p-4">
                <span className="text-xs text-ink-muted">{g.group} · {g.level}</span>
                <span className="truncate text-sm font-semibold">{g.name}</span>
                <span className="line-clamp-2 text-13 text-ink-muted">{g.muscles.join(", ")}</span>
                <span className="tabular mt-1 text-xs font-medium">{g.minutes ? `${g.minutes} dk` : `${g.sets ?? 3} × ${g.reps ?? 10}`}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong py-12 text-center">
          <SearchX className="size-5 text-ink-subtle" aria-hidden />
          <p className="text-13 text-ink-muted">Aramaya uyan hareket yok.</p>
        </div>
      )}
    </div>
  );
}
