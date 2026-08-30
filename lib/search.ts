import "server-only";

import { getPublishedArticles } from "./content";

export type SearchResult = {
  kind: "guide" | "review" | "setup";
  title: string;
  description: string;
  href: string;
  meta: string;
  score: number;
};

function relevance(query: string, title: string, text: string) {
  const normalizedTitle = title.toLocaleLowerCase();
  const normalizedText = text.toLocaleLowerCase();
  if (normalizedTitle === query) return 100;
  if (normalizedTitle.startsWith(query)) return 70;
  if (normalizedTitle.includes(query)) return 50;
  if (normalizedText.includes(query)) return 20;
  return 0;
}

export async function globalSearch(rawQuery: string, limit = 30) {
  const query = rawQuery.trim().toLocaleLowerCase().slice(0, 100);
  if (query.length < 2) return [];
  const articles = await getPublishedArticles();

  const results: SearchResult[] = articles.map((article) => {
    const isReview = article.category.toLowerCase().includes("review") || article.title.toLowerCase().includes("review") || article.title.toLowerCase().includes("vs");
    const isSetup = article.category.toLowerCase().includes("setup") || article.tags.some((t) => t.toLowerCase().includes("setup"));
    const kind: SearchResult["kind"] = isReview ? "review" : isSetup ? "setup" : "guide";

    return {
      kind,
      title: article.title,
      description: article.description,
      href: `/forums/${article.slug}`,
      meta: article.category,
      score: relevance(
        query,
        article.title,
        `${article.description} ${article.category} ${article.tags.join(" ")} ${article.body}`
      ),
    };
  });

  return results
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}
