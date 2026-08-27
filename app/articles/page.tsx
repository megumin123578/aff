import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, Chip } from "@/components/ui";
import { getPublishedArticles } from "@/lib/content";
import { absoluteUrl, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tech Blog — Hardware Reviews & Desk Setups",
  description: "Tested developer hardware, homelab configurations, keyboard reviews, and minimalist desk setups.",
  alternates: { canonical: "/articles" },
};

export const dynamic = "force-dynamic";

const categories = ["All", "Desk Setup", "Keyboards", "Homelab", "Hardware", "Audio"];

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const selectedCategory = (await searchParams).category || "All";
  const allArticles = await getPublishedArticles();

  const articles =
    selectedCategory === "All"
      ? allArticles
      : allArticles.filter(
          (a) =>
            a.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            a.tags.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()))
        );

  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: articles.map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: article.title,
            url: absoluteUrl(`/articles/${article.slug}`),
          })),
        })}
      />
      <div className="w-full">
        <Badge variant="azure">Neroviax Blog</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Tech Blog & Workspace Notes
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Tested hardware recommendations, desk setup teardowns, homelab experiments, and honest product reviews.
        </p>

        {/* Category Filter Chips */}
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <Link
                key={cat}
                href={cat === "All" ? "/articles" : `/articles?category=${encodeURIComponent(cat)}`}
              >
                <Chip active={isActive}>{cat}</Chip>
              </Link>
            );
          })}
        </div>

        {/* Articles Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`} className="rounded-2xl">
              <Card className="flex h-full flex-col p-6 transition hover:border-[var(--color-border-strong)] hover:bg-[#121722]">
                <p className="font-mono text-xs font-semibold text-[var(--color-brand-light)]">
                  {article.category}
                </p>
                <h2 className="mt-4 text-xl font-bold leading-snug text-white">
                  {article.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {article.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-6 text-xs text-slate-500 font-mono">
                  <span>{article.publishedAt}</span>
                  <span className="text-[var(--color-brand-light)] font-semibold">
                    Read article & discussion →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
          {articles.length === 0 && (
            <Card className="col-span-full p-12 text-center">
              <h3 className="text-lg font-bold text-white">No articles found in this category</h3>
              <p className="mt-2 text-sm text-slate-400">
                Try selecting &ldquo;All&rdquo; or explore other categories.
              </p>
              <Link
                href="/articles"
                className="mt-5 inline-flex rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-xs font-bold text-white"
              >
                View all articles
              </Link>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
