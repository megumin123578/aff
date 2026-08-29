import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://neroviax.com").replace(/\/$/, "");
  const articles = await getPublishedArticles();

  return [
    { url: base },
    { url: `${base}/posts` },
    { url: `${base}/affiliate-disclosure` },
    ...["about", "contact", "methodology", "privacy", "terms"].map((path) => ({ url: `${base}/${path}` })),
    ...articles.map((article) => ({
      url: `${base}/posts/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt,
    })),
  ];
}
