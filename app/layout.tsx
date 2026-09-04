import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { AvatarDisplay } from "@/components/avatar-display";
import { HomeFooter } from "@/components/home-footer";
import { UserAvatarDropdown } from "@/components/user-avatar-dropdown";
import { getAuthSession } from "@/lib/admin-auth";
import "./globals.css";
import { siteUrl } from "@/lib/seo";

const primaryNavigation = [
  { href: "/forums", label: "Forums" },
  { href: "/store", label: "Store" },
  { href: "/iphone", label: "iPhone" },
  { href: "/mac", label: "Mac" },
  { href: "/ipad", label: "iPad" },
  { href: "/watch", label: "Watch" },
  { href: "/vision", label: "Vision" },
  { href: "/music-and-tv", label: "Music and TV" },
  { href: "/guides", label: "Guides" },
];

const googleAdSenseAccount =
  process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ACCOUNT ?? "ca-pub-4003831741640664";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "Neroviax — Practical Tech for Builders", template: "%s | Neroviax" },
  description: "In-depth technology reviews, developer insights, and practical guidance for builders.",
  openGraph: {
    type: "website",
    siteName: "Neroviax",
    title: "Neroviax — Practical Tech for Builders",
    description: "In-depth technology reviews, developer insights, and practical guidance for builders.",
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
  const session = await getAuthSession();

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
      <body className="bg-(--color-bg) text-(--color-text) antialiased">
        <AnalyticsPageView />
        <div className="min-h-dvh w-full">
          <header className="sticky top-0 z-50 border-b border-white/8 bg-(--color-header)/95 shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl">
            <div className="flex h-18 w-full items-center gap-3 px-4 sm:px-5 lg:gap-5 lg:px-8">
              <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-(--color-focus)">
                <Image src="/favicon.ico?v=20260815" alt="" width={32} height={32} priority unoptimized className="size-8 rounded-xl shadow-sm" />
                <span className="text-xl font-bold tracking-tight text-white">
                  Neroviax
                </span>
              </Link>
              <nav aria-label="Primary navigation" className="ml-3 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm font-semibold text-slate-300 scrollbar-none md:flex lg:ml-5 lg:gap-2 xl:justify-center [&::-webkit-scrollbar]:hidden">
                {primaryNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative whitespace-nowrap rounded-lg px-3 py-2 transition-all duration-200 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-(--color-brand-light) after:transition-transform after:duration-200 hover:-translate-y-0.5 hover:bg-(--color-brand) hover:text-white hover:shadow-[0_6px_18px_rgba(59,130,246,0.24)] hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-focus)"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="ml-auto flex shrink-0 items-center gap-2 lg:gap-3">
                <form action="/search" method="get" className="hidden xl:block">
                  <label className="sr-only" htmlFor="header-search">Search</label>
                  <input id="header-search" name="q" minLength={2} placeholder="Search gear, posts…" className="w-36 rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-xs text-white outline-none focus:w-48 focus:border-(--color-brand-border)" />
                </form>


                {/* User Avatar Dropdown */}
                <UserAvatarDropdown session={session} />

                <details className="group relative md:hidden">
                  <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-(--color-border) bg-(--color-surface) text-white [&::-webkit-details-marker]:hidden">
                    <span className="sr-only">Open navigation menu</span>
                    <span aria-hidden="true" className="text-xl leading-none group-open:hidden">☰</span>
                    <span aria-hidden="true" className="hidden text-xl leading-none group-open:inline">×</span>
                  </summary>
                  <nav
                    aria-label="Mobile navigation"
                    className="absolute right-0 top-12 w-64 rounded-2xl border border-(--color-border) bg-(--color-surface) p-2 shadow-(--shadow-card)"
                  >
                    {session && (
                      <Link href="/submit-article" className="block rounded-xl bg-(--color-brand) px-4 py-3 text-sm font-bold text-white hover:bg-(--color-brand-hover)">Submit</Link>
                    )}
                    {primaryNavigation.map((item) => (
                      <Link key={item.href} href={item.href} className="group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-200 transition-all duration-200 hover:translate-x-1 hover:bg-(--color-surface-muted) hover:text-white">
                        {item.label}
                        <span aria-hidden="true" className="text-(--color-brand-light) opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">→</span>
                      </Link>
                    ))}
                    {session ? (
                      session.role === "admin" ? (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-(--color-surface-muted)"
                        >
                          <div className="flex size-6 items-center justify-center rounded-full bg-(--color-brand-soft) border border-(--color-brand-border)">
                            <AvatarDisplay avatar={session.avatar} username={session.username} className="size-5" />
                          </div>
                          <span>Admin Dashboard</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-slate-300">
                          <div className="flex size-6 items-center justify-center rounded-full bg-(--color-brand-soft) border border-(--color-brand-border)">
                            <AvatarDisplay avatar={session.avatar} username={session.username} className="size-5" />
                          </div>
                          <span className="truncate">{session.name || session.username}</span>
                        </div>
                      )
                    ) : (
                      <Link
                        href="/admin/login"
                        className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-(--color-surface-muted)"
                      >
                        <svg className="size-4 text-(--color-brand-light)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        <span>Sign in</span>
                      </Link>
                    )}
                    <form action="/search" method="get" className="p-2"><input name="q" minLength={2} placeholder="Search gear, posts…" className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm text-white" /></form>
                  </nav>
                </details>
              </div>
            </div>
          </header>

          {children}

          <HomeFooter />
        </div>
        <div id="modal-root" />
      </body>
    </html>
  );
}
