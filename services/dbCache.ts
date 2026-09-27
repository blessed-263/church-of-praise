import { INITIAL_OFFERING, INITIAL_THEME } from "../types";
import { LEGACY_STORAGE_KEY, PersistedService } from "./serviceTypes";

const DB_NAME = "church_of_praise";
const STORE = "kv";
const SERVICE_KEY = "service";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbGet<T>(key: string): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => resolve(req.result as T | undefined);
        req.onerror = () => reject(req.error);
      })
  );
}

function idbSet<T>(key: string, value: T): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function isPersistedService(value: unknown): value is PersistedService {
  if (!value || typeof value !== "object") return false;
  const v = value as PersistedService;
  return typeof v.rawText === "string" && !!v.theme && !!v.offeringConfig;
}

export async function migrateLegacyLocalStorage(): Promise<PersistedService | null> {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const service: PersistedService = {
      rawText: typeof parsed.rawText === "string" ? parsed.rawText : "",
      theme: { ...INITIAL_THEME, ...parsed.theme },
      offeringConfig: { ...INITIAL_OFFERING, ...parsed.offeringConfig },
    };
    await saveCachedService(service);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return service;
  } catch {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

export async function loadCachedService(): Promise<PersistedService | null> {
  const cached = await idbGet<PersistedService>(SERVICE_KEY);
  return isPersistedService(cached) ? cached : null;
}

export async function saveCachedService(service: PersistedService): Promise<void> {
  await idbSet(SERVICE_KEY, service);
}
