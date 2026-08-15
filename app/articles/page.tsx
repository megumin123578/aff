import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { getPublishedArticles } from "@/lib/content";
import { absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Infrastructure Guides",
  description: "Practical VPS, Docker, self-hosting, and server operations guides.",
  alternates: { canonical: "/articles" },
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@context": "https://schema.org", "@type": "ItemList", itemListElement: articles.map((article, index) => ({ "@type": "ListItem", position: index + 1, name: article.title, url: absoluteUrl(`/articles/${article.slug}`) })) })} />
      <div className="w-full">
        <Badge variant="azure">Field guides</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white">Practical infrastructure notes</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Reproducible guidance for sizing, deploying, and operating small server workloads.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`} className="rounded-2xl">
              <Card className="flex h-full flex-col p-6 transition hover:border-[var(--color-border-strong)]">
                <p className="font-mono text-xs font-semibold text-[var(--color-brand-light)]">{article.category}</p>
                <h2 className="mt-4 text-xl font-bold leading-snug text-white">{article.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{article.description}</p>
                <p className="mt-auto pt-6 text-xs text-slate-500">{article.publishedAt} · Read guide →</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
