"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveArticleAction } from "@/app/admin/actions";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { Article } from "@/lib/content";

const fieldClass = "mt-2 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-3 text-sm text-white outline-none focus:border-(--color-brand-border)";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-300";

type EditorTab = "basic" | "editor";

export function ArticleForm({ article }: { article?: Article }) {
  const [activeTab, setActiveTab] = useState<EditorTab>("basic");
  const [title, setTitle] = useState(article?.title ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <form
      action={saveArticleAction}
      onInvalidCapture={(event) => setActiveTab(event.currentTarget.elements.namedItem("body") === event.target ? "editor" : "basic")}
      className="min-w-0 space-y-6"
    >
      <div className="ml-auto flex w-fit rounded-xl border border-(--color-border) bg-(--color-surface) p-1" role="tablist" aria-label="Post editor sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "basic"}
          aria-controls="post-basic-panel"
          onClick={() => setActiveTab("basic")}
          className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${activeTab === "basic" ? "bg-(--color-brand) text-white" : "text-slate-400 hover:text-white"}`}
        >
          Basic
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "editor"}
          aria-controls="post-editor-panel"
          onClick={() => setActiveTab("editor")}
          className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${activeTab === "editor" ? "bg-(--color-brand) text-white" : "text-slate-400 hover:text-white"}`}
        >
          Edit & Preview
        </button>
      </div>

      <section id="post-basic-panel" role="tabpanel" hidden={activeTab !== "basic"} className="max-w-4xl">
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
            <div className="mt-2 max-w-2xl rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-bg) p-4">
              {coverImage && (
                <div
                  role="img"
                  aria-label="Selected cover image"
                  className="mb-4 aspect-video w-full rounded-lg border border-(--color-border) bg-(--color-surface) bg-cover bg-center shadow-sm"
                  style={{ backgroundImage: `url(${JSON.stringify(coverImage)})` }}
                />
              )}
              <div className="flex flex-col gap-3 @min-[640px]:flex-row @min-[640px]:items-center">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-(--color-action) px-4 py-2.5 text-sm font-bold text-white transition hover:bg-(--color-action-hover)">
                  {uploading ? "Uploading…" : coverImage ? "Replace image" : "Upload from computer"}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={uploadCoverImage} className="sr-only" />
                </label>

                {coverImage && <button type="button" onClick={() => setCoverImage("")} className="text-xs font-semibold text-rose-400 hover:text-rose-300 @min-[640px]:ml-auto">Remove</button>}
              </div>
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
      </section>

      <section id="post-editor-panel" role="tabpanel" hidden={activeTab !== "editor"}>
        <div className="article-editor-layout grid min-w-0 items-stretch gap-6">
          <div className="min-w-0">
            <RichTextEditor value={body} onChangeAction={setBody} />
          </div>

          <aside className="article-editor-preview h-full min-w-0">
            <div className="h-full overflow-hidden rounded-2xl border border-(--color-border) bg-[#10151d] shadow-xl">
              <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-3"><p className="text-xs font-bold uppercase tracking-wider text-slate-300">Live preview</p><span className="size-2 rounded-full bg-emerald-400" /></div>
              {coverImage && (
                <div
                  role="img"
                  aria-label="Cover preview"
                  className="aspect-video w-full bg-(--color-bg) bg-cover bg-center"
                  style={{ backgroundImage: `url(${JSON.stringify(coverImage)})` }}
                />
              )}
              <article className="p-6">
                <h1 className="text-3xl font-extrabold leading-tight text-white">{title || "Untitled post"}</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{description || "The article description will appear here."}</p>
                <div className="article-content mt-6 border-t border-(--color-border) pt-6">
                  {body ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown> : <p className="text-slate-500">Start writing to see a live preview.</p>}
                </div>
              </article>
            </div>
          </aside>
        </div>
      </section>

      {article?.affiliateIds.map((id) => <input key={id} type="hidden" name="affiliateIds" value={id} />)}

      <div className="sticky bottom-4 z-30 flex justify-end">
        <button disabled={uploading} className="rounded-lg border border-(--color-brand-border) bg-(--color-brand) px-4 py-2.5 text-xs font-bold text-white shadow-xl hover:bg-(--color-brand-hover) disabled:cursor-wait disabled:opacity-60">Save</button>
      </div>

    </form>
  );
}
