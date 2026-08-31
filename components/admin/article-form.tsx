"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveArticleAction } from "@/app/admin/actions";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { Article } from "@/lib/content";

const fieldClass = "mt-2 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-3 text-sm text-white outline-none focus:border-(--color-brand-border)";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-300";

export function ArticleForm({ article }: { article?: Article }) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dirty, setDirty] = useState(false);

  const uploadCoverImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: data });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Image upload failed");
      setCoverImage(result.url);
      setDirty(true);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <form action={saveArticleAction} onChange={() => setDirty(true)} className="article-editor-layout grid min-w-0 items-start gap-6">
      <div className="min-w-0 space-y-6">
        <div className="grid gap-5 @min-[640px]:grid-cols-2">
          <label className={labelClass}>Title<input required name="title" value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} /></label>
          <label className={labelClass}>Slug<input required readOnly={Boolean(article)} name="slug" defaultValue={article?.slug} placeholder="mac-mini-m4-homelab-setup" className={`${fieldClass} read-only:cursor-not-allowed read-only:opacity-60`} /></label>
          <label className={`${labelClass} @min-[640px]:col-span-2`}>Description<textarea required name="description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className={fieldClass} /></label>
          <label className={labelClass}>Category<input name="category" defaultValue={article?.category || "Desk Setup"} className={fieldClass} /></label>
          <label className={labelClass}>
            Status
            <select name="status" defaultValue={article?.status || "draft"} className={fieldClass}>
              <option value="draft">Draft</option>
              <option value="pending">Pending Approval</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className={labelClass}>Published date<input type="date" name="publishedAt" defaultValue={article?.publishedAt} className={fieldClass} /></label>
          <div className="@min-[640px]:col-span-2">
            <span className={labelClass}>Cover image</span>
            <input type="hidden" name="coverImage" value={coverImage} />
            <div className="mt-2 flex flex-col gap-3 rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-bg) p-4 @min-[640px]:flex-row @min-[640px]:items-center">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-(--color-action) px-4 py-2.5 text-sm font-bold text-white transition hover:bg-(--color-action-hover)">
                {uploading ? "Uploading…" : coverImage ? "Replace image" : "Upload from computer"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={uploadCoverImage} className="sr-only" />
              </label>
              <p className="text-xs text-slate-500">JPEG, PNG, WebP or GIF · maximum 8 MB</p>
              {coverImage && <button type="button" onClick={() => { setCoverImage(""); setDirty(true); }} className="text-xs font-semibold text-rose-400 hover:text-rose-300 @min-[640px]:ml-auto">Remove</button>}
            </div>
            {uploadError && <p className="mt-2 text-xs font-semibold text-rose-400">{uploadError}</p>}
          </div>
          {article?.authorName && (
            <div className="@min-[640px]:col-span-2 rounded-xl border border-(--color-border) bg-(--color-surface) p-3 text-xs text-slate-300">
              <span>Submitted by: <strong className="text-white">{article.authorName}</strong> ({article.authorEmail || "No email"})</span>
              <input type="hidden" name="authorName" value={article.authorName} />
              <input type="hidden" name="authorEmail" value={article.authorEmail || ""} />
              <input type="hidden" name="authorAvatar" value={article.authorAvatar || ""} />
            </div>
          )}
        </div>

        {article?.affiliateIds.map((id) => <input key={id} type="hidden" name="affiliateIds" value={id} />)}

        <div>
          <label htmlFor="article-body" className={labelClass}>Article body</label>
          <RichTextEditor value={body} onChangeAction={(value) => { setBody(value); setDirty(true); }} />
          <p className="mt-2 text-xs text-slate-500">Format text with the toolbar. Content remains compatible with existing posts.</p>
        </div>

        <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--color-border) bg-(--color-surface)/95 p-3 shadow-xl backdrop-blur-xl">
          <span className={`flex items-center gap-2 text-xs font-semibold ${dirty ? "text-amber-300" : "text-slate-400"}`}>
            <span className={`size-2 rounded-full ${dirty ? "bg-amber-400" : "bg-emerald-400"}`} />
            {dirty ? "Unsaved changes" : article ? "All changes saved" : "Ready to save"}
          </span>
          <div className="flex items-center gap-2">
            {article && <a href={`/admin/articles/${article.slug}/preview`} className="rounded-lg border border-(--color-border-strong) bg-(--color-action) px-4 py-2.5 text-xs font-bold text-white hover:bg-(--color-action-hover)">Preview</a>}
            <button disabled={uploading} className="rounded-lg border border-(--color-brand-border) bg-(--color-brand) px-4 py-2.5 text-xs font-bold text-white hover:bg-(--color-brand-hover) disabled:cursor-wait disabled:opacity-60">Save post</button>
          </div>
        </div>
      </div>

      <aside className="article-editor-preview min-w-0">
        <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-[#10151d] shadow-xl">
          <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-300">Live preview</p><span className="size-2 rounded-full bg-emerald-400" /></div>
          {coverImage && (
            <div
              role="img"
              aria-label="Cover preview"
              className="aspect-[16/9] w-full bg-(--color-bg) bg-cover bg-center"
              style={{ backgroundImage: `url(${JSON.stringify(coverImage)})` }}
            />
          )}
          <article className="max-h-[calc(100dvh-11rem)] overflow-y-auto p-6">
            <h1 className="text-3xl font-extrabold leading-tight text-white">{title || "Untitled post"}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{description || "The article description will appear here."}</p>
            <div className="article-content mt-6 border-t border-(--color-border) pt-6">
              {body ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown> : <p className="text-slate-500">Start writing to see a live preview.</p>}
            </div>
          </article>
        </div>
      </aside>
    </form>
  );
}
