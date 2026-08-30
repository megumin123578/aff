import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { getAllArticles } from "@/lib/content";
import { approveArticleAction, deleteArticleAction } from "@/app/admin/actions";
import { PostStatusSelect } from "@/components/admin/post-status-select";
import { StatusToast } from "@/components/admin/status-toast";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; approved?: string; updated?: string; deleted?: string; filter?: string }>;
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

      {query.saved && (
        <p className="rounded-xl border border-(--color-success-border) bg-(--color-success-soft) p-4 text-sm text-(--color-success-text) animate-in fade-in">
          ✔ Post saved successfully.
        </p>
      )}

      {query.approved && (
        <p className="rounded-xl border border-(--color-success-border) bg-(--color-success-soft) p-4 text-sm text-(--color-success-text) animate-in fade-in">
          ✔ Post approved and published to the live forums!
        </p>
      )}

      {query.updated && <StatusToast message="Post status updated successfully." />}

      {query.deleted && (
        <p className="rounded-xl border border-(--color-success-border) bg-(--color-success-soft) p-4 text-sm text-(--color-success-text) animate-in fade-in">
          ✔ Post deleted successfully.
        </p>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-(--color-border) pb-3">
        <div className="flex flex-wrap gap-2">
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

        <div className="ml-auto">
          <LinkButton href="/admin/articles/new" variant="azure">
            + New Post
          </LinkButton>
        </div>
      </div>

      {/* Article List */}
      <div className="space-y-4">
        {filteredArticles.map((article) => {
          const isPending = article.status === "pending";

          return (
            <Card
              key={article.slug}
              className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition ${
                isPending ? "border-amber-500/40 bg-amber-950/10" : ""
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">

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
                <PostStatusSelect slug={article.slug} status={article.status} />

                {isPending && (
                  <form action={approveArticleAction}>
                    <input type="hidden" name="slug" value={article.slug} />
                    <button
                      type="submit"
                      className="rounded-xl border border-emerald-500/50 bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
                    >
                      ✓ Approve
                    </button>
                  </form>
                )}

                <Link
                  href={`/admin/articles/${article.slug}/preview`}
                  aria-label={`Preview ${article.title}`}
                  title="Preview post"
                  className="grid size-9 place-items-center rounded-xl border border-(--color-border) bg-(--color-surface) text-slate-300 transition hover:border-(--color-border-strong) hover:text-white focus:outline-none focus:ring-2 focus:ring-(--color-focus)"
                >
                  <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12 18 19.5 12 19.5 2.25 12 2.25 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Link>
                <Link
                  href={`/admin/articles/${article.slug}/edit`}
                  aria-label={`Edit ${article.title}`}
                  title="Edit post"
                  className="grid size-9 place-items-center rounded-xl border border-(--color-brand-border) bg-(--color-brand) text-white transition hover:bg-(--color-brand-hover) focus:outline-none focus:ring-2 focus:ring-(--color-focus)"
                >
                  <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 3.487 3.651 3.651M4.5 19.5l3.169-.792a4.5 4.5 0 0 0 2.168-1.195L19.5 7.5a2.582 2.582 0 0 0-3.651-3.651L6.187 13.513a4.5 4.5 0 0 0-1.195 2.168L4.5 19.5Z" />
                  </svg>
                </Link>
                <form action={deleteArticleAction}>
                  <input type="hidden" name="slug" value={article.slug} />
                  <button
                    type="submit"
                    aria-label={`Delete ${article.title}`}
                    title="Delete post"
                    className="grid size-9 place-items-center rounded-xl border border-rose-500/40 text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9 14.394 18m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-1.327L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.14-2.09-2.18a51.964 51.964 0 0 0-3.32 0c-1.18.04-2.09 1-2.09 2.18v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </form>
              </div>
            </Card>
          );
        })}

        {filteredArticles.length === 0 && (
          <Card className="p-8 text-center text-sm text-slate-400">
            No posts found matching this filter.
          </Card>
        )}
      </div>
    </div>
  );
}
