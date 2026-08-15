import "server-only";

import { query } from "./db";

export const ANALYTICS_EVENTS = new Set([
  "page_view",
  "selector_started",
  "selector_completed",
  "recommendation_impression",
  "recommendation_saved",
  "comparison_started",
  "comparison_updated",
  "comparison_link_copied",
  "filter_used",
  "search_performed",
  "provider_clicked",
  "plan_clicked",
  "guide_clicked",
  "guide_to_selector",
]);

export async function recordAnalyticsEvent(input: {
  eventName: string;
  path: string;
  sessionId: string;
  properties: Record<string, string | number | boolean | null>;
}) {
  if (!ANALYTICS_EVENTS.has(input.eventName)) throw new Error("Unsupported analytics event");
  await query(
    `INSERT INTO analytics_events (event_name, path, session_id, properties)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [input.eventName, input.path.slice(0, 500), input.sessionId.slice(0, 64), JSON.stringify(input.properties)],
  );
}

export async function getAnalyticsSummary(days = 30) {
  const result = await query<{ event_name: string; count: number }>(
    `SELECT event_name, count(*)::int AS count FROM analytics_events
     WHERE created_at >= now() - ($1::int * interval '1 day')
     GROUP BY event_name ORDER BY count DESC, event_name`,
    [days],
  );
  return result.rows;
}

export async function getAnalyticsEventCount() {
  const result = await query<{ count: number }>("SELECT count(*)::int AS count FROM analytics_events");
  return result.rows[0]?.count ?? 0;
}
