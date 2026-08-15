import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article-content";
import { Badge } from "@/components/ui";
import { getArticle } from "@/lib/content";

export default async function PreviewArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug, true);
  if (!article) notFound();
  return <article className="mx-auto max-w-3xl"><div className="flex items-center justify-between gap-4"><Link href={`/admin/articles/${slug}/edit`} className="text-sm text-slate-400">← Back to editor</Link><Badge variant={article.status === "published" ? "mint" : "default"}>{article.status} preview</Badge></div><h1 className="mt-8 text-4xl font-extrabold leading-tight text-white">{article.title}</h1><p className="mt-4 text-lg text-slate-300">{article.description}</p><div className="mt-8 border-t border-[var(--color-border)] pt-8"><ArticleContent body={article.body} slug={article.slug} /></div></article>;
}
