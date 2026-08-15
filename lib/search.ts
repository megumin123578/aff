import "server-only";

import { getProviders, getVpsPlans } from "./catalog";
import { getPublishedArticles } from "./content";

export type SearchResult = { kind: "provider" | "plan" | "guide"; title: string; description: string; href: string; meta: string; score: number };

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
  const [providers, plans, articles] = await Promise.all([getProviders(), getVpsPlans(), getPublishedArticles()]);
  const results: SearchResult[] = [
    ...providers.map((provider) => ({ kind: "provider" as const, title: provider.name, description: provider.description, href: `/providers/${provider.slug}`, meta: `${provider.locations.length} locations`, score: relevance(query, provider.name, `${provider.description} ${provider.features.join(" ")} ${provider.bestUseCases.join(" ")}`) })),
    ...plans.map((plan) => ({ kind: "plan" as const, title: `${plan.providerName} ${plan.name}`, description: `${plan.cpu} vCPU, ${plan.ram} GB RAM, ${plan.storage} GB ${plan.storageType}, $${plan.priceMonthly}/month`, href: `/vps-plans/${plan.slug}`, meta: `${plan.transferTb ?? "Unmetered"} TB transfer`, score: relevance(query, `${plan.providerName} ${plan.name}`, `${plan.note} ${plan.architecture} ${plan.storageType}`) })),
    ...articles.map((article) => ({ kind: "guide" as const, title: article.title, description: article.description, href: `/articles/${article.slug}`, meta: article.category, score: relevance(query, article.title, `${article.description} ${article.category} ${article.tags.join(" ")}`) })),
  ];
  return results.filter((result) => result.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

