"use client";

import { create } from "zustand";

import type { ResourceType, TaskStatus } from "@/lib/data/types";

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
  | { type: "habit"; habitId?: string };

type UIState = {
  dialog: DialogState | null;
  taskSheetId: string | null;
  noteEditorId: string | null;
  /** Takvimde tıklanan günün ayrıntı paneli */
  occurrence: OccurrenceRef | null;
  /** Kopyalanan ders saati: takvimde boş yere tıklayınca oraya yapıştırılır */
  clip: OccurrenceRef | null;
  openOccurrence: (o: OccurrenceRef | null) => void;
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
