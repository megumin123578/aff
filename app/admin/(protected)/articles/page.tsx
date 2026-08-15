import Link from "next/link";
import { Badge, Card, LinkButton } from "@/components/ui";
import { getAllArticles } from "@/lib/content";

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [articles, query] = await Promise.all([getAllArticles(), searchParams]);
  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-extrabold text-white">Articles</h1><p className="mt-2 text-sm text-slate-400">Markdown content stored in PostgreSQL.</p></div>
        <LinkButton href="/admin/articles/new" variant="azure">New article</LinkButton>
      </div>
      {query.saved && <p className="mt-5 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-soft)] p-4 text-sm text-[var(--color-success-text)]">Article saved and available immediately.</p>}
      <div className="mt-8 space-y-4">
        {articles.map((article) => (
          <Card key={article.slug} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="flex items-center gap-2"><Badge variant={article.status === "published" ? "mint" : "default"}>{article.status}</Badge><span className="text-xs text-slate-500">{article.category}</span></div><h2 className="mt-3 font-bold text-white">{article.title}</h2><p className="mt-1 text-xs text-slate-500">/{article.slug} · Updated {article.updatedAt || "—"}</p></div>
            <div className="flex gap-2"><Link href={`/admin/articles/${article.slug}/preview`} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs text-slate-300">Preview</Link><Link href={`/admin/articles/${article.slug}/edit`} className="rounded-lg bg-[var(--color-brand)] px-3 py-2 text-xs font-bold text-white">Edit</Link></div>
          </Card>
        ))}
        {articles.length === 0 && <Card className="p-6 text-sm text-slate-400">No articles yet.</Card>}
      </div>
    </div>
  );
}
