"use client";

import { Plus } from "lucide-react";

import { ADD_COURSE_ACTION } from "./quick-add";

/**
 * Aktif dönemin dersleri renk noktalarıyla listelenir (ilham 04).
 * Faz 1'de dersler veritabanından gelecek; şimdilik yönlendirici boş durum.
 */
export function TermCourses() {
  return (
    <section aria-labelledby="term-courses-title" className="mt-6 px-3">
      <div className="mb-1.5 flex items-center justify-between px-2.5">
        <h2 id="term-courses-title" className="text-xs font-medium text-ink-subtle">
          Dönem dersleri
        </h2>
        <button
          type="button"
          onClick={ADD_COURSE_ACTION.run}
          aria-label="Ders ekle"
          className="-mr-1.5 inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-ink-subtle transition-colors hover:bg-hover hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <p className="rounded-md border border-dashed border-line-strong px-2.5 py-2.5 text-xs leading-[18px] text-ink-muted">
        Henüz ders yok. Eklediğin dersler burada renk noktalarıyla görünecek.
      </p>
    </section>
  );
}
