import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { getAdminSession } from "@/lib/admin-auth";
import "./globals.css";
import { siteUrl } from "@/lib/seo";

const googleAdSenseAccount =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT ?? "ca-pub-4003831741640664";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "Neroviax — Practical Tech, Hardware & Workspace Gear", template: "%s | Neroviax" },
  description: "Curated tech gear, in-depth reviews, homelab hardware, and minimalist desk setups for developers and builders.",
  openGraph: {
    type: "website",
    siteName: "Neroviax",
    title: "Neroviax — Practical Tech, Hardware & Workspace Gear",
    description: "Curated tech gear, in-depth reviews, homelab hardware, and minimalist desk setups for developers and builders.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Neroviax" }],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
  other: {
    ...(process.env.AWIN_VERIFICATION
      ? { "awin-verification": process.env.AWIN_VERIFICATION }
      : {}),
    ...(googleAdSenseAccount
      ? { "google-adsense-account": googleAdSenseAccount }
      : {}),
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {googleAdSenseAccount ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdSenseAccount}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <AnalyticsPageView />
        <div className="min-h-dvh w-full">
          <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-header)] backdrop-blur-xl">
            <div className="flex h-16 w-full items-center justify-between px-5 lg:px-8">
              <Link href="/" className="flex min-w-0 items-center gap-3 rounded-lg">
                <Image src="/favicon.ico?v=20260815" alt="" width={30} height={30} priority unoptimized className="size-[30px] rounded-lg" />
                <span className="text-xl font-bold tracking-tight text-white">
                  Neroviax
                </span>
              </Link>
              <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
                <Link href="/articles" className="rounded-md transition-colors hover:text-white">Blog</Link>
                <Link href="/articles?category=Desk%20Setup" className="rounded-md transition-colors hover:text-white">Desk Setup</Link>
                <Link href="/articles?category=Homelab" className="rounded-md transition-colors hover:text-white">Mini PC & Homelab</Link>
                <Link href="/articles?category=Keyboards" className="rounded-md transition-colors hover:text-white">Keyboards</Link>
                <Link href="/affiliate-disclosure" className="rounded-md transition-colors hover:text-white">Disclosure</Link>
              </nav>

              <div className="flex items-center gap-3">
                <form action="/search" method="get" className="hidden xl:block">
                  <label className="sr-only" htmlFor="header-search">Search</label>
                  <input id="header-search" name="q" minLength={2} placeholder="Search gear, blog…" className="w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs text-white outline-none focus:w-48 focus:border-[var(--color-brand-border)]" />
                </form>

                {/* User Avatar Circle */}
                <Link
                  href={session ? "/admin" : "/admin/login"}
                  title={session ? `Signed in as ${session.username} (Admin Dashboard)` : "Sign in / Admin"}
                  aria-label={session ? `Signed in as ${session.username}` : "Sign in / Admin"}
                  className="grid size-9 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-slate-300 shadow-sm transition hover:border-[var(--color-brand-border)] hover:bg-[var(--color-surface-muted)] hover:text-white"
                >
                  {session ? (
                    <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-brand)] text-xs font-bold text-white shadow-xs">
                      {session.username.slice(0, 1).toUpperCase()}
                    </span>
                  ) : (
                    <svg className="size-4.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                </Link>

                <details className="group relative md:hidden">
                  <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-white [&::-webkit-details-marker]:hidden">
                    <span className="sr-only">Open navigation menu</span>
                    <span aria-hidden="true" className="text-xl leading-none group-open:hidden">☰</span>
                    <span aria-hidden="true" className="hidden text-xl leading-none group-open:inline">×</span>
                  </summary>
                  <nav
                    aria-label="Mobile navigation"
                    className="absolute right-0 top-12 w-64 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-card)]"
                  >
                    <Link href="/articles" className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[var(--color-surface-muted)]">Blog</Link>
                    <Link href="/articles?category=Desk%20Setup" className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[var(--color-surface-muted)]">Desk Setup</Link>
                    <Link href="/articles?category=Homelab" className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[var(--color-surface-muted)]">Mini PC & Homelab</Link>
                    <Link href="/articles?category=Keyboards" className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[var(--color-surface-muted)]">Keyboards</Link>
                    <Link href="/affiliate-disclosure" className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[var(--color-surface-muted)]">Disclosure</Link>
                    <Link
                      href={session ? "/admin" : "/admin/login"}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[var(--color-surface-muted)]"
                    >
                      <div className="flex size-6 items-center justify-center rounded-full bg-[var(--color-brand-soft)] border border-[var(--color-brand-border)] text-[10px] font-bold text-[var(--color-brand-light)]">
                        {session ? session.username.slice(0, 1).toUpperCase() : "👤"}
                      </div>
                      <span>{session ? `Admin (${session.username})` : "Sign in / Admin"}</span>
                    </Link>
                    <form action="/search" method="get" className="p-2"><input name="q" minLength={2} placeholder="Search gear, blog…" className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white" /></form>
                  </nav>
                </details>
              </div>
            </div>
          </header>

          {children}

          <footer className="border-t border-[var(--color-border)] bg-[var(--color-footer)] px-5 py-10 text-center text-sm text-slate-400">
            <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Neroviax</span>
                <span className="text-slate-600">·</span>
                <span>Curated Tech, Gear & Workspace Guides for Builders</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                <Link href="/about" className="hover:text-slate-300">About</Link>
                <Link href="/contact" className="hover:text-slate-300">Contact</Link>
                <Link href="/methodology" className="hover:text-slate-300">Methodology</Link>
                <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
                <Link href="/terms" className="hover:text-slate-300">Terms</Link>
                <Link href="/affiliate-disclosure" className="hover:text-slate-300">Affiliate disclosure</Link>
                <span>© 2026 Neroviax · Real-world testing before recommendations.</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
