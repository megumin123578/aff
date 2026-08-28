import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article-content";
import { Badge } from "@/components/ui";
import { getArticle } from "@/lib/content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CommentSection } from "@/components/comment-section";
import { getAuthSession } from "@/lib/admin-auth";
import { absoluteUrl, jsonLd, organizationJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: { type: "article", title: article.title, description: article.description, url: `/articles/${article.slug}`, publishedTime: article.publishedAt, modifiedTime: article.updatedAt, images: article.coverImage ? [article.coverImage] : undefined },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: article.coverImage ? [article.coverImage] : undefined },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, session] = await Promise.all([
    getArticle(slug),
    getAuthSession(),
  ]);
  if (!article) notFound();

  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-14 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/articles" }, { name: article.title, path: `/articles/${article.slug}` }]} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, datePublished: article.publishedAt, dateModified: article.updatedAt, image: article.coverImage ? [absoluteUrl(article.coverImage)] : undefined, mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`), author: organizationJsonLd, publisher: organizationJsonLd })} />
        
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

        {/* Community & Advice Callout */}
        <div className="mt-12 rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-soft)] p-6">
          <h2 className="text-xl font-bold text-white">Need setup advice or have a question?</h2>
          <p className="mt-2 text-sm text-slate-300">
            Tell us your budget, workspace constraints, or hardware questions below. We regularly answer questions and help tune your setup.
          </p>
          <a href="#comments" className="mt-5 inline-flex rounded-xl bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white">
            Join the Discussion ↓
          </a>
        </div>

        {/* Comments Section */}
        <CommentSection slug={article.slug} title={article.title} session={session} />
      </article>
    </main>
  );
}
