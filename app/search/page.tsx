import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { SearchEvent } from "@/components/search-event";
import { TrackedLink } from "@/components/tracked-link";
import { globalSearch } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search tech gear reviews, homelab articles, and desk setups.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = ((await searchParams).q || "").trim().slice(0, 100);
  const results = await globalSearch(query);

  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Badge variant="azure">Global search</Badge>
        <h1 className="mt-4 text-4xl font-extrabold text-white">Search Neroviax</h1>
        <form method="get" className="mt-7 flex gap-3">
          <input
            autoFocus
            name="q"
            defaultValue={query}
            minLength={2}
            maxLength={100}
            placeholder="Search keychron, monitor, mini pc, desk setup…"
            className="min-w-0 flex-1 rounded-xl border border-(--color-border) bg-[var(--color-bg)] px-4 py-3 text-white outline-none focus:border-[var(--color-brand-border)]"
          />
          <button className="rounded-xl bg-[var(--color-brand)] px-6 py-3 text-sm font-bold text-white">
            Search
          </button>
        </form>
        <SearchEvent query={query} resultCount={results.length} />

        {query.length < 2 ? (
          <Card className="mt-8 p-8 text-center text-sm text-slate-400">
            Enter at least two characters to search gear reviews, guides, and setups.
          </Card>
        ) : (
          <>
            <p className="mt-8 text-sm text-slate-400">
              <strong className="text-white">{results.length}</strong> results for “{query}”
            </p>
            <div className="mt-5 space-y-4">
              {results.map((result) => (
                <Card key={`${result.kind}-${result.href}`} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant={result.kind === "review" ? "mint" : "azure"}>
                        {result.kind}
                      </Badge>
                      <TrackedLink
                        href={result.href}
                        eventName="guide_clicked"
                        eventProperties={{ source: "global-search", query, target: result.href }}
                        className="mt-3 block text-xl font-bold text-white hover:text-[var(--color-brand-light)]"
                      >
                        {result.title}
                      </TrackedLink>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        {result.description}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-slate-500">{result.meta}</span>
                  </div>
                </Card>
              ))}
              {results.length === 0 && (
                <Card className="p-8 text-center">
                  <h2 className="font-bold text-white">No matching content found</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Try searching with another keyword or explore our full article library.
                  </p>
                  <Link
                    href="/posts"
                    className="mt-4 inline-block text-sm text-[var(--color-brand-light)] font-semibold"
                  >
                    Browse all articles →
                  </Link>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
