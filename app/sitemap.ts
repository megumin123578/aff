import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const articles = await getPublishedArticles();
  return [
    { url: base },
    { url: `${base}/articles` },
    { url: `${base}/tools/vps-selector` },
    { url: `${base}/affiliate-disclosure` },
    ...articles.map((article) => ({ url: `${base}/articles/${article.slug}`, lastModified: article.updatedAt || article.publishedAt })),
  ];
}
