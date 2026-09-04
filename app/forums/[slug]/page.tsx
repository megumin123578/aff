import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article-content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui";
import { getArticle, getPublishedArticles } from "@/lib/content";
import { absoluteUrl, jsonLd, organizationJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string) {
  return value ? dateFormatter.format(new Date(`${value}T00:00:00Z`)) : "Unpublished";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/forums/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, url: `/forums/${post.slug}`, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, images: post.coverImage ? [post.coverImage] : undefined },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, publishedArticles] = await Promise.all([getArticle(slug), getPublishedArticles()]);
  if (!post) notFound();

  const popularReads = publishedArticles.filter((article) => article.slug !== post.slug).slice(0, 3);
  const postUrl = absoluteUrl(`/forums/${post.slug}`);
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(post.title);

  return (
    <main className="w-full px-5 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 sm:grid-cols-[minmax(0,7fr)_minmax(240px,3fr)] sm:gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-16">
        <article className="min-w-0">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Forums", path: "/forums" }, { name: post.title, path: `/forums/${post.slug}` }]} />
          <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.description, datePublished: post.publishedAt, dateModified: post.updatedAt, image: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined, mainEntityOfPage: postUrl, author: organizationJsonLd, publisher: organizationJsonLd })} />
          <div className="mt-7"><Badge variant="azure">{post.category}</Badge></div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">{post.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-300">{post.description}</p>

          <div className="mt-7 flex flex-col gap-5 border-b border-(--color-border) pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-sm leading-relaxed text-slate-400">
              <p>By <span className="font-bold text-(--color-brand-light)">{post.authorName || "Neroviax Editorial"}</span></p>
              <p>{formatDate(post.publishedAt)}</p>
            </div>
            <div className="flex items-center gap-2" aria-label="Share this article">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook" className="grid size-10 place-items-center rounded-full border border-(--color-border) text-slate-300 transition hover:border-(--color-brand-border) hover:text-(--color-brand-light)">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M13.5 22v-9h3l.45-3.5H13.5V7.26c0-1.01.28-1.7 1.73-1.7H17V2.43c-.31-.04-1.37-.13-2.61-.13-2.58 0-4.35 1.58-4.35 4.48V9.5H7.12V13h2.92v9h3.46Z" /></svg>
              </a>
              <a href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noreferrer" aria-label="Share on X" className="grid size-10 place-items-center rounded-full border border-(--color-border) text-slate-300 transition hover:border-(--color-brand-border) hover:text-(--color-brand-light)">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.26-8.3L2.97 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.73L8.43 4.05H6.58L17.8 19.84Z" /></svg>
              </a>
              <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`} aria-label="Share by email" className="grid size-10 place-items-center rounded-full border border-(--color-border) text-slate-300 transition hover:border-(--color-brand-border) hover:text-(--color-brand-light)">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              </a>
            </div>
          </div>

          {post.coverImage && (
            <div
              role="img"
              aria-label={`Cover image for ${post.title}`}
              className="mt-8 aspect-video w-full rounded-2xl border border-(--color-border) bg-(--color-surface) bg-cover bg-center shadow-xl"
              style={{ backgroundImage: `url(${JSON.stringify(post.coverImage)})` }}
            />
          )}
          <div className="mt-8"><ArticleContent body={post.body} slug={post.slug} /></div>
        </article>

        <aside className="min-w-0 sm:pt-1" aria-labelledby="popular-reads-heading">
          <div className="sm:sticky sm:top-24">
            <h2 id="popular-reads-heading" className="text-2xl font-extrabold tracking-tight text-white">Popular Reads</h2>
            <div className="mt-7 space-y-7">
              {popularReads.map((article) => (
                <a key={article.slug} href={`/forums/${article.slug}`} className="group grid grid-cols-[112px_minmax(0,1fr)] gap-4">
                  <div
                    role={article.coverImage ? "img" : undefined}
                    aria-label={article.coverImage ? `Cover image for ${article.title}` : undefined}
                    className="aspect-square rounded-xl border border-(--color-border) bg-(--color-surface-muted) bg-cover bg-center"
                    style={article.coverImage ? { backgroundImage: `url(${JSON.stringify(article.coverImage)})` } : undefined}
                  />
                  <div className="min-w-0 py-1">
                    <h3 className="line-clamp-3 font-bold leading-snug text-slate-200 transition group-hover:text-(--color-brand-light)">{article.title}</h3>
                    <p className="mt-3 text-xs text-slate-500">{formatDate(article.publishedAt)}</p>
                  </div>
                </a>
              ))}
              {popularReads.length === 0 && <p className="text-sm text-slate-500">No other published articles yet.</p>}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
