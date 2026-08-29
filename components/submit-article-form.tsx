"use client";

import { useState } from "react";
import { submitArticleAction } from "@/app/submit-article/actions";
import { AvatarDisplay } from "@/components/avatar-display";
import { Button, Card } from "@/components/ui";

const CATEGORIES = [
  "Desk Setup",
  "Keyboards",
  "Homelab",
  "Hardware",
  "Developer Tools",
  "Software",
  "Reviews",
  "Guides",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-brand-border)]";

export function SubmitArticleForm({
  session,
}: {
  session: {
    username: string;
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [category, setCategory] = useState("Desk Setup");
  const [submitting, setSubmitting] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  return (
    <Card className="p-6 sm:p-8 border-[#2d3541] bg-[#0d1119] shadow-2xl">
      {/* Author Bar */}
      <div className="mb-6 flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-soft)] overflow-hidden">
            <AvatarDisplay avatar={session.avatar} username={session.username} className="size-9" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              {session.name || session.username}
            </p>
            <p className="text-xs text-slate-400">
              Submitting as Community Author · <span className="text-amber-400 font-semibold">Requires Admin Review</span>
            </p>
          </div>
        </div>
      </div>

      <form
        action={submitArticleAction}
        onSubmit={() => setSubmitting(true)}
        className="space-y-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Title */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Article Title *
            </label>
            <input
              required
              name="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. My Minimalist Dual Monitor Setup for Rust & Go"
              className={inputClass}
            />
          </div>

          {/* Slug URL */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Article URL Slug *
              </label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="text-[11px] text-[var(--color-brand-light)] hover:underline"
              >
                {autoSlug ? "Edit slug manually" : "Auto-generate from title"}
              </button>
            </div>
            <div className="mt-2 flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
              <span className="text-xs text-slate-500 font-mono">/posts/</span>
              <input
                required
                name="slug"
                value={slug}
                readOnly={autoSlug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-minimalist-dual-monitor-setup"
                className="w-full bg-transparent text-sm text-white outline-none font-mono read-only:text-slate-300"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Category *
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Tags (comma separated)
            </label>
            <input
              name="tags"
              placeholder="Keyboards, macOS, Productivity, 4K"
              className={inputClass}
            />
          </div>

          {/* Summary Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Summary / Short Description *
            </label>
            <textarea
              required
              name="description"
              rows={2}
              placeholder="A brief 1-2 sentence summary of what this article is about for previews and social sharing."
              className={inputClass}
            />
          </div>

          {/* Cover Image URL */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              name="coverImage"
              placeholder="https://images.unsplash.com/photo-... or your image link"
              className={inputClass}
            />
          </div>
        </div>

        {/* Markdown Body */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Article Content (Markdown format) *
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              Supports headings, code blocks, lists, links, images
            </span>
          </div>
          <textarea
            required
            name="body"
            rows={16}
            placeholder={`## Introduction\n\nShare your experience, review, or setup details here.\n\n### Hardware List\n- Keyboard: Keychron Q1 Pro\n- Display: Dell UltraSharp 32" 4K\n\n### Why I chose this setup\nExplain your reasoning and tips for fellow builders...`}
            className={`${inputClass} font-mono leading-relaxed`}
          />
        </div>

        {/* Review Notice */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
          <p className="font-bold flex items-center gap-1.5">
            <span>🛡️</span> Editorial Review Process
          </p>
          <p className="mt-1 text-slate-300">
            Once submitted, your article will be marked as <strong>Pending Approval</strong>. Our administrators will review the content for clarity and guidelines before publishing it to the public posts.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="azure"
            size="large"
            disabled={submitting}
          >
            {submitting ? "Submitting for review…" : "Submit Article for Approval →"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
