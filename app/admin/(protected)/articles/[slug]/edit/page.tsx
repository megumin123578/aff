import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/article-form";
import { getArticle } from "@/lib/content";

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug, true);
  if (!article) notFound();
  return <ArticleForm article={article} />;
}
