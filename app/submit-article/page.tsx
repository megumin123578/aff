import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SubmitArticleForm } from "@/components/submit-article-form";
import { Badge, Card } from "@/components/ui";
import { getAuthSession } from "@/lib/admin-auth";
import { getArticlesByAuthorEmail } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Write & Submit an Article | Neroviax",
  description: "Share your developer desk setups, homelab guides, and keyboard reviews with the Neroviax community.",
};

export default async function SubmitArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const [session, query] = await Promise.all([getAuthSession(), searchParams]);
  const userArticles = session?.email ? await getArticlesByAuthorEmail(session.email) : [];

  return (
    <main className="min-h-[70vh] bg-[var(--color-bg-deep)] px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Posts", path: "/forums" },
            { name: "Submit Article", path: "/submit-article" },
          ]}
        />


        {query.submitted && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 text-emerald-300 animate-in fade-in">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>🎉</span> Article Submitted Successfully!
            </h3>
            <p className="mt-1 text-sm text-slate-300">
              Thank you for contributing! Your article is currently <strong>Pending Review</strong> by our editorial team. You can check the approval status below.
            </p>
          </div>
        )}

        {!session ? (
          /* Sign-in Required Card */
          <Card className="p-8 sm:p-12 text-center border-[#2d3541] bg-[#0d1119]">

            <h2 className="mt-5 text-2xl font-bold text-white">
              Sign in with Google to Write Articles
            </h2>

            <div className="mt-6 flex justify-center">
              <a
                href="/api/auth/google"
                className="inline-flex items-center gap-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand)] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--color-brand-hover)]"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google to Continue</span>
              </a>
            </div>
          </Card>
        ) : (
          /* Submission Form */
          <>
            <SubmitArticleForm session={session} />

            {/* User Previous Submissions */}
            {userArticles.length > 0 && (
              <div className="space-y-4 pt-6">
                <h3 className="text-xl font-bold text-white">Your Submitted Articles</h3>
                <div className="space-y-3">
                  {userArticles.map((art) => (
                    <Card
                      key={art.slug}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {art.status === "published" && <Badge variant="mint">Published</Badge>}
                          {art.status === "pending" && (
                            <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                              Pending Review
                            </span>
                          )}
                          {art.status === "draft" && <Badge variant="default">Draft</Badge>}
                          <span className="text-xs text-slate-500">{art.category}</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{art.title}</h4>
                        <p className="text-xs text-slate-500 font-mono">
                          /{art.slug} · Submitted on {art.updatedAt}
                        </p>
                      </div>

                      {art.status === "published" ? (
                        <Link
                          href={`/forums/${art.slug}`}
                          className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-soft)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--color-brand)]"
                        >
                          View Live Article →
                        </Link>
                      ) : (
                        <span className="text-xs text-amber-400 font-medium">
                          Awaiting Admin Approval
                        </span>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
