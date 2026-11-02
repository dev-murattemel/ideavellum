"use client";

import { useMemo } from "react";

import { sortByPosition } from "./position";
import { useData } from "./store";
import type { Course, TableName, Tables } from "./types";

export function useRows<K extends TableName>(table: K): Tables[K][] {
  const map = useData((s) => s[table]);
  return useMemo(() => Object.values(map) as Tables[K][], [map]);
}

export function useRow<K extends TableName>(table: K, id: string | null | undefined): Tables[K] | undefined {
  return useData((s) => (id ? (s[table][id] as Tables[K] | undefined) : undefined));
}

export function useActiveTerm() {
  const terms = useRows("terms");
  return useMemo(() => terms.find((t) => t.is_active) ?? null, [terms]);
}

const byCreated = (a: { created_at: string }, b: { created_at: string }) => a.created_at.localeCompare(b.created_at);

/** Dersler: önce elle verilen sıra, sırası olmayanlar oluşturulma sırasıyla sonda */
export const byAreaOrder = (a: Course, b: Course) =>
  a.position && b.position ? (a.position < b.position ? -1 : a.position > b.position ? 1 : 0) : a.position ? -1 : b.position ? 1 : byCreated(a, b);

/** Aktif dönemin devam eden (tamamlanmamış) dersleri */
export function useActiveCourses(): Course[] {
  const courses = useRows("courses");
  const term = useActiveTerm();
  return useMemo(
    () =>
      courses
        .filter((c) => (c.status === "active" || c.status === "paused") && (!term || c.term_id === term.id || !c.term_id))
        .sort(byAreaOrder),
    [courses, term],
  );
}

export function useCourseMap() {
  return useData((s) => s.courses);
}

export function useCourseTopics(courseId: string) {
  const topics = useRows("topics");
  return useMemo(() => sortByPosition(topics.filter((t) => t.course_id === courseId)), [topics, courseId]);
}

export const useProfile = () => useData((s) => s.profile);
export const useDataMode = () => useData((s) => s.mode);
export const usePlace = () => useData((s) => s.place);
