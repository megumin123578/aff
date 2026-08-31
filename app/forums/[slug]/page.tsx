import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article-content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui";
import { getArticle } from "@/lib/content";
import { absoluteUrl, jsonLd, organizationJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

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
  const post = await getArticle(slug);
  if (!post) notFound();
  return (
    <main className="w-full px-5 py-12 lg:px-8 lg:py-16">
      <article className="mx-auto max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Forums", path: "/forums" }, { name: post.title, path: `/forums/${post.slug}` }]} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.description, datePublished: post.publishedAt, dateModified: post.updatedAt, image: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined, mainEntityOfPage: absoluteUrl(`/forums/${post.slug}`), author: organizationJsonLd, publisher: organizationJsonLd })} />
        <div className="mt-7"><Badge variant="azure">{post.category}</Badge></div>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-300">{post.description}</p>
        <p className="mt-5 text-xs text-slate-500">Published {post.publishedAt}</p>
        <div className="mt-8 border-t border-(--color-border) pt-8"><ArticleContent body={post.body} slug={post.slug} /></div>
      </article>
    </main>
  );
}
