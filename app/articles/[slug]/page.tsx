import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article-content";
import { Badge } from "@/components/ui";
import { getArticle } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} | Neroviax`,
    description: article.description,
    alternates: { canonical: `/articles/${article.slug}` },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-14 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <Link href="/articles" className="text-sm text-slate-400 hover:text-white">← All guides</Link>
        <div className="mt-7"><Badge variant="azure">{article.category}</Badge></div>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">{article.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-300">{article.description}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
          <span>Published {article.publishedAt}</span>
          {article.tags.map((tag) => <span key={tag}>· {tag}</span>)}
        </div>
        <div className="mt-10 border-t border-[var(--color-border)] pt-8">
          <ArticleContent body={article.body} slug={article.slug} />
        </div>
        <div className="mt-12 rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-soft)] p-6"><h2 className="text-xl font-bold text-white">Turn this guide into a VPS baseline</h2><p className="mt-2 text-sm text-slate-300">Use the selector to estimate resources and find catalog plans that match your region and budget.</p><Link href={`/tools/vps-selector?source=guide&article=${article.slug}`} className="mt-5 inline-flex rounded-xl bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white">Open VPS Selector →</Link></div>
      </article>
    </main>
  );
}
