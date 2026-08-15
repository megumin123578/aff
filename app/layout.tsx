import type { Metadata } from "next";
import Link from "next/link";
import { Badge, LinkButton } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neroviax — Practical VPS Infrastructure",
  description: "Practical VPS sizing, self-hosting, and homelab guidance for developers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <div className="min-h-dvh w-full">
          <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-header)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
              <Link href="/" className="flex min-w-0 items-center gap-3 rounded-lg">
                <span className="text-xl font-bold tracking-tight text-white">
                  Neroviax
                </span>
                <Badge variant="azure" className="hidden lg:inline-flex">
                  VPS Engine
                </Badge>
              </Link>
              <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
                <Link href="/articles" className="rounded-md transition-colors hover:text-white">Guides</Link>
                <Link href="/#method" className="rounded-md transition-colors hover:text-white">Method</Link>
                <Link href="/tools/vps-selector" className="rounded-md transition-colors hover:text-white">VPS Calculator</Link>
              </nav>

              <div className="flex items-center gap-2">
                <LinkButton href="/tools/vps-selector" variant="azure" className="hidden shrink-0 sm:inline-flex">
                  Size your VPS →
                </LinkButton>

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
                    <Link href="/articles" className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[var(--color-surface-muted)]">Guides</Link>
                    <Link href="/#method" className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[var(--color-surface-muted)]">Method</Link>
                    <Link href="/tools/vps-selector" className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-[var(--color-surface-muted)]">VPS Calculator</Link>
                    <LinkButton href="/tools/vps-selector" variant="azure" className="mt-2 w-full sm:hidden">
                      Size your VPS →
                    </LinkButton>
                  </nav>
                </details>
              </div>
            </div>
          </header>

          {children}

          <footer className="border-t border-[var(--color-border)] bg-[var(--color-footer)] px-5 py-10 text-center text-sm text-slate-400">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Neroviax</span>
                <span className="text-slate-600">·</span>
                <span>Practical Infrastructure Tools</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                <Link href="/affiliate-disclosure" className="hover:text-slate-300">Affiliate disclosure</Link>
                <span>© 2026 Neroviax · Measurements before marketing.</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
