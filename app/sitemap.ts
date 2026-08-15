import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/content";
import { getProviders, getVpsPlans } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [articles, providers, plans] = await Promise.all([getPublishedArticles(), getProviders(), getVpsPlans()]);
  return [
    { url: base },
    { url: `${base}/articles` },
    { url: `${base}/providers` },
    { url: `${base}/vps-plans` },
    { url: `${base}/compare` },
    { url: `${base}/tools/vps-selector` },
    { url: `${base}/affiliate-disclosure` },
    ...articles.map((article) => ({ url: `${base}/articles/${article.slug}`, lastModified: article.updatedAt || article.publishedAt })),
    ...providers.map((provider) => ({ url: `${base}/providers/${provider.slug}` })),
    ...plans.map((plan) => ({ url: `${base}/vps-plans/${plan.slug}`, lastModified: plan.lastUpdated })),
  ];
}
