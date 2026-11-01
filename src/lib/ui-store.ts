"use client";

import { create } from "zustand";

import type { ResourceType, TaskStatus } from "@/lib/data/types";

export type SessionPreset = { weekday?: number; start_time?: string; end_time?: string; course_id?: string };

export type DialogState =
  | { type: "course"; courseId?: string }
  | { type: "term"; termId?: string }
  | { type: "session"; sessionId?: string; preset?: SessionPreset }
  | { type: "task"; preset?: { status?: TaskStatus; course_id?: string; topic_id?: string; due_today?: boolean } }
  | { type: "note"; preset?: { course_id?: string } }
  | { type: "resource"; resourceId?: string; preset?: { course_id?: string; type?: ResourceType } }
  | { type: "study-log"; preset?: { course_id?: string } }
  | { type: "complete-course"; courseId: string }
  | { type: "quote"; quoteId?: string };

type UIState = {
  dialog: DialogState | null;
  taskSheetId: string | null;
  noteEditorId: string | null;
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
  open: (dialog) => set({ dialog }),
  close: () => set({ dialog: null }),
  openTask: (taskSheetId) => set({ taskSheetId }),
  openNote: (noteEditorId) => set({ noteEditorId }),
}));

export const ui = () => useUI.getState();
