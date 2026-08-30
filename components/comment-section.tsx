"use client";

import { useEffect, useState } from "react";
import { Badge, Card, Button } from "@/components/ui";
import { AvatarDisplay } from "@/components/avatar-display";

interface UserSessionInfo {
  username: string;
  name?: string;
  avatar?: string;
  role?: "admin" | "user";
}

interface CommentSectionProps {
  slug: string;
  title: string;
  session?: UserSessionInfo | null;
}

interface LocalComment {
  id: string;
  author: string;
  avatar?: string;
  date: string;
  content: string;
  isAuthor?: boolean;
}

const sampleCommentsBySlug: Record<string, LocalComment[]> = {
  default: [
    {
      id: "1",
      author: "Alex Rivers (Software Engineer)",
      avatar: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Astro",
      date: "2026-08-21",
      content: "Does the tactile brown switch produce noticeable noise in an open-plan office, or is it quiet enough for daily pair programming?",
    },
    {
      id: "2",
      author: "Neroviax (Admin)",
      avatar: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=admin",
      date: "2026-08-21",
      isAuthor: true,
      content: "The Pro version comes factory-lubed with internal acoustic sound-dampening foam. It produces a deep, muted 'thock' rather than a high-pitched click, making it completely office-safe!",
    },
  ],
};

export function CommentSection({ slug, title, session }: CommentSectionProps) {
  const [comments, setComments] = useState<LocalComment[]>(sampleCommentsBySlug.default);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(`comments_${slug}`);
        if (saved) setComments(JSON.parse(saved));
      } catch {
        // Keep the server-rendered fallback comments.
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [slug]);

  const authorDisplayName = session?.name || session?.username || "";
  const authorAvatar = session?.avatar || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const finalName = authorDisplayName;
    if (!finalName || !content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newComment: LocalComment = {
        id: Date.now().toString(),
        author: finalName,
        avatar: authorAvatar,
        date: new Date().toISOString().slice(0, 10),
        content: content.trim(),
        isAuthor: session?.role === "admin",
      };

      const updated = [...comments, newComment];
      setComments(updated);
      try {
        localStorage.setItem(`comments_${slug}`, JSON.stringify(updated));
      } catch {
        // storage fallback
      }
      setContent("");
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    }, 300);
  };

  return (
    <section className="mt-14 border-t border-(--color-border) pt-10" id="comments">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="azure">Community Discussion</Badge>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Discussion & Questions
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Have questions about <span className="text-slate-200 font-medium">“{title}”</span>? Share your experience below.
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Comment Form Card */}
      <Card className="mt-6 border-[#2d3541] bg-[#0d1119] p-5 sm:p-6 shadow-xl">
        {session ? (
          /* Logged In User Header */
          <div className="mb-4 flex items-center justify-between border-b border-(--color-border) pb-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full border border-(--color-brand-border) bg-(--color-brand-soft) overflow-hidden">
                <AvatarDisplay avatar={session.avatar} username={session.username} className="size-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">
                  {session.name || session.username}
                </span>
                <span className="text-[11px] text-slate-400">
                  {session.role === "admin" ? (
                    <span className="font-semibold text-(--color-brand-light)">Administrator</span>
                  ) : (
                    <span className="font-semibold text-emerald-400">Community Member</span>
                  )}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Logged in with Google</span>
          </div>
        ) : (
          /* Not Logged In Prompt */
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5">
            <div className="flex items-center gap-2.5">
              <svg className="size-5 text-(--color-brand-light) shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs text-slate-300">Sign in with Google to post comments with your profile avatar:</span>
            </div>
            <a
              href="/api/auth/google"
              className="inline-flex items-center justify-center gap-2 shrink-0 rounded-lg border border-(--color-border-strong) bg-(--color-surface-raised) px-3.5 py-1.5 text-xs font-bold text-white transition hover:border-(--color-brand-border) hover:bg-(--color-surface-muted)"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </a>
          </div>
        )}

        {session ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="comment-content" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Your Comment or Question
              </label>
              <textarea
                id="comment-content"
                required
                rows={3}
                placeholder="Ask about hardware compatibility, keyboard switches, desk setup cable routing, or share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-2 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-3 text-sm text-white outline-none focus:border-(--color-brand-border)"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500 font-mono">
                Markdown & code formatting supported.
              </p>
              <Button
                type="submit"
                variant="azure"
                size="medium"
                disabled={isSubmitting || !content.trim()}
              >
                {isSubmitting ? "Posting…" : "Post Comment →"}
              </Button>
            </div>

            {submitted && (
              <p className="rounded-lg bg-[#0e2a1b] p-3 text-xs font-medium text-[#58bc8c] animate-in fade-in">
                ✔ Thank you! Your comment has been posted successfully.
              </p>
            )}
          </form>
        ) : (
          <p className="text-center text-sm text-slate-400">
            You can read all comments, but you must sign in before posting one.
          </p>
        )}
      </Card>

      {/* Comment List */}
      <div className="mt-8 space-y-4">
        {comments.map((item) => (
          <Card
            key={item.id}
            className={`p-5 transition ${
              item.isAuthor
                ? "border-(--color-brand-border) bg-[#101726]"
                : "border-(--color-border) bg-(--color-surface)"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface-muted) overflow-hidden">
                  <AvatarDisplay avatar={item.avatar} username={item.author} className="size-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">
                      {item.author}
                    </span>
                    {item.isAuthor ? (
                      <span className="rounded bg-(--color-brand) px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Author
                      </span>
                    ) : (
                      <span className="rounded bg-(--color-surface-muted) px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                        Member
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs text-slate-500">
                {item.date}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300 pl-12">
              {item.content}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
