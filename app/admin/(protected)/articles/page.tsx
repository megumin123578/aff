import Link from "next/link";
import { Badge, Card, LinkButton } from "@/components/ui";
import { getAllArticles } from "@/lib/content";
import { approveArticleAction } from "@/app/admin/actions";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; approved?: string; filter?: string }>;
}) {
  const [articles, query] = await Promise.all([getAllArticles(), searchParams]);

  const pendingCount = articles.filter((a) => a.status === "pending").length;
  const publishedCount = articles.filter((a) => a.status === "published").length;
  const draftCount = articles.filter((a) => a.status === "draft").length;

  const currentFilter = query.filter || "all";
  const filteredArticles = articles.filter((a) => {
    if (currentFilter === "pending") return a.status === "pending";
    if (currentFilter === "published") return a.status === "published";
    if (currentFilter === "draft") return a.status === "draft";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Articles & Submissions</h1>
          <p className="mt-2 text-sm text-slate-400">
            Review community submissions, edit drafts, and publish guides.
          </p>
        </div>
        <LinkButton href="/admin/articles/new" variant="azure">
          + New Article
        </LinkButton>
      </div>

      {query.saved && (
        <p className="rounded-xl border border-(--color-success-border) bg-(--color-success-soft) p-4 text-sm text-(--color-success-text) animate-in fade-in">
          ✔ Article saved successfully.
        </p>
      )}

      {query.approved && (
        <p className="rounded-xl border border-(--color-success-border) bg-(--color-success-soft) p-4 text-sm text-(--color-success-text) animate-in fade-in">
          ✔ Article approved and published to the live posts!
        </p>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-(--color-border) pb-3">
        <Link
          href="/admin/articles"
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            currentFilter === "all"
              ? "bg-[var(--color-brand)] text-white shadow-sm"
              : "text-slate-400 hover:bg-[var(--color-surface-muted)] hover:text-white"
          }`}
        >
          All ({articles.length})
        </Link>
        <Link
          href="/admin/articles?filter=pending"
          className={`relative rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            currentFilter === "pending"
              ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
              : "text-amber-400 hover:bg-amber-500/10"
          }`}
        >
          Pending Review ({pendingCount})
          {pendingCount > 0 && currentFilter !== "pending" && (
            <span className="ml-1.5 rounded-full bg-amber-500/30 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
              Needs Review
            </span>
          )}
        </Link>
        <Link
          href="/admin/articles?filter=published"
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            currentFilter === "published"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "text-slate-400 hover:bg-[var(--color-surface-muted)] hover:text-white"
          }`}
        >
          Published ({publishedCount})
        </Link>
        <Link
          href="/admin/articles?filter=draft"
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
            currentFilter === "draft"
              ? "bg-slate-700 text-white font-bold shadow-sm"
              : "text-slate-400 hover:bg-[var(--color-surface-muted)] hover:text-white"
          }`}
        >
          Drafts ({draftCount})
        </Link>
      </div>

      {/* Article List */}
      <div className="space-y-4">
        {filteredArticles.map((article) => {
          const isPending = article.status === "pending";
          const isPublished = article.status === "published";

          return (
            <Card
              key={article.slug}
              className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition ${
                isPending ? "border-amber-500/40 bg-amber-950/10" : ""
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {isPublished && <Badge variant="mint">Published</Badge>}
                  {isPending && (
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      Pending Approval
                    </span>
                  )}
                  {article.status === "draft" && <Badge variant="default">Draft</Badge>}
                  <span className="text-xs text-slate-400">{article.category}</span>
                  {article.authorName && (
                    <span className="text-xs text-slate-400">
                      · by <strong className="text-slate-200">{article.authorName}</strong>
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-white leading-snug">
                  {article.title}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  /{article.slug} · Updated {article.updatedAt || "—"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isPending && (
                  <form action={approveArticleAction}>
                    <input type="hidden" name="slug" value={article.slug} />
                    <button
                      type="submit"
                      className="rounded-xl border border-emerald-500/50 bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
                    >
                      ✓ Approve & Publish
                    </button>
                  </form>
                )}

                <Link
                  href={`/admin/articles/${article.slug}/preview`}
                  className="rounded-xl border border-(--color-border) bg-[var(--color-surface)] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-[var(--color-border-strong)] hover:text-white"
                >
                  Preview
                </Link>
                <Link
                  href={`/admin/articles/${article.slug}/edit`}
                  className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[var(--color-brand-hover)]"
                >
                  Edit
                </Link>
              </div>
            </Card>
          );
        })}

        {filteredArticles.length === 0 && (
          <Card className="p-8 text-center text-sm text-slate-400">
            No articles found matching this filter.
          </Card>
        )}
      </div>
    </div>
  );
}
