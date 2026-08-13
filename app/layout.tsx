import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veynor — Practical VPS Infrastructure",
  description: "Practical VPS sizing, self-hosting, and homelab guidance for developers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-jelly-mode="dark" data-scroll-behavior="smooth">
      <head>
        <Script src="https://jelly-ui.com/package.js" type="module" strategy="beforeInteractive" />
      </head>
      <body className="antialiased bg-[#181B1D] text-[#F2F3F7]">
        <jelly-theme mode="dark">
          <header className="sticky top-0 z-50 border-b border-[#343A46] bg-[#181B1D]/85 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-[#0077CC] text-white font-bold text-base shadow-sm">
                  V
                </span>
                <span className="text-xl font-bold tracking-tight text-white">
                  Veynor
                </span>
                <jelly-badge variant="azure" className="hidden lg:inline-block">
                  VPS Engine
                </jelly-badge>
              </Link>
              <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
                <Link href="/#guides" className="hover:text-white transition-colors">Guides</Link>
                <Link href="/#method" className="hover:text-white transition-colors">Method</Link>
                <Link href="/tools/vps-selector" className="hover:text-white transition-colors">VPS Calculator</Link>
              </nav>
              <Link href="/tools/vps-selector" className="shrink-0">
                <jelly-button variant="azure">
                  Size your VPS →
                </jelly-button>
              </Link>
            </div>
          </header>

          {children}

          <footer className="border-t border-[#343A46] bg-[#141719] px-5 py-10 text-center text-sm text-slate-400">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Veynor</span>
                <span className="text-slate-600">·</span>
                <span>Practical Infrastructure Tools</span>
              </div>
              <p className="text-xs text-slate-500">© 2026 Veynor · Measurements before marketing.</p>
            </div>
          </footer>
        </jelly-theme>
      </body>
    </html>
  );
}
