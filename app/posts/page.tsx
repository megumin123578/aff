import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { getPublishedArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tech Posts — Hardware Reviews & Desk Setups",
  description: "Tested developer hardware, homelab configurations, keyboard reviews, and minimalist desk setups.",
  alternates: { canonical: "/posts" },
};

export const dynamic = "force-dynamic";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [allPosts, query] = await Promise.all([getPublishedArticles(), searchParams]);
  const categories = ["All", ...Array.from(new Set(allPosts.map((post) => post.category)))];
  const posts = query.category ? allPosts.filter((post) => post.category === query.category) : allPosts;

  return (
    <main className="w-full px-5 py-12 lg:px-8 lg:py-16">
      <div className="mb-10">
        <Badge variant="azure">Neroviax Posts</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Tech Posts & Workspace Notes</h1>
      </div>
      <nav aria-label="Post categories" className="mb-10 flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = (category === "All" && !query.category) || category === query.category;
          return <Link key={category} href={category === "All" ? "/posts" : `/posts?category=${encodeURIComponent(category)}`} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-(--color-brand-border) bg-(--color-brand-soft) text-(--color-brand-light)" : "border-(--color-border) text-slate-300 hover:border-(--color-border-strong) hover:text-white"}`}>{category}</Link>;
        })}
      </nav>
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
      ) : <Card className="p-8 text-center"><p className="text-slate-300">No posts found in this category.</p></Card>}
    </main>
  );
}
