import { saveArticleAction } from "@/app/admin/actions";
import type { AffiliateLink, Article } from "@/lib/content";

const fieldClass = "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-brand-border)]";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-300";

export function ArticleForm({ article, affiliateLinks }: { article?: Article; affiliateLinks: AffiliateLink[] }) {
  return (
    <form action={saveArticleAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>Title<input required name="title" defaultValue={article?.title} className={fieldClass} /></label>
        <label className={labelClass}>Slug<input required readOnly={Boolean(article)} name="slug" defaultValue={article?.slug} placeholder="mac-mini-m4-homelab-setup" className={`${fieldClass} read-only:cursor-not-allowed read-only:opacity-60`} /></label>
        <label className={`${labelClass} sm:col-span-2`}>Description<textarea required name="description" defaultValue={article?.description} rows={3} className={fieldClass} /></label>
        <label className={labelClass}>Category<input name="category" defaultValue={article?.category || "Desk Setup"} className={fieldClass} /></label>
        <label className={labelClass}>Tags, comma separated<input name="tags" defaultValue={article?.tags.join(", ")} className={fieldClass} /></label>
        <label className={labelClass}>
          Status
          <select name="status" defaultValue={article?.status || "draft"} className={fieldClass}>
            <option value="draft">Draft</option>
            <option value="pending">Pending Approval</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className={labelClass}>Published date<input type="date" name="publishedAt" defaultValue={article?.publishedAt} className={fieldClass} /></label>
        <label className={`${labelClass} sm:col-span-2`}>Cover image URL<input type="url" name="coverImage" defaultValue={article?.coverImage} className={fieldClass} /></label>
        {article?.authorName && (
          <div className="sm:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs text-slate-300">
            <span>Submitted by: <strong className="text-white">{article.authorName}</strong> ({article.authorEmail || "No email"})</span>
            <input type="hidden" name="authorName" value={article.authorName} />
            <input type="hidden" name="authorEmail" value={article.authorEmail || ""} />
            <input type="hidden" name="authorAvatar" value={article.authorAvatar || ""} />
          </div>
        )}
      </div>

      <fieldset className="rounded-xl border border-[var(--color-border)] p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-300">Available affiliate references</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {affiliateLinks.map((link) => (
            <label key={link.id} className="flex items-start gap-3 text-sm text-slate-300">
              <input type="checkbox" name="affiliateIds" value={link.id} defaultChecked={article?.affiliateIds.includes(link.id)} className="mt-1 accent-[var(--color-brand)]" />
              <span><strong className="text-white">{link.provider}</strong><br /><code className="text-xs text-slate-500">{`{{affiliate:${link.id}|Button label}}`}</code></span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={labelClass}>Markdown body<textarea required name="body" defaultValue={article?.body} rows={24} className={`${fieldClass} font-mono leading-6`} /></label>
      <div className="flex flex-wrap gap-3">
        <button className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--color-brand-hover)]">Save article</button>
        {article && <a href={`/admin/articles/${article.slug}/preview`} className="rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-action)] px-5 py-3 text-sm font-bold text-white">Preview current version</a>}
      </div>
    </form>
  );
}
