import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { getArticle } from "@/lib/content";

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug, true);
  if (!article) notFound();
  return <div><h1 className="text-3xl font-extrabold text-white">Edit post</h1><p className="mt-2 text-sm text-slate-400">/{article.slug}</p><div className="mt-8"><ArticleForm article={article} /></div></div>;
}
