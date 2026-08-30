"use client";

import { useRef } from "react";
import { updateArticleStatusAction } from "@/app/admin/actions";
import type { ArticleStatus } from "@/lib/content";

export function PostStatusSelect({ slug, status }: { slug: string; status: ArticleStatus }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateArticleStatusAction}>
      <input type="hidden" name="slug" value={slug} />
      <label className="sr-only" htmlFor={`status-${slug}`}>Post status</label>
      <select
        id={`status-${slug}`}
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-xl border border-(--color-border) bg-(--color-surface) px-2.5 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-(--color-brand-border)"
      >
        <option value="draft" style={{ backgroundColor: "var(--color-surface)", color: "#e2e8f0" }}>Draft</option>
        <option value="pending" style={{ backgroundColor: "var(--color-surface)", color: "#e2e8f0" }}>Pending</option>
        <option value="published" style={{ backgroundColor: "var(--color-surface)", color: "#e2e8f0" }}>Published</option>
      </select>
    </form>
  );
}
