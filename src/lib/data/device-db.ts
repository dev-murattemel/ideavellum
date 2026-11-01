"use client";

/**
 * Tarayıcının kalıcı veritabanı (IndexedDB) için küçük anahtar–değer sarmalayıcısı.
 * localStorage'dan çok daha büyük veri tutar (görseller dahil); her şey yalnızca bu cihazda kalır.
 */
const DB = "ideavellum";
const STORE = "kv";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    t.onerror = t.onabort = () => {
      db.close();
      reject(t.error);
    };
  });
}

export const idbGet = <T>(key: string) => tx<T | undefined>("readonly", (s) => s.get(key) as IDBRequest<T | undefined>).catch(() => undefined);
export const idbSet = (key: string, value: unknown) => tx("readwrite", (s) => s.put(value, key));
export const idbDel = (key: string) => tx("readwrite", (s) => s.delete(key));

/** Tarayıcıdan, verilerin temizlik sırasında silinmemesini ister (destekleniyorsa). */
export async function requestPersistence() {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
