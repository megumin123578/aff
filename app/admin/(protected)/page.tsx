import Link from "next/link";
import { Card } from "@/components/ui";
import { getAffiliateClickCount, getAffiliateLinks, getAllArticles } from "@/lib/content";
import { getAnalyticsEventCount } from "@/lib/analytics";

export default async function AdminDashboardPage() {
  const [articles, links, clicks, events] = await Promise.all([
    getAllArticles(),
    getAffiliateLinks(),
    getAffiliateClickCount(),
    getAnalyticsEventCount(),
  ]);

  const publishedCount = articles.filter((article) => article.status === "published").length;
  const draftCount = articles.length - publishedCount;

  const stats = [
    [articles.length, "Total Posts", "/admin/articles"],
    [publishedCount, "Published Posts", "/admin/articles"],
    [draftCount, "Drafts", "/admin/articles"],
    [links.length, "Affiliate Links", "/admin/affiliate-links"],
    [clicks, "Tracked Clicks", "/admin/affiliate-links"],
    [events, "Analytics Events", "/admin/analytics"],
    [4, "Team Members", "/admin/users"],
  ] as const;

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-white">Content Dashboard</h1>
      <p className="mt-2 text-sm text-slate-400">Manage posts, affiliate links, and monitor engagement metrics.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([value, label, href]) => (
          <Link key={label} href={href}>
            <Card className="p-6 transition hover:border-(--color-border-strong) hover:bg-[#121722]">
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="mt-1 text-sm text-slate-400">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
