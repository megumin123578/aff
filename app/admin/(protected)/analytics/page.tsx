import { Card } from "@/components/ui";
import { getAnalyticsSummary } from "@/lib/analytics";

const labels: Record<string, string> = {
  page_view: "Page views", selector_started: "Selector starts", selector_completed: "Selector completions",
  recommendation_impression: "Recommendation impressions", comparison_started: "Comparison starts",
  recommendation_saved: "Recommendations saved",
  comparison_updated: "Comparison updates", comparison_link_copied: "Comparison links copied",
  filter_used: "Plan filters used", search_performed: "Searches", provider_clicked: "Provider clicks",
  plan_clicked: "Plan clicks", guide_clicked: "Guide clicks", guide_to_selector: "Guide → Selector visits",
};

export default async function AdminAnalyticsPage() {
  const summary = await getAnalyticsSummary(30);
  return <div><h1 className="text-3xl font-extrabold text-white">Product analytics</h1><p className="mt-2 text-sm text-slate-400">First-party events from the last 30 days. No IP addresses or personal profiles are stored.</p><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{summary.map((item) => <Card key={item.event_name} className="p-6"><p className="text-3xl font-extrabold text-white">{item.count}</p><p className="mt-2 text-sm text-slate-400">{labels[item.event_name] || item.event_name}</p></Card>)}{summary.length === 0 && <Card className="p-6 text-sm text-slate-400">No analytics events recorded yet.</Card>}</div></div>;
}
