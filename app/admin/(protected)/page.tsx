import Link from "next/link";
import { Card } from "@/components/ui";
import { getAffiliateClickCount, getAffiliateLinks, getAllArticles } from "@/lib/content";
import { getProviders, getVpsPlans } from "@/lib/catalog";
import { getAnalyticsEventCount } from "@/lib/analytics";
import { getSavedRecommendationCount } from "@/lib/recommendations";

export default async function AdminDashboardPage() {
  const [articles, links, clicks, providers, plans, events, recommendations] = await Promise.all([
    getAllArticles(), getAffiliateLinks(), getAffiliateClickCount(), getProviders(true), getVpsPlans({ includeUnavailable: true }), getAnalyticsEventCount(), getSavedRecommendationCount(),
  ]);
  const stats = [
    [articles.length, "Articles", "/admin/articles"],
    [articles.filter((article) => article.status === "published").length, "Published", "/admin/articles"],
    [links.length, "Affiliate links", "/admin/affiliate-links"],
    [clicks, "Tracked clicks", "/admin/affiliate-links"],
    [providers.length, "Providers", "/admin/providers"],
    [plans.length, "VPS plans", "/admin/vps-plans"],
    [events, "Analytics events", "/admin/analytics"],
    [recommendations, "Saved recommendations", "/admin/analytics"],
  ] as const;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-white">Content dashboard</h1>
      <p className="mt-2 text-sm text-slate-400">Manage Git-backed content without editing source files manually.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([value, label, href]) => (
          <Link key={label} href={href}>
            <Card className="p-6 transition hover:border-[var(--color-border-strong)]">
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="mt-1 text-sm text-slate-400">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
