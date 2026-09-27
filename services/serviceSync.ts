import { INITIAL_OFFERING, INITIAL_LYRICS, INITIAL_THEME } from "../types";
import { loadCachedService, migrateLegacyLocalStorage, saveCachedService } from "./dbCache";
import {
  fetchRemoteService,
  isBrowserOnline,
  putRemoteService,
  SyncStatus,
} from "./serviceApi";
import { PersistedService } from "./serviceTypes";

export { type SyncStatus };

const SAVE_DEBOUNCE_MS = 800;
const API_BACKOFF_MS = 15000;

export const EMPTY_SERVICE: PersistedService = {
  rawText: INITIAL_LYRICS,
  theme: INITIAL_THEME,
  offeringConfig: INITIAL_OFFERING,
};

export async function hydrateService(): Promise<{
  service: PersistedService;
  status: SyncStatus;
}> {
  const migrated = await migrateLegacyLocalStorage();
  const cached = migrated || (await loadCachedService());

  if (!isBrowserOnline()) {
    return { service: cached || EMPTY_SERVICE, status: "offline" };
  }

  try {
    const remote = await fetchRemoteService();
    if (remote) {
      await saveCachedService(remote);
      return { service: remote, status: "saved" };
    }
    if (cached) {
      await putRemoteService(cached);
      return { service: cached, status: "saved" };
    }
    return { service: EMPTY_SERVICE, status: "saved" };
  } catch {
    return {
      service: cached || EMPTY_SERVICE,
      status: isBrowserOnline() ? "cached" : "offline",
    };
  }
}

export function createServicePersister(onStatus: (status: SyncStatus) => void) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: PersistedService | null = null;
  let flushing = false;
  let apiDownUntil = 0;

  const flush = async () => {
    if (!pending || flushing) return;
    const payload = pending;
    pending = null;
    flushing = true;
    await saveCachedService(payload);

    if (!isBrowserOnline()) {
      onStatus("offline");
      flushing = false;
      return;
    }

    if (Date.now() < apiDownUntil) {
      onStatus("cached");
      flushing = false;
      return;
    }

    onStatus("saving");
    try {
      await putRemoteService(payload);
      apiDownUntil = 0;
      onStatus("saved");
    } catch {
      apiDownUntil = Date.now() + API_BACKOFF_MS;
      onStatus("cached");
    } finally {
      flushing = false;
      if (pending) {
        void flush();
      }
    }
  };

  const persist = (service: PersistedService) => {
    pending = service;
    void saveCachedService(service);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void flush();
    }, SAVE_DEBOUNCE_MS);
  };

  const onOnline = () => {
    apiDownUntil = 0;
    if (pending) void flush();
  };

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", () => onStatus("offline"));

  return {
    persist,
    dispose() {
      if (timer) clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    },
  };
}
