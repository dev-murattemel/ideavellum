"use client";

import { create } from "zustand";

import { snapshotNow, type Backup } from "./backup";
import { idbDel, idbGet, idbSet } from "./device-db";
import { useData } from "./store";
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

function toBackup(): Backup {
  const { data, profile } = snapshotNow();
  return { app: "ideavellum", version: 1, exportedAt: new Date().toISOString(), data, profile };
}

async function writeNow() {
  if (!handle) return;
  try {
    const w = await handle.createWritable();
    await w.write(JSON.stringify(toBackup()));
    await w.close();
    const f = await handle.getFile();
    useFileLink.setState({ status: "linked", lastWrite: Date.now(), lastModified: f.lastModified });
  } catch {
    useFileLink.setState({ status: (await permitted(handle, false)) ? "error" : "needs-permission" });
  }
}

async function readFile(): Promise<{ backup: Backup; modified: number } | null> {
  if (!handle) return null;
  const f = await handle.getFile();
  if (!f.size) return null;
  const parsed = JSON.parse(await f.text()) as Backup;
  if (parsed.app !== "ideavellum" || !parsed.data) throw new Error("Seçilen dosya bir ideavellum veri dosyası değil.");
  TABLE_NAMES.forEach((t) => ((parsed.data as DataSnapshot)[t] ??= {} as never));
  return { backup: parsed, modified: f.lastModified };
}

function loadInto(b: Backup) {
  const s = useData.getState();
  // Saklama yeri ve kimlik aynı kalır; veriler dosyadakiyle değişir
  useData.getState().load(b.data, { ...b.profile, id: s.profile.id, email: s.profile.email }, s.mode, s.place);
}

/** Bağlantı kurulduktan sonra: değişiklikleri yaz, dışarıdan değişikliği izle */
function startSync() {
  unsub?.();
  if (poll) clearInterval(poll);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let skip = false; // dosyadan yükleme sonrası oluşan tetiklemeyi geri yazma
  unsub = useData.subscribe(() => {
    if (skip) {
      skip = false;
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => void writeNow(), 1500);
  });
  if (readsAsSource) {
    poll = setInterval(async () => {
      if (!handle || document.hidden) return;
      try {
        const f = await handle.getFile();
        const { lastModified } = useFileLink.getState();
        if (lastModified && f.lastModified > lastModified + 1000) {
          const r = await readFile();
          if (r) {
            skip = true;
            loadInto(r.backup);
            useFileLink.setState({ lastModified: r.modified });
            const { toast } = await import("sonner");
            toast("Veri dosyası güncellendi", { description: "Başka bir cihazdaki değişiklikler yüklendi." });
          }
        }
      } catch {
        /* izin ya da dosya geçici olarak yok */
      }
    }, 15_000);
  }
}

/**
 * Açılışta çağrılır. Daha önce dosya seçildiyse ve izin hâlâ geçerliyse
 * (cihaz modunda) verileri dosyadan okur ve eşitlemeyi başlatır.
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
  await connect(false);
}

/** İzin istenip dosyaya yeniden bağlanır (bir tıklamayla çağrılmalı) */
export async function reconnectFileLink() {
  if (!handle || !(await permitted(handle, true))) return false;
  await connect(false);
  return true;
}

async function connect(preferLocal: boolean) {
  if (readsAsSource && !preferLocal) {
    try {
      const r = await readFile();
      if (r) {
        loadInto(r.backup);
        useFileLink.setState({ lastModified: r.modified });
      } else await writeNow();
    } catch {
      await writeNow();
    }
  } else {
    await writeNow();
  }
  useFileLink.setState({ status: "linked" });
  startSync();
}

/** Yeni bir dosya oluştur / seç: mevcut veriler oraya yazılır */
export async function linkNewFile() {
  const w = window as FsWindow;
  const h = await w.showSaveFilePicker!({ suggestedName: "ideavellum-veriler.json", types: TYPES });
  handle = h;
  await idbSet(HANDLE_KEY, h);
  useFileLink.setState({ fileName: h.name });
  await connect(true);
}

/** Var olan bir veri dosyasını aç: veriler dosyadan yüklenir (cihaz modu) */
export async function openExistingFile() {
  const w = window as FsWindow;
  const [h] = await w.showOpenFilePicker!({ types: TYPES, multiple: false });
  if (!(await permitted(h, true))) throw new Error("Dosyaya yazma izni verilmedi.");
  handle = h;
  const r = await readFile();
  await idbSet(HANDLE_KEY, h);
  useFileLink.setState({ fileName: h.name });
  if (r) {
    loadInto(r.backup);
    useFileLink.setState({ lastModified: r.modified });
  }
  await connect(true);
}

export async function unlinkFile() {
  unsub?.();
  if (poll) clearInterval(poll);
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
