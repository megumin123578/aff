"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Card, Button } from "@/components/ui";

interface CommentSectionProps {
  slug: string;
  title: string;
}

interface LocalComment {
  id: string;
  author: string;
  date: string;
  content: string;
  isAuthor?: boolean;
}

const sampleCommentsBySlug: Record<string, LocalComment[]> = {
  default: [
    {
      id: "1",
      author: "Alex Rivers (Software Engineer)",
      date: "2026-08-21",
      content: "Does the tactile brown switch produce noticeable noise in an open-plan office, or is it quiet enough for daily pair programming?",
    },
    {
      id: "2",
      author: "Neroviax (Admin)",
      date: "2026-08-21",
      isAuthor: true,
      content: "The Pro version comes factory-lubed with internal acoustic sound-dampening foam. It produces a deep, muted 'thock' rather than a high-pitched click, making it completely office-safe!",
    },
  ],
};

export function CommentSection({ slug, title }: CommentSectionProps) {
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const giscusContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`comments_${slug}`);
    if (saved) {
      try {
        setComments(JSON.parse(saved));
      } catch {
        setComments(sampleCommentsBySlug.default);
      }
    } else {
      setComments(sampleCommentsBySlug.default);
    }
  }, [slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newComment: LocalComment = {
        id: Date.now().toString(),
        author: name.trim(),
        date: new Date().toISOString().slice(0, 10),
        content: content.trim(),
      };

      const updated = [...comments, newComment];
      setComments(updated);
      localStorage.setItem(`comments_${slug}`, JSON.stringify(updated));
      setContent("");
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    }, 400);
  };

  return (
    <section className="mt-14 border-t border-[var(--color-border)] pt-10" id="comments">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="azure">Community Q&A</Badge>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Discussion & Questions
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Have questions about <span className="text-slate-200 font-medium">“{title}”</span>? Ask or share your setup below.
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Comment Form */}
      <Card className="mt-6 border-[#2d3541] bg-[#0d1119] p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="comment-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Your Name / Handle
            </label>
            <input
              id="comment-name"
              type="text"
              required
              placeholder="e.g. David (Backend Engineer)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-brand-border)]"
            />
          </div>

          <div>
            <label htmlFor="comment-content" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Comment / Question
            </label>
            <textarea
              id="comment-content"
              required
              rows={3}
              placeholder="Ask about hardware compatibility, cable routing, budget alternatives, or share your experience..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-brand-border)]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-500 font-mono">
              Markdown & code snippets supported.
            </p>
            <Button
              type="submit"
              variant="azure"
              size="medium"
              disabled={isSubmitting || !name.trim() || !content.trim()}
            >
              {isSubmitting ? "Posting..." : "Post Comment →"}
            </Button>
          </div>

          {submitted && (
            <p className="rounded-lg bg-[#0e2a1b] p-3 text-xs font-medium text-[#58bc8c]">
              ✔ Thank you! Your comment has been posted. Our team will reply shortly.
            </p>
          )}
        </form>
      </Card>

      {/* Comment List */}
      <div className="mt-8 space-y-4">
        {comments.map((item) => (
          <Card
            key={item.id}
            className={`p-5 transition ${
              item.isAuthor
                ? "border-[var(--color-brand-border)] bg-[#101726]"
                : "border-[var(--color-border)] bg-[var(--color-surface)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">
                  {item.author}
                </span>
                {item.isAuthor && (
                  <span className="rounded bg-[var(--color-brand)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Author
                  </span>
                )}
              </div>
              <span className="font-mono text-xs text-slate-500">
                {item.date}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {item.content}
            </p>
          </Card>
        ))}
      </div>

      {/* Giscus Container */}
      <div ref={giscusContainerRef} className="mt-10" />
    </section>
  );
}
