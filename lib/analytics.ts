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

export type AnalyticsKpis = {
  page_views: number;
  previous_page_views: number;
  sessions: number;
  previous_sessions: number;
  searches: number;
  previous_searches: number;
  outbound_clicks: number;
  previous_outbound_clicks: number;
};

export type AnalyticsDailyPoint = {
  date: string;
  page_views: number;
  sessions: number;
  clicks: number;
};

export type AnalyticsTopPath = {
  path: string;
  views: number;
  sessions: number;
};

export async function getAnalyticsDashboard(days = 30) {
  const safeDays = new Set([7, 30, 90]).has(days) ? days : 30;
  const [kpiResult, dailyResult, pathResult, summary] = await Promise.all([
    query<AnalyticsKpis>(
      `SELECT
         (count(*) FILTER (WHERE created_at >= now() - ($1::int * interval '1 day') AND event_name = 'page_view'))::int AS page_views,
         (count(*) FILTER (WHERE created_at < now() - ($1::int * interval '1 day') AND event_name = 'page_view'))::int AS previous_page_views,
         (count(DISTINCT NULLIF(session_id, '')) FILTER (WHERE created_at >= now() - ($1::int * interval '1 day')))::int AS sessions,
         (count(DISTINCT NULLIF(session_id, '')) FILTER (WHERE created_at < now() - ($1::int * interval '1 day')))::int AS previous_sessions,
         (count(*) FILTER (WHERE created_at >= now() - ($1::int * interval '1 day') AND event_name = 'search_performed'))::int AS searches,
         (count(*) FILTER (WHERE created_at < now() - ($1::int * interval '1 day') AND event_name = 'search_performed'))::int AS previous_searches,
         (count(*) FILTER (WHERE created_at >= now() - ($1::int * interval '1 day') AND event_name IN ('provider_clicked', 'plan_clicked')))::int AS outbound_clicks,
         (count(*) FILTER (WHERE created_at < now() - ($1::int * interval '1 day') AND event_name IN ('provider_clicked', 'plan_clicked')))::int AS previous_outbound_clicks
       FROM analytics_events
       WHERE created_at >= now() - ($1::int * interval '2 days')`,
      [safeDays],
    ),
    query<AnalyticsDailyPoint>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
         (count(*) FILTER (WHERE event_name = 'page_view'))::int AS page_views,
         (count(DISTINCT NULLIF(session_id, '')))::int AS sessions,
         (count(*) FILTER (WHERE event_name IN ('provider_clicked', 'plan_clicked')))::int AS clicks
       FROM analytics_events
       WHERE created_at >= now() - ($1::int * interval '1 day')
       GROUP BY date_trunc('day', created_at)
       ORDER BY date_trunc('day', created_at)`,
      [safeDays],
    ),
    query<AnalyticsTopPath>(
      `SELECT path, count(*)::int AS views,
         count(DISTINCT NULLIF(session_id, ''))::int AS sessions
       FROM analytics_events
       WHERE event_name = 'page_view' AND created_at >= now() - ($1::int * interval '1 day')
       GROUP BY path
       ORDER BY views DESC, path
       LIMIT 10`,
      [safeDays],
    ),
    getAnalyticsSummary(safeDays),
  ]);

  const emptyKpis: AnalyticsKpis = {
    page_views: 0,
    previous_page_views: 0,
    sessions: 0,
    previous_sessions: 0,
    searches: 0,
    previous_searches: 0,
    outbound_clicks: 0,
    previous_outbound_clicks: 0,
  };

  return {
    days: safeDays,
    kpis: kpiResult.rows[0] ?? emptyKpis,
    daily: dailyResult.rows,
    topPaths: pathResult.rows,
    summary,
  };
}

export async function getAnalyticsEventCount() {
  const result = await query<{ count: number }>("SELECT count(*)::int AS count FROM analytics_events");
  return result.rows[0]?.count ?? 0;
}
