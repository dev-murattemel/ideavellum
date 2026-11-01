"use client";

import { create } from "zustand";

import { normalizeProfile, snapshotNow, type Backup } from "./backup";
import { idbDel, idbGet, idbSet } from "./device-db";
import { mergeSnapshots, mergeTombs, signature, type Tombstones } from "./merge";
import { onRowsRemoved, useData } from "./store";
import { TABLE_NAMES, type DataSnapshot } from "./types";

/**
 * Veri dosyası bağlantısı (File System Access API; masaüstü Chrome / Edge).
 * Kullanıcı bir kez dosya seçer; uygulama verileri o dosyaya otomatik yazar,
 * cihaz modunda açılışta oradan okur ve dosya dışarıdan (ör. iCloud / Drive ile başka
 * bilgisayardan) değişirse yeniden yükler.
 */

type PermissionMode = { mode: "readwrite" };
type Handle = FileSystemFileHandle & {
  queryPermission?: (d: PermissionMode) => Promise<PermissionState>;
  requestPermission?: (d: PermissionMode) => Promise<PermissionState>;
  createWritable: () => Promise<{ write: (data: Blob | string) => Promise<void>; close: () => Promise<void> }>;
};
type PickerOpts = { suggestedName?: string; types?: { description: string; accept: Record<string, string[]> }[]; excludeAcceptAllOption?: boolean };
type FsWindow = Window & {
  showSaveFilePicker?: (o?: PickerOpts) => Promise<Handle>;
  showOpenFilePicker?: (o?: PickerOpts & { multiple?: boolean }) => Promise<Handle[]>;
};

const HANDLE_KEY = "linked-file-handle";
const TYPES = [{ description: "ideavellum veri dosyası", accept: { "application/json": [".json"] } }];

export const fileLinkSupported = () => typeof window !== "undefined" && typeof (window as FsWindow).showSaveFilePicker === "function";

export type LinkState = {
  status: "none" | "linked" | "needs-permission" | "error";
  fileName: string | null;
  lastWrite: number | null;
  lastModified: number | null;
};
export const useFileLink = create<LinkState>()(() => ({ status: "none", fileName: null, lastWrite: null, lastModified: null }));

let handle: Handle | null = null;
let unsub: (() => void) | null = null;
let poll: ReturnType<typeof setInterval> | null = null;
let readsAsSource = false;

async function permitted(h: Handle, ask: boolean) {
  const opts: PermissionMode = { mode: "readwrite" };
  if ((await h.queryPermission?.(opts)) === "granted") return true;
  if (!ask) return false;
  return (await h.requestPermission?.(opts)) === "granted";
}

// --- Silinen kayıtlar (cihazda saklanır, dosyaya da yazılır) ---
const TOMBS_KEY = "ivl-tombstones";
function loadTombs(): Tombstones {
  try {
    return JSON.parse(localStorage.getItem(TOMBS_KEY) ?? "{}") as Tombstones;
  } catch {
    return {};
  }
}
function saveTombs(t: Tombstones) {
  try {
    localStorage.setItem(TOMBS_KEY, JSON.stringify(t));
  } catch {}
}
let tombs: Tombstones = typeof window !== "undefined" ? loadTombs() : {};
onRowsRemoved((ids) => {
  const at = new Date().toISOString();
  ids.forEach((id) => (tombs[id] = at));
  saveTombs(tombs);
});

type FileData = Backup & { deleted?: Tombstones };

function toBackup(data: DataSnapshot = snapshotNow().data): FileData {
  return { app: "ideavellum", version: 1, exportedAt: new Date().toISOString(), data, profile: snapshotNow().profile, deleted: tombs };
}

async function writeData(content: FileData) {
  if (!handle) return;
  const w = await handle.createWritable();
  await w.write(JSON.stringify(content));
  await w.close();
  const f = await handle.getFile();
  useFileLink.setState({ status: "linked", lastWrite: Date.now(), lastModified: f.lastModified });
}

async function readFile(): Promise<{ backup: FileData; modified: number } | null> {
  if (!handle) return null;
  const f = await handle.getFile();
  if (!f.size) return null;
  const parsed = JSON.parse(await f.text()) as FileData;
  if (parsed.app !== "ideavellum" || !parsed.data) throw new Error("Seçilen dosya bir ideavellum veri dosyası değil.");
  TABLE_NAMES.forEach((t) => ((parsed.data as DataSnapshot)[t] ??= {} as never));
  return { backup: parsed, modified: f.lastModified };
}

let applying = false; // dosyadan gelen birleştirmeyi yüklerken yeniden eşitleme tetiklenmesin

function loadInto(data: DataSnapshot, fileProfile?: Backup["profile"]) {
  const s = useData.getState();
  const local = snapshotNow();
  // Bu tarayıcıda hiç veri yoksa (yeni tarayıcı) profil de dosyadan gelir
  const empty = !signature(local.data).replace(/\|/g, "");
  const profile = empty && fileProfile ? normalizeProfile(fileProfile, s.profile.id, s.profile.email) : s.profile;
  applying = true;
  useData.getState().load(data, profile, s.mode, s.place);
  applying = false;
}

let syncing: Promise<void> | null = null;
let again = false;

/**
 * Dosya ile bu tarayıcıyı birleştirir: her kaydın en yeni hâli kalır, silinenler iki tarafta da silinir.
 * Hiçbir taraf diğerini körlemesine ezmez; böylece iki tarayıcı aynı dosyayı güvenle kullanır.
 */
async function syncNow(): Promise<void> {
  if (!handle) return;
  if (syncing) {
    again = true;
    return syncing;
  }
  syncing = (async () => {
    try {
      if (!readsAsSource) {
        // Bulut modunda dosya yalnızca güncel yedektir
        await writeData(toBackup());
        return;
      }
      let file: { backup: FileData; modified: number } | null = null;
      try {
        file = await readFile();
      } catch (e) {
        if (e instanceof SyntaxError) file = null; // yarım yazılmış dosya: üzerine güncel hâli yaz
        else throw e;
      }
      const local = snapshotNow().data;
      tombs = mergeTombs(tombs, file?.backup.deleted);
      saveTombs(tombs);
      const merged = file ? mergeSnapshots(local, file.backup.data, tombs) : mergeSnapshots(local, local, tombs);
      const mergedSig = signature(merged);
      if (mergedSig !== signature(local)) loadInto(merged, file?.backup.profile);
      const fileSig = file ? signature(file.backup.data) : "";
      const tombsChanged = JSON.stringify(file?.backup.deleted ?? {}) !== JSON.stringify(tombs);
      if (!file || mergedSig !== fileSig || tombsChanged) await writeData(toBackup(merged));
      else useFileLink.setState({ status: "linked", lastModified: file.modified });
    } catch (e) {
      if ((e as Error)?.message?.includes("ideavellum veri dosyası")) throw e;
      useFileLink.setState({ status: handle && (await permitted(handle, false)) ? "error" : "needs-permission" });
    } finally {
      syncing = null;
      if (again) {
        again = false;
        void syncNow();
      }
    }
  })();
  return syncing;
}

/** Bağlantı kurulduktan sonra: değişiklikleri birleştirerek yaz, dışarıdan değişikliği izle */
function startSync() {
  unsub?.();
  if (poll) clearInterval(poll);
  let timer: ReturnType<typeof setTimeout> | undefined;
  unsub = useData.subscribe(() => {
    if (applying) return;
    clearTimeout(timer);
    timer = setTimeout(() => void syncNow(), 1500);
  });
  poll = setInterval(async () => {
    if (!handle || document.hidden || !readsAsSource) return;
    try {
      const f = await handle.getFile();
      const { lastModified } = useFileLink.getState();
      if (!lastModified || f.lastModified > lastModified + 500) {
        const before = signature(snapshotNow().data);
        await syncNow();
        if (signature(snapshotNow().data) !== before) {
          const { toast } = await import("sonner");
          toast("Veri dosyası güncellendi", { description: "Başka bir tarayıcı ya da cihazdaki değişiklikler eklendi." });
        }
      }
    } catch {
      /* izin ya da dosya geçici olarak yok */
    }
  }, 10_000);
  // Sekmeye dönünce hemen kontrol et
  document.addEventListener("visibilitychange", onVisible);
}

function onVisible() {
  if (!document.hidden && handle && readsAsSource) void syncNow();
}

/**
 * Açılışta çağrılır. Daha önce dosya seçildiyse ve izin hâlâ geçerliyse eşitlemeyi başlatır.
 * İzin gerekiyorsa değişiklikler bu tarayıcıda birikir; izin verilince dosyayla birleştirilir.
 */
export async function resumeFileLink(opts: { asSource: boolean }) {
  readsAsSource = opts.asSource;
  if (!fileLinkSupported()) return;
  const h = await idbGet<Handle>(HANDLE_KEY);
  if (!h) return;
  handle = h;
  useFileLink.setState({ fileName: h.name });
  if (!(await permitted(h, false))) {
    useFileLink.setState({ status: "needs-permission" });
    return;
  }
  await connect();
}

/** İzin istenip dosyaya yeniden bağlanır (bir tıklamayla çağrılmalı) */
export async function reconnectFileLink() {
  if (!handle || !(await permitted(handle, true))) return false;
  await connect();
  return true;
}

async function connect() {
  await syncNow();
  if (useFileLink.getState().status !== "needs-permission") useFileLink.setState({ status: "linked" });
  startSync();
}

/** Dosya seç ya da yeni oluştur: içi doluysa bu tarayıcıdaki verilerle birleştirilir (ezilmez) */
export async function linkNewFile() {
  const w = window as FsWindow;
  const h = await w.showSaveFilePicker!({ suggestedName: "ideavellum-veriler.json", types: TYPES });
  handle = h;
  await idbSet(HANDLE_KEY, h);
  useFileLink.setState({ fileName: h.name });
  await connect();
}

/** Var olan bir veri dosyasını aç: dosyadaki veriler bu tarayıcıdakilerle birleştirilir */
export async function openExistingFile() {
  const w = window as FsWindow;
  const [h] = await w.showOpenFilePicker!({ types: TYPES, multiple: false });
  if (!(await permitted(h, true))) throw new Error("Dosyaya yazma izni verilmedi.");
  const prev = handle;
  handle = h;
  try {
    await readFile(); // geçerli bir ideavellum dosyası mı?
  } catch (e) {
    handle = prev;
    throw e;
  }
  await idbSet(HANDLE_KEY, h);
  useFileLink.setState({ fileName: h.name });
  await connect();
}

export async function unlinkFile() {
  unsub?.();
  if (poll) clearInterval(poll);
  document.removeEventListener("visibilitychange", onVisible);
  handle = null;
  await idbDel(HANDLE_KEY).catch(() => {});
  useFileLink.setState({ status: "none", fileName: null, lastWrite: null, lastModified: null });
}

/** Telefon ve desteklemeyen tarayıcılar: paylaşım ekranıyla Dosyalar / Drive'a kaydet */
export async function shareBackup(): Promise<"shared" | "downloaded" | "cancelled"> {
  const backup = toBackup();
  const name = `ideavellum-yedek-${backup.exportedAt.slice(0, 10)}.json`;
  const file = new File([JSON.stringify(backup)], name, { type: "application/json" });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  // Dokunmatik cihazlarda paylaşım ekranı (Dosyalar / Drive); masaüstünde doğrudan indir
  const touch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;
  if (touch && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: "ideavellum yedeği" });
      try {
        localStorage.setItem("ivl-last-backup", String(Date.now()));
      } catch {}
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  const { downloadBackup } = await import("./backup");
  downloadBackup();
  return "downloaded";
}

/**
 * Dosyaya bağlanamayan tarayıcılar için: seçilen veri dosyasını bu tarayıcıdaki verilerle birleştirir
 * (hiçbir taraf ezilmez; silinenler iki tarafta da silinir).
 */
export async function mergeFromFile(file: File) {
  const parsed = JSON.parse(await file.text()) as FileData;
  if (parsed.app !== "ideavellum" || !parsed.data) throw new Error("Bu dosya bir ideavellum veri dosyası değil.");
  TABLE_NAMES.forEach((t) => ((parsed.data as DataSnapshot)[t] ??= {} as never));
  tombs = mergeTombs(tombs, parsed.deleted);
  saveTombs(tombs);
  const local = snapshotNow().data;
  const merged = mergeSnapshots(local, parsed.data, tombs);
  const before = signature(local);
  loadInto(merged, parsed.profile);
  const { countRows } = await import("./backup");
  return { changed: signature(merged) !== before, rows: countRows(merged) };
}
