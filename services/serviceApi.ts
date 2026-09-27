import { PersistedService } from "./serviceTypes";

export type SyncStatus = "cached" | "saving" | "saved" | "offline";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_SECRET = import.meta.env.VITE_API_SECRET || "";

function serviceUrl() {
  return `${API_BASE}/api/service`;
}

function healthUrl() {
  return `${API_BASE}/api/health`;
}

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-API-Secret": API_SECRET,
  };
}

export async function fetchRemoteService(): Promise<PersistedService | null> {
  const res = await fetch(serviceUrl(), { headers: headers() });
  if (!res.ok) throw new Error(`GET /api/service ${res.status}`);
  const data = await res.json();
  if (!data?.service) return null;
  return {
    rawText: data.service.rawText,
    theme: data.service.theme,
    offeringConfig: data.service.offeringConfig,
  };
}

export async function putRemoteService(service: PersistedService): Promise<void> {
  const res = await fetch(serviceUrl(), {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(service),
  });
  if (!res.ok) throw new Error(`PUT /api/service ${res.status}`);
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(healthUrl());
    return res.ok;
  } catch {
    return false;
  }
}

export function isBrowserOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}
