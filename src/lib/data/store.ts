"use client";

import { create } from "zustand";

import { defaultProfile, LOCAL_USER_ID } from "./defaults";
import { newId } from "./ids";
import { CASCADE, SET_NULL } from "./relations";
import {
  TABLE_NAMES,
  type DataSnapshot,
  type NewRow,
  type Profile,
  type TableName,
  type Tables,
} from "./types";

/** Değişiklikleri kalıcı yere (tarayıcı ya da Supabase) yazan katman. */
export type RemoteAdapter = {
  upsert: (table: TableName, rows: object[]) => Promise<void>;
  remove: (table: TableName, id: string) => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
};

type Mutation = { upserts: { table: TableName; row: object }[]; removed: { table: TableName; id: string }[] };

export type DataState = DataSnapshot & {
  status: "loading" | "ready" | "error";
  mode: "local" | "remote";
  /** Verinin nerede durduğu: önizleme, bu cihaz (hesapsız) ya da bulut */
  place: "preview" | "device" | "cloud";
  userId: string;
  profile: Profile;
  load: (data: DataSnapshot, profile: Profile, mode: "local" | "remote", place?: "preview" | "device" | "cloud") => void;
  insert: <K extends TableName>(table: K, values: NewRow<K>) => Tables[K];
  update: <K extends TableName>(table: K, id: string, patch: Partial<Tables[K]>) => void;
  remove: (table: TableName, id: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
};

export const emptySnapshot = (): DataSnapshot =>
  Object.fromEntries(TABLE_NAMES.map((t) => [t, {}])) as unknown as DataSnapshot;

let adapter: RemoteAdapter | null = null;
/** Silinen kayıtların kimlikleri (dosya eşitlemesinde silmeyi diğer tarafa taşımak için) */
let removeListener: ((ids: string[]) => void) | null = null;
export const onRowsRemoved = (fn: ((ids: string[]) => void) | null) => {
  removeListener = fn;
};
let onSyncError: ((error: unknown) => void) | null = null;

export function setAdapter(next: RemoteAdapter | null, onError?: (error: unknown) => void) {
  adapter = next;
  onSyncError = onError ?? null;
}

/** Kayıt durumu: üst çubuktaki "Kaydedildi / Kaydediliyor / Çevrimdışı" göstergesi için */
export type SyncState = { pending: number; queued: number; savedAt: number | null };
export const useSync = create<SyncState>()(() => ({ pending: 0, queued: 0, savedAt: null }));

/** Bağlantı yokken gönderilemeyen değişiklikler; internet gelince sırayla tekrar denenir. */
let queue: Mutation[] = [];

const isNetworkError = (e: unknown) =>
  (typeof navigator !== "undefined" && !navigator.onLine) ||
  e instanceof TypeError ||
  /fetch|network|failed to fetch|load failed/i.test(String((e as { message?: string })?.message ?? e));

function flush(m: Mutation) {
  if (!adapter) return;
  if (!m.upserts.length && !m.removed.length) return;
  const a = adapter;
  const grouped = new Map<TableName, object[]>();
  m.upserts.forEach(({ table, row }) => grouped.set(table, [...(grouped.get(table) ?? []), row]));
  const ops = [
    ...[...grouped].map(([table, rows]) => a.upsert(table, rows)),
    ...m.removed.map(({ table, id }) => a.remove(table, id)),
  ];
  useSync.setState((s) => ({ pending: s.pending + 1 }));
  Promise.all(ops)
    .then(() => useSync.setState((s) => ({ pending: s.pending - 1, savedAt: Date.now() })))
    .catch((e) => {
      useSync.setState((s) => ({ pending: s.pending - 1 }));
      if (isNetworkError(e)) {
        queue.push(m);
        useSync.setState({ queued: queue.length });
      } else {
        onSyncError?.(e);
      }
    });
}

/** Kuyruktaki değişiklikleri tekrar gönderir (çevrimiçi olunca ve aralıklarla). */
export function retryQueued() {
  if (!queue.length || (typeof navigator !== "undefined" && !navigator.onLine)) return;
  const pending = queue;
  queue = [];
  useSync.setState({ queued: 0 });
  pending.forEach(flush);
}

if (typeof window !== "undefined") {
  window.addEventListener("online", retryQueued);
  setInterval(retryQueued, 20_000);
}

export const useData = create<DataState>()((set, get) => ({
  ...emptySnapshot(),
  status: "loading",
  mode: "local",
  place: "preview",
  userId: LOCAL_USER_ID,
  profile: defaultProfile(LOCAL_USER_ID),

  load: (data, profile, mode, place) =>
    set({ ...data, profile, mode, place: place ?? (mode === "remote" ? "cloud" : "preview"), userId: profile.id, status: "ready" }),

  insert: (table, values) => {
    const now = new Date().toISOString();
    const row = {
      ...values,
      id: values.id ?? newId(),
      user_id: get().userId,
      created_at: now,
      updated_at: now,
    } as unknown as Tables[typeof table];
    set({ [table]: { ...get()[table], [row.id]: row } } as Partial<DataState>);
    flush({ upserts: [{ table, row }], removed: [] });
    return row;
  },

  update: (table, id, patch) => {
    const current = get()[table][id];
    if (!current) return;
    const row = { ...current, ...patch, updated_at: new Date().toISOString() };
    set({ [table]: { ...get()[table], [id]: row } } as Partial<DataState>);
    flush({ upserts: [{ table, row }], removed: [] });
  },

  remove: (table, id) => {
    const state = get();
    const next: Partial<DataSnapshot> = {};
    const upserts: Mutation["upserts"] = [];
    const tableOf = <K extends TableName>(t: K) =>
      (next[t] ??= { ...state[t] } as DataSnapshot[K]) as Record<string, Record<string, unknown>>;

    const removedIds: string[] = [];
    const removeRec = (t: TableName, rowId: string) => {
      delete tableOf(t)[rowId];
      removedIds.push(rowId);
      CASCADE[t]?.forEach(({ table: child, fk }) => {
        Object.values(tableOf(child))
          .filter((r) => r[fk] === rowId)
          .forEach((r) => removeRec(child, r.id as string));
      });
      SET_NULL[t]?.forEach(({ table: child, fk }) => {
        const rows = tableOf(child);
        Object.values(rows)
          .filter((r) => r[fk] === rowId)
          .forEach((r) => {
            rows[r.id as string] = { ...r, [fk]: null };
            if (adapter && t !== table) upserts.push({ table: child, row: rows[r.id as string] });
          });
      });
    };

    removeRec(table, id);
    removeListener?.(removedIds);
    set(next as Partial<DataState>);
    // Veritabanı alt kayıtları kendisi siler / boşaltır; sadece kökü göndermek yeterli.
    flush({ upserts, removed: [{ table, id }] });
  },

  updateProfile: (patch) => {
    const profile = { ...get().profile, ...patch };
    set({ profile });
    adapter?.saveProfile(profile).catch((e) => onSyncError?.(e));
  },
}));

/** Bileşen dışından okumak için */
export const data = () => useData.getState();
