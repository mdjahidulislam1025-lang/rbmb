const DB_NAME = 'rbmb_campus_db';
const DB_VERSION = 1;
const STORE_NAME = 'kv';
const DIRTY_META_KEY = '__rbmb_dirty_keys__';

let dbPromise: Promise<IDBDatabase> | null = null;

function openIdb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          dbPromise = null;
          reject(req.error || new Error('IndexedDB open failed'));
        };
      } catch (err) {
        dbPromise = null;
        reject(err);
      }
    });
  }
  return dbPromise;
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openIdb();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

export async function idbSet(key: string, value: unknown): Promise<boolean> {
  try {
    const db = await openIdb();
    return await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}

export async function idbRemove(key: string): Promise<void> {
  try {
    const db = await openIdb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore cleanup errors
  }
}

export function safeLocalGet<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

export function safeLocalSet(key: string, data: unknown): boolean {
  let localOk = false;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localOk = true;
  } catch (e) {
    console.warn(`localStorage quota/write fallback for ${key} (saved to IndexedDB):`, e);
  }
  // Always mirror durably into IndexedDB so 5MB localStorage limits never lose records or photos
  void idbSet(key, data);
  return localOk;
}

export async function persistDurable(key: string, data: unknown): Promise<boolean> {
  let localOk = false;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localOk = true;
  } catch (e) {
    console.warn(`localStorage write skipped for ${key}, using IndexedDB:`, e);
  }
  const idbOk = await idbSet(key, data);
  return idbOk || localOk;
}

export async function loadAllIdbKeys(keys: string[]): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  await Promise.all(
    keys.map(async (k) => {
      const val = await idbGet<unknown>(k);
      if (val !== undefined) {
        out[k] = val;
      }
    })
  );
  return out;
}

export function getDirtyKeys(): Set<string> {
  const arr = safeLocalGet<string[]>(DIRTY_META_KEY, []);
  return new Set(Array.isArray(arr) ? arr : []);
}

export function markDirtyKey(key: string): void {
  const set = getDirtyKeys();
  if (!set.has(key)) {
    set.add(key);
    safeLocalSet(DIRTY_META_KEY, Array.from(set));
  }
}

export function clearDirtyKey(key: string): void {
  const set = getDirtyKeys();
  if (set.has(key)) {
    set.delete(key);
    safeLocalSet(DIRTY_META_KEY, Array.from(set));
  }
}

export function clearAllDirtyKeys(): void {
  try {
    localStorage.removeItem(DIRTY_META_KEY);
  } catch {
    // Ignore
  }
  void idbRemove(DIRTY_META_KEY);
}
