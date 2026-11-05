"use client";

import { create } from "zustand";

import type { ResourceType, TaskStatus } from "@/lib/data/types";
import type { DayPayload } from "@/lib/domain/add-to-day";

export type SessionPreset = { weekday?: number; start_time?: string; end_time?: string; course_id?: string };

/** Takvimde açılan tek bir gün: hangi saat, hangi tarih (yyyy-MM-dd) */
export type OccurrenceRef = { sessionId: string; date: string };

export type DialogState =
  | { type: "course"; courseId?: string }
  | { type: "term"; termId?: string }
  | { type: "session"; sessionId?: string; preset?: SessionPreset }
  | { type: "task"; preset?: { status?: TaskStatus; course_id?: string; topic_id?: string; due_today?: boolean } }
  | { type: "note"; preset?: { course_id?: string } }
  | { type: "resource"; resourceId?: string; preset?: { course_id?: string; type?: ResourceType } }
  | { type: "study-log"; preset?: { course_id?: string } }
  | { type: "complete-course"; courseId: string }
  | { type: "quote"; quoteId?: string }
  | { type: "habit"; habitId?: string }
  | { type: "add-to-day"; payload: DayPayload }
  | { type: "recipe-picker"; sessionId: string; date: string }
  | { type: "highlight"; resourceId: string; highlightId?: string; page?: number }
  | { type: "forum-category"; categoryId?: string }
  | { type: "forum-topic"; categoryId?: string };

/** Rehberde açılan ayrıntı paneli: tarif, hareket ya da yöntem yazısı */
export type GuideRef = { type: "recipe" | "exercise" | "article"; id: string };
export type GuideTab = "recipes" | "exercises" | "articles";

type UIState = {
  dialog: DialogState | null;
  taskSheetId: string | null;
  noteEditorId: string | null;
  /** Takvimde tıklanan günün ayrıntı paneli */
  occurrence: OccurrenceRef | null;
  /** Kopyalanan ders saati: takvimde boş yere tıklayınca oraya yapıştırılır */
  clip: OccurrenceRef | null;
  openOccurrence: (o: OccurrenceRef | null) => void;
  guide: GuideRef | null;
  /** Kaynağın defteri (alıntılar, okuma günlüğü) sağdan açılır */
  resourceSheet: string | null;
  openResource: (id: string | null) => void;
  /** Alışkanlığın geçmişi ve notları sağdan açılır */
  habitSheet: string | null;
  openHabit: (id: string | null) => void;
  openGuide: (g: GuideRef | null) => void;
  /** Rehber sayfasında açık sekme (gün panelinden "rehbere git" ile değişir) */
  guideTab: GuideTab;
  setGuideTab: (t: GuideTab) => void;
  /** Mantar panoya gelince hızlı yazma kutusuna odaklan */
  stickyFocus: boolean;
  setStickyFocus: (v: boolean) => void;
  setClip: (o: OccurrenceRef | null) => void;
  /** Tam ekran odak modu */
  focusOpen: boolean;
  /** Kısayollar penceresi */
  shortcutsOpen: boolean;
  setFocus: (v: boolean) => void;
  setShortcuts: (v: boolean) => void;
  open: (d: DialogState) => void;
  close: () => void;
  openTask: (id: string | null) => void;
  openNote: (id: string | null) => void;
};

/** Hangi diyalog/panelin açık olduğu. Hızlı ekle, komut paleti ve sayfalar aynı yerden açar. */
export const useUI = create<UIState>()((set) => ({
  dialog: null,
  taskSheetId: null,
  noteEditorId: null,
  occurrence: null,
  clip: null,
  openOccurrence: (occurrence) => set({ occurrence }),
  guide: null,
  openGuide: (guide) => set({ guide }),
  resourceSheet: null,
  openResource: (resourceSheet) => set({ resourceSheet }),
  habitSheet: null,
  openHabit: (habitSheet) => set({ habitSheet }),
  guideTab: "recipes",
  stickyFocus: false,
  setStickyFocus: (stickyFocus) => set({ stickyFocus }),
  setGuideTab: (guideTab) => set({ guideTab }),
  setClip: (clip) => set({ clip }),
  focusOpen: false,
  shortcutsOpen: false,
  setFocus: (focusOpen) => set({ focusOpen }),
  setShortcuts: (shortcutsOpen) => set({ shortcutsOpen }),
  open: (dialog) => set({ dialog }),
  close: () => set({ dialog: null }),
  openTask: (taskSheetId) => set({ taskSheetId }),
  openNote: (noteEditorId) => set({ noteEditorId }),
}));

export const ui = () => useUI.getState();
