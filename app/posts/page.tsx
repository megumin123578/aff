import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { getPublishedArticles } from "@/lib/content";
import { getAuthSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Tech Posts — Hardware Reviews & Desk Setups",
  description: "Tested developer hardware, homelab configurations, keyboard reviews, and minimalist desk setups.",
  alternates: { canonical: "/posts" },
};

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const [posts, session] = await Promise.all([getPublishedArticles(), getAuthSession()]);

  return (
    <main className="w-full px-5 py-12 lg:px-8 lg:py-16">
      {session && (
        <div className="mb-8 flex justify-end">
          <Link
            href="/submit-article"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-(--color-brand-border) bg-(--color-brand) px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-(--color-brand-hover) focus:outline-none focus:ring-2 focus:ring-(--color-focus) focus:ring-offset-2 focus:ring-offset-(--color-bg)"
          >
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Submit
          </Link>
        </div>
      )}

      {posts.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`} className="rounded-2xl focus:outline-none focus:ring-2 focus:ring-(--color-focus)">
              <Card className="flex h-full flex-col p-6 transition hover:border-(--color-border-strong) hover:bg-[#121722]">
                <p className="font-mono text-xs font-semibold text-(--color-brand-light)">{post.category}</p>
                <h2 className="mt-4 text-xl font-bold leading-snug text-white">{post.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{post.description}</p>
                <p className="mt-auto pt-6 text-xs text-slate-500">Published {post.publishedAt}</p>
              </Card>
            </Link>
          ))}
        </div>
      ) : <Card className="p-8 text-center"><p className="text-slate-300">No posts available yet.</p></Card>}
    </main>
  );
}
