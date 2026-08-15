"use client";

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

function sessionId() {
  try {
    const key = "neroviax_analytics_session";
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(key, created);
    return created;
  } catch {
    return "";
  }
}

export function trackEvent(eventName: string, properties: AnalyticsProperties = {}) {
  const cleanProperties = Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined));
  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ eventName, path: `${window.location.pathname}${window.location.search}`, sessionId: sessionId(), properties: cleanProperties }),
    keepalive: true,
  }).catch(() => undefined);
}

