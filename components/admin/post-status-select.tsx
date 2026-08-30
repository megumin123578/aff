"use client";

import { updateArticleStatusAction } from "@/app/admin/actions";
import type { ArticleStatus } from "@/lib/content";

const statusColors: Record<ArticleStatus, string> = {
  draft: "#0369a1",
  pending: "#b45309",
  published: "#047857",
};

export function PostStatusSelect({ slug, status }: { slug: string; status: ArticleStatus }) {
  return (
    <form action={updateArticleStatusAction}>
      <input type="hidden" name="slug" value={slug} />
      <label className="sr-only" htmlFor={`status-${slug}`}>Post status</label>
      <select
        id={`status-${slug}`}
        name="status"
        defaultValue={status}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="min-w-32 cursor-pointer rounded-xl border border-slate-500 px-3 py-2 text-xs font-bold text-white outline-none transition hover:border-slate-300 focus:ring-2 focus:ring-(--color-focus)"
        style={{ backgroundColor: statusColors[status], colorScheme: "dark" }}
      >
        <option value="draft" style={{ backgroundColor: "#1e222a", color: "#e2e8f0" }}>Draft</option>
        <option value="pending" style={{ backgroundColor: "#1e222a", color: "#fde68a" }}>Pending</option>
        <option value="published" style={{ backgroundColor: "#1e222a", color: "#a7f3d0" }}>Published</option>
      </select>
    </form>
  );
}
