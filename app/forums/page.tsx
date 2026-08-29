import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { getPublishedArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Forums",
  description: "Browse articles and join discussions from the Neroviax community.",
  alternates: { canonical: "/forums" },
};

export const dynamic = "force-dynamic";

export default async function ForumsPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <Badge variant="azure">Community</Badge>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Forums</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Browse the latest articles, ideas, and discussions from the Neroviax community.
            </p>
          </div>
          <Link
            href="/submit-article"
            className="inline-flex w-fit rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-brand-hover)]"
          >
            Start a discussion
          </Link>
        </div>

        <div className="mt-10 space-y-3">
          {articles.map((article) => (
            <Link key={article.slug} href={`/posts/${article.slug}`} className="group block rounded-2xl">
              <Card className="p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--color-brand-border)] group-hover:bg-[#121722] sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-soft)] text-sm font-extrabold text-[var(--color-brand-light)]">
                    {(article.authorName || "N").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="font-semibold text-[var(--color-brand-light)]">{article.category}</span>
                      <span>{article.authorName || "Neroviax Editorial"}</span>
                      <span>{article.publishedAt}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-[var(--color-brand-light)] sm:text-xl">
                      {article.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
                      {article.description}
                    </p>
                  </div>
                  <span aria-hidden="true" className="hidden self-center text-xl text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-[var(--color-brand-light)] sm:block">→</span>
                </div>
              </Card>
            </Link>
          ))}

          {articles.length === 0 && (
            <Card className="p-12 text-center">
              <h2 className="text-lg font-bold text-white">No discussions yet</h2>
              <p className="mt-2 text-sm text-slate-400">Publish the first article to start a conversation.</p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
