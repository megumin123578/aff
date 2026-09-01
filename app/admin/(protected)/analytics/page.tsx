import Link from "next/link";
import { Card } from "@/components/ui";
import { getAnalyticsDashboard, type AnalyticsDailyPoint } from "@/lib/analytics";

const labels: Record<string, string> = {
  page_view: "Page views",
  selector_started: "Selector starts",
  selector_completed: "Selector completions",
  recommendation_impression: "Recommendation impressions",
  comparison_started: "Comparison starts",
  recommendation_saved: "Recommendations saved",
  comparison_updated: "Comparison updates",
  comparison_link_copied: "Comparison links copied",
  filter_used: "Plan filters used",
  search_performed: "Searches",
  provider_clicked: "Provider clicks",
  plan_clicked: "Plan clicks",
  guide_clicked: "Guide clicks",
  guide_to_selector: "Guide → Selector visits",
};

const funnelEvents = [
  ["selector_started", "Selector started"],
  ["selector_completed", "Selector completed"],
  ["recommendation_impression", "Recommendation viewed"],
  ["provider_clicked", "Provider clicked"],
  ["plan_clicked", "Plan clicked"],
] as const;

const numberFormatter = new Intl.NumberFormat("en-US");

function Change({ current, previous }: { current: number; previous: number }) {
  const change = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
  const color = change > 0 ? "text-emerald-400" : change < 0 ? "text-rose-400" : "text-slate-500";
  const sign = change > 0 ? "+" : "";
  return <span className={color}>{sign}{change.toFixed(1)}% vs previous period</span>;
}

function TrendChart({ points }: { points: AnalyticsDailyPoint[] }) {
  if (points.length === 0) return <div className="grid h-64 place-items-center text-sm text-slate-500">No traffic recorded for this period.</div>;

  const width = 720;
  const height = 240;
  const horizontalPadding = 16;
  const top = 18;
  const bottom = 205;
  const maximum = Math.max(1, ...points.flatMap((point) => [point.page_views, point.sessions, point.clicks]));
  const coordinates = (key: "page_views" | "sessions" | "clicks") => points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : horizontalPadding + (index / (points.length - 1)) * (width - horizontalPadding * 2);
    const y = bottom - (point[key] / maximum) * (bottom - top);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs font-semibold">
        <span className="flex items-center gap-2 text-(--color-brand-light)"><span className="size-2 rounded-full bg-(--color-brand-light)" />Page views</span>
        <span className="flex items-center gap-2 text-emerald-400"><span className="size-2 rounded-full bg-emerald-400" />Sessions</span>
        <span className="flex items-center gap-2 text-amber-400"><span className="size-2 rounded-full bg-amber-400" />Clicks</span>
      </div>
      <svg role="img" aria-label="Traffic trend" viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = bottom - ratio * (bottom - top);
          return <line key={ratio} x1={horizontalPadding} x2={width - horizontalPadding} y1={y} y2={y} stroke="currentColor" className="text-slate-700" strokeWidth="1" />;
        })}
        <polyline points={coordinates("page_views")} fill="none" stroke="var(--color-brand-light)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={coordinates("sessions")} fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={coordinates("clicks")} fill="none" stroke="var(--color-warning)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <text x={horizontalPadding} y={232} fill="currentColor" className="text-[11px] text-slate-500">{points[0]?.date}</text>
        <text x={width - horizontalPadding} y={232} textAnchor="end" fill="currentColor" className="text-[11px] text-slate-500">{points.at(-1)?.date}</text>
      </svg>
    </div>
  );
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const query = await searchParams;
  const requestedDays = Number(query.days || 7);
  const dashboard = await getAnalyticsDashboard(requestedDays);
  const { days, kpis, daily, topPaths, summary } = dashboard;
  const counts = new Map(summary.map((item) => [item.event_name, item.count]));
  const funnelBase = counts.get("selector_started") ?? 0;
  const activity = summary.filter((item) => item.event_name !== "page_view");
  const cards = [
    ["Page views", kpis.page_views, kpis.previous_page_views],
    ["Sessions", kpis.sessions, kpis.previous_sessions],
    ["Searches", kpis.searches, kpis.previous_searches],
    ["Outbound clicks", kpis.outbound_clicks, kpis.previous_outbound_clicks],
  ] as const;

  return (
    <div>
      <div className="flex flex-col gap-4 @min-[640px]:flex-row @min-[640px]:items-end @min-[640px]:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Analytics</h1>
        </div>
        <div className="flex w-fit rounded-xl border border-(--color-border) bg-(--color-surface) p-1">
          {[7, 30, 90].map((range) => (
            <Link key={range} href={`/admin/analytics?days=${range}`} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${days === range ? "bg-(--color-brand) text-white" : "text-slate-400 hover:text-white"}`}>
              {range} days
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4">
        {cards.map(([label, current, previous]) => (
          <Card key={label} className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-extrabold text-white">{numberFormatter.format(current)}</p>
            <p className="mt-2 text-[11px] font-semibold"><Change current={current} previous={previous} /></p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 @min-[1024px]:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.75fr)]">
        <Card className="min-w-0 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Traffic trend</h2>
            <p className="mt-1 text-xs text-slate-500">Daily activity over the last {days} days</p>
          </div>
          <TrendChart points={daily} />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-white">Conversion funnel</h2>
          <p className="mt-1 text-xs text-slate-500">Selector journey completion</p>
          <div className="mt-6 space-y-5">
            {funnelEvents.map(([eventName, label]) => {
              const count = counts.get(eventName) ?? 0;
              const percentage = funnelBase > 0 ? (count / funnelBase) * 100 : 0;
              return (
                <div key={eventName}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-300">{label}</span>
                    <span className="font-mono text-slate-500">{numberFormatter.format(count)} · {percentage.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--color-surface-muted)">
                    <div className="h-full rounded-full bg-(--color-brand)" style={{ width: `${Math.min(100, percentage)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 @min-[1024px]:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-(--color-border) px-6 py-5">
            <h2 className="text-lg font-bold text-white">Top pages</h2>
            <p className="mt-1 text-xs text-slate-500">Most viewed paths in this period</p>
          </div>
          {topPaths.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-(--color-surface-muted) text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-3">Path</th><th className="px-6 py-3 text-right">Views</th><th className="px-6 py-3 text-right">Sessions</th></tr></thead>
                <tbody className="divide-y divide-(--color-border)">
                  {topPaths.map((item) => <tr key={item.path}><td className="max-w-xs truncate px-6 py-3 font-mono text-xs text-slate-300">{item.path}</td><td className="px-6 py-3 text-right font-semibold text-white">{numberFormatter.format(item.views)}</td><td className="px-6 py-3 text-right text-slate-400">{numberFormatter.format(item.sessions)}</td></tr>)}
                </tbody>
              </table>
            </div>
          ) : <p className="p-6 text-sm text-slate-500">No page views recorded yet.</p>}
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-(--color-border) px-6 py-5">
            <h2 className="text-lg font-bold text-white">Activity breakdown</h2>
            <p className="mt-1 text-xs text-slate-500">Tracked product interactions</p>
          </div>
          {activity.length > 0 ? (
            <div className="divide-y divide-(--color-border)">
              {activity.map((item) => <div key={item.event_name} className="flex items-center justify-between gap-4 px-6 py-3.5"><span className="text-sm text-slate-300">{labels[item.event_name] || item.event_name}</span><span className="font-mono text-sm font-bold text-white">{numberFormatter.format(item.count)}</span></div>)}
            </div>
          ) : <p className="p-6 text-sm text-slate-500">No product activity recorded yet.</p>}
        </Card>
      </div>
    </div>
  );
}
